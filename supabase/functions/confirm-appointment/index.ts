import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmRequest {
  token: string;
  action: 'confirm' | 'reschedule';
}

// Simple in-memory rate limiting (resets on function cold start)
// For production at scale, consider using Redis or database-based rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 attempts per IP per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

function getClientIP(req: Request): string {
  // Try various headers that might contain the real client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    // Check rate limit before processing
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Muitas tentativas. Por favor, aguarde um minuto e tente novamente.",
          retry_after: 60
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "60",
            ...corsHeaders 
          } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { token, action }: ConfirmRequest = await req.json();

    if (!token || !action) {
      console.log(`Invalid request from IP: ${clientIP} - missing token or action`);
      return new Response(
        JSON.stringify({ error: "Token e ação são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the confirmation attempt for audit trail
    console.log(`Confirmation attempt: IP=${clientIP}, action=${action}, token_prefix=${token.substring(0, 8)}...`);

    // Find the confirmation by token
    const { data: confirmation, error: findError } = await supabase
      .from('appointment_confirmations')
      .select('*, appointment:appointments(*)')
      .eq('confirmation_token', token)
      .single();

    if (findError || !confirmation) {
      console.warn(`Invalid token attempt from IP: ${clientIP}, token_prefix=${token.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check token expiration (72 hours from creation)
    const tokenCreatedAt = new Date(confirmation.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);
    const TOKEN_EXPIRATION_HOURS = 72;

    if (hoursSinceCreation > TOKEN_EXPIRATION_HOURS) {
      console.log(`Token expired: created ${hoursSinceCreation.toFixed(1)} hours ago, IP=${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Este link de confirmação expirou. Por favor, entre em contato com o profissional para reagendar.",
          expired: true
        }),
        { status: 410, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already processed
    if (confirmation.confirmed_at || confirmation.reschedule_requested_at) {
      console.log(`Already processed token attempt from IP: ${clientIP}, appointment_id=${confirmation.appointment_id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Este agendamento já foi processado anteriormente",
          already_processed: true
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'confirm') {
      // Update confirmation record with IP for audit
      await supabase
        .from('appointment_confirmations')
        .update({ confirmed_at: new Date().toISOString() })
        .eq('id', confirmation.id);

      // Update appointment status to confirmed
      await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', confirmation.appointment_id);

      // Create notification for professional
      const appointment = confirmation.appointment as any;
      if (appointment) {
        await supabase
          .from('user_notifications')
          .insert({
            profile_id: appointment.professional_profile_id,
            title: 'Agendamento confirmado!',
            message: `O cliente confirmou presença para o atendimento de amanhã.`,
            type: 'success',
            related_appointment_id: appointment.id
          });
      }

      console.log(`Appointment confirmed: appointment_id=${confirmation.appointment_id}, IP=${clientIP}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Presença confirmada com sucesso! Estamos ansiosos para atender você.",
          action: 'confirmed'
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (action === 'reschedule') {
      // Update confirmation record
      await supabase
        .from('appointment_confirmations')
        .update({ reschedule_requested_at: new Date().toISOString() })
        .eq('id', confirmation.id);

      // Create notification for professional about reschedule request
      const appointment = confirmation.appointment as any;
      if (appointment) {
        await supabase
          .from('user_notifications')
          .insert({
            profile_id: appointment.professional_profile_id,
            title: 'Solicitação de reagendamento',
            message: `O cliente solicitou reagendamento para o atendimento de amanhã. Entre em contato.`,
            type: 'warning',
            related_appointment_id: appointment.id
          });
      }

      console.log(`Reschedule requested: appointment_id=${confirmation.appointment_id}, IP=${clientIP}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Sua solicitação de reagendamento foi registrada. O profissional entrará em contato em breve.",
          action: 'reschedule_requested'
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error(`Error in confirm-appointment: ${error.message}, IP=${clientIP}`);
    return new Response(
      JSON.stringify({ error: "Erro interno. Por favor, tente novamente." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
