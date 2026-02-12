import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentData {
  appointment_id: string;
  tutor_name: string;
  tutor_email: string;
  professional_name: string;
  pet_name: string | null;
  service_name: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  location_type: string;
}

const formatTime = (time: string) => time.slice(0, 5);
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const locationLabels: Record<string, string> = {
  clinic: "No consultório",
  home_visit: "Atendimento em domicílio",
  both: "Flexível"
};

const generateConfirmationEmail = (data: AppointmentData, confirmUrl: string, rescheduleUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .appointment-card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #6366f1; }
    .appointment-card h3 { margin: 0 0 16px; color: #374151; font-size: 16px; font-weight: 600; }
    .detail-row { display: flex; margin: 8px 0; }
    .detail-label { color: #6b7280; width: 120px; font-size: 14px; }
    .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
    .cta-section { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px; }
    .btn-primary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .note { background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #92400e; }
    .note strong { display: block; margin-bottom: 4px; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
    .emoji { font-size: 20px; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Confirme seu Agendamento</h1>
      <p>Falta apenas 1 dia para o atendimento do ${data.pet_name || 'seu pet'}!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Olá, <strong>${data.tutor_name}</strong>!</p>
      
      <p>Estamos muito animados para atender ${data.pet_name || 'seu pet'} amanhã! Para garantir que tudo corra perfeitamente, precisamos da sua confirmação de presença.</p>
      
      <div class="appointment-card">
        <h3>📋 Detalhes do Agendamento</h3>
        <div class="detail-row">
          <span class="detail-label">🐕 Pet:</span>
          <span class="detail-value">${data.pet_name || 'Não informado'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Serviço:</span>
          <span class="detail-value">${data.service_name || 'Consulta'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👨‍⚕️ Profissional:</span>
          <span class="detail-value">${data.professional_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Data:</span>
          <span class="detail-value">${formatDate(data.appointment_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Horário:</span>
          <span class="detail-value">${formatTime(data.start_time)} às ${formatTime(data.end_time)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Local:</span>
          <span class="detail-value">${locationLabels[data.location_type] || data.location_type}</span>
        </div>
      </div>
      
      <div class="cta-section">
        <a href="${confirmUrl}" class="btn btn-primary">✅ Confirmar Presença</a>
        <br>
        <a href="${rescheduleUrl}" class="btn btn-secondary">📅 Preciso Reagendar</a>
      </div>
      
      <div class="note">
        <strong>⚠️ Importante:</strong>
        Caso não recebamos sua confirmação, entraremos em contato para verificar se você ainda poderá comparecer. Agradecemos sua compreensão!
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Estamos preparando tudo com carinho para receber ${data.pet_name || 'seu pet'}. Se tiver alguma dúvida ou precisar de algo especial, não hesite em nos contatar.
      </p>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
      <p>Se você não reconhece este agendamento, por favor ignore este e-mail.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for authentication
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  
  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized request to send-appointment-confirmations");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get appointments needing 24h confirmation
    const { data: appointments, error: appointmentsError } = await supabase
      .rpc('get_appointments_needing_confirmation');

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments needing confirmation`);

    const emailsSent: string[] = [];
    const notificationsCreated: string[] = [];
    const errors: string[] = [];

    for (const appointment of appointments || []) {
      const typedAppointment = appointment as AppointmentData;
      
      // Create confirmation token record
      const { data: confirmation, error: confirmError } = await supabase
        .from('appointment_confirmations')
        .insert({
          appointment_id: typedAppointment.appointment_id,
          confirmation_type: '24h'
        })
        .select('confirmation_token')
        .single();

      if (confirmError) {
        console.error(`Error creating confirmation for ${typedAppointment.appointment_id}:`, confirmError);
        errors.push(`${typedAppointment.tutor_email}: ${confirmError.message}`);
        continue;
      }

      const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://vetperto.lovable.app';
      const confirmUrl = `${baseUrl}/confirmar-agendamento?token=${confirmation.confirmation_token}&action=confirm`;
      const rescheduleUrl = `${baseUrl}/confirmar-agendamento?token=${confirmation.confirmation_token}&action=reschedule`;

      try {
        // Send email
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "VetPerto <contato@vetperto.com>",
            to: [typedAppointment.tutor_email],
            subject: `🐾 Confirme seu agendamento para amanhã - ${typedAppointment.pet_name || 'seu pet'}`,
            html: generateConfirmationEmail(typedAppointment, confirmUrl, rescheduleUrl),
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Email failed: ${errorText}`);
        }

        // Update confirmation record with email sent timestamp
        await supabase
          .from('appointment_confirmations')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('appointment_id', typedAppointment.appointment_id)
          .eq('confirmation_type', '24h');

        emailsSent.push(typedAppointment.tutor_email);

        // Create in-app notification
        const { data: tutorProfile } = await supabase
          .from('appointments')
          .select('tutor_profile_id')
          .eq('id', typedAppointment.appointment_id)
          .single();

        if (tutorProfile) {
          await supabase
            .from('user_notifications')
            .insert({
              profile_id: tutorProfile.tutor_profile_id,
              title: 'Confirme seu agendamento',
              message: `Amanhã às ${formatTime(typedAppointment.start_time)} - ${typedAppointment.service_name || 'Consulta'} com ${typedAppointment.professional_name}`,
              type: 'confirmation',
              related_appointment_id: typedAppointment.appointment_id,
              action_url: confirmUrl,
              action_label: 'Confirmar Presença'
            });

          notificationsCreated.push(tutorProfile.tutor_profile_id);
        }

        console.log(`Confirmation sent to ${typedAppointment.tutor_email}`);
      } catch (emailError: any) {
        console.error(`Error sending confirmation to ${typedAppointment.tutor_email}:`, emailError);
        errors.push(`${typedAppointment.tutor_email}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        notificationsCreated: notificationsCreated.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-confirmations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
