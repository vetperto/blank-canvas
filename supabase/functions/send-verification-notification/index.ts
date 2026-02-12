import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Remetente oficial padronizado - NÃO ALTERAR
const OFFICIAL_EMAIL_SENDER = "VetPerto <contato@vetperto.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type VerificationStatus = "not_verified" | "under_review" | "verified" | "rejected";

interface NotificationRequest {
  profileId: string;
  newStatus: VerificationStatus;
  oldStatus?: VerificationStatus;
  notes?: string;
}

const statusLabels: Record<VerificationStatus, string> = {
  not_verified: "Não Verificado",
  under_review: "Em Análise",
  verified: "Verificado",
  rejected: "Rejeitado",
};

const statusEmojis: Record<VerificationStatus, string> = {
  not_verified: "📋",
  under_review: "🔍",
  verified: "✅",
  rejected: "❌",
};

const generateVerificationEmail = (
  professionalName: string,
  newStatus: VerificationStatus,
  notes?: string
) => {
  const statusLabel = statusLabels[newStatus];
  const emoji = statusEmojis[newStatus];
  
  let message = "";
  let ctaText = "";
  let ctaUrl = "https://vetperto.com.br/profissional/dashboard";
  let additionalInfo = "";
  
  switch (newStatus) {
    case "under_review":
      message = `Recebemos sua solicitação de verificação e ela está sendo analisada pela nossa equipe.
      
      Estamos verificando seus documentos e informações. Este processo pode levar de 1 a 3 dias úteis.`;
      ctaText = "Acompanhar Status";
      additionalInfo = "Você receberá um e-mail assim que a análise for concluída.";
      break;
      
    case "verified":
      message = `Parabéns! Seu perfil foi verificado com sucesso! 🎉
      
      Agora você conta com o selo de profissional verificado, que aumenta a confiança dos tutores e destaca seu perfil nas buscas.`;
      ctaText = "Ver Meu Perfil";
      additionalInfo = "Seu perfil agora aparece nas buscas públicas e está pronto para receber novos clientes!";
      break;
      
    case "rejected":
      message = `Infelizmente, sua solicitação de verificação não foi aprovada neste momento.`;
      ctaText = "Verificar Documentos";
      ctaUrl = "https://vetperto.com.br/profissional/documentos";
      additionalInfo = notes 
        ? `Motivo: ${notes}`
        : "Por favor, verifique se seus documentos estão legíveis e atualizados, e solicite uma nova verificação.";
      break;
      
    case "not_verified":
      message = `O status de verificação do seu perfil foi resetado.
      
      Isso pode acontecer quando há necessidade de atualização de documentos ou por solicitação administrativa.`;
      ctaText = "Solicitar Nova Verificação";
      ctaUrl = "https://vetperto.com.br/profissional/documentos";
      additionalInfo = notes || "Por favor, verifique seus documentos e solicite uma nova verificação.";
      break;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f5f5f5; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
    }
    .header { 
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 600; 
    }
    .header p { 
      margin: 10px 0 0; 
      opacity: 0.9; 
      font-size: 14px; 
    }
    .content { 
      padding: 30px; 
    }
    .greeting { 
      font-size: 18px; 
      margin-bottom: 20px; 
    }
    .status-card { 
      background: #f9fafb; 
      border-radius: 12px; 
      padding: 24px; 
      margin: 20px 0; 
      border-left: 4px solid ${newStatus === 'verified' ? '#10b981' : newStatus === 'rejected' ? '#ef4444' : '#6366f1'}; 
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      background: ${newStatus === 'verified' ? '#d1fae5' : newStatus === 'rejected' ? '#fee2e2' : newStatus === 'under_review' ? '#e0e7ff' : '#f3f4f6'};
      color: ${newStatus === 'verified' ? '#065f46' : newStatus === 'rejected' ? '#991b1b' : newStatus === 'under_review' ? '#3730a3' : '#374151'};
    }
    .message { 
      margin: 20px 0;
      white-space: pre-line;
    }
    .cta-section { 
      text-align: center; 
      margin: 30px 0; 
    }
    .btn { 
      display: inline-block; 
      padding: 14px 32px; 
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600; 
      font-size: 14px; 
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
      color: white; 
    }
    .info-box { 
      background: ${newStatus === 'verified' ? '#d1fae5' : newStatus === 'rejected' ? '#fee2e2' : '#e0e7ff'}; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 20px 0; 
      font-size: 14px; 
      color: ${newStatus === 'verified' ? '#065f46' : newStatus === 'rejected' ? '#991b1b' : '#3730a3'}; 
    }
    .footer { 
      background: #f9fafb; 
      padding: 20px 30px; 
      text-align: center; 
      font-size: 12px; 
      color: #6b7280; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 VetPerto</h1>
      <p>Atualização do Status de Verificação</p>
    </div>
    
    <div class="content">
      <p class="greeting">Olá, <strong>${professionalName}</strong>!</p>
      
      <div class="status-card">
        <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">Novo status do seu perfil:</p>
        <span class="status-badge">${emoji} ${statusLabel}</span>
      </div>
      
      <p class="message">${message}</p>
      
      <div class="info-box">
        ${additionalInfo}
      </div>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="btn">${ctaText}</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
      <p>© ${new Date().getFullYear()} VetPerto. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, newStatus, oldStatus, notes }: NotificationRequest = await req.json();

    if (!profileId || !newStatus) {
      return new Response(
        JSON.stringify({ error: "profileId and newStatus are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Skip if status hasn't changed
    if (oldStatus === newStatus) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Status unchanged" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get professional data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, social_name, email")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const professionalName = profile.social_name || profile.full_name;
    const professionalEmail = profile.email;

    if (!professionalEmail) {
      return new Response(
        JSON.stringify({ error: "Professional email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if RESEND_API_KEY is configured
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      
      // Still create in-app notification even without email
      await supabase.from("user_notifications").insert({
        profile_id: profileId,
        title: `Status de Verificação: ${statusLabels[newStatus]}`,
        message: `Seu perfil agora está com status "${statusLabels[newStatus]}".`,
        type: "info", // Valid types: info, warning, success, appointment, reminder, confirmation
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: false, 
          notificationCreated: true,
          reason: "RESEND_API_KEY not configured" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email
    const emailSubject = `${statusEmojis[newStatus]} ${statusLabels[newStatus]} - Verificação VetPerto`;
    const emailHtml = generateVerificationEmail(professionalName, newStatus, notes);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: OFFICIAL_EMAIL_SENDER,
        to: [professionalEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    let emailSent = false;
    if (emailResponse.ok) {
      emailSent = true;
      console.log(`Verification notification sent to ${professionalEmail}`);
    } else {
      const errorText = await emailResponse.text();
      console.error(`Failed to send email: ${errorText}`);
    }

    // Create in-app notification
    // Valid notification types: info, warning, success, appointment, reminder, confirmation
    const notificationType = newStatus === 'verified' ? 'success' : 
                             newStatus === 'rejected' ? 'warning' : 'info';
    
    const { error: notifError } = await supabase.from("user_notifications").insert({
      profile_id: profileId,
      title: `Status de Verificação: ${statusLabels[newStatus]}`,
      message: `Seu perfil agora está com status "${statusLabels[newStatus]}".${notes ? ` Observação: ${notes}` : ''}`,
      type: notificationType,
    });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        notificationCreated: !notifError,
        sentTo: professionalEmail,
        newStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
