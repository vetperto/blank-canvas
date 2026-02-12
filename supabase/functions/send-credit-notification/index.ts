import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  professionalProfileId: string;
  type: 'low_credits' | 'exhausted' | 'lost_client' | 'credits_reactivated';
  remainingCredits?: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { professionalProfileId, type, remainingCredits }: NotificationRequest = await req.json();

    // Fetch professional details
    const { data: professional, error: profError } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', professionalProfileId)
      .single();

    if (profError || !professional) {
      throw new Error('Professional not found');
    }

    let subject = '';
    let html = '';

    const baseStyles = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    `;

    const buttonStyle = `
      display: inline-block;
      background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
    `;

    switch (type) {
      case 'low_credits':
        subject = '⚠️ Seus créditos estão acabando - VetPerto';
        html = `
          <div style="${baseStyles}">
            <h1 style="color: #f59e0b;">⚠️ Seus créditos estão acabando</h1>
            <p>Olá, ${professional.full_name}!</p>
            <p>Você tem apenas <strong>${remainingCredits} créditos</strong> restantes.</p>
            <p>Quando seus créditos acabarem, seu perfil deixará de receber novos agendamentos, 
            o que pode gerar <strong>perda direta de clientes</strong>.</p>
            <p>Recarregue agora para continuar atendendo sem interrupções.</p>
            <a href="https://vetperto.com.br/planos" style="${buttonStyle}">
              👉 Recarregar créditos
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
              Equipe VetPerto
            </p>
          </div>
        `;
        break;

      case 'exhausted':
        subject = '🚫 Seus agendamentos foram bloqueados - VetPerto';
        html = `
          <div style="${baseStyles}">
            <h1 style="color: #dc2626;">🚫 Seus agendamentos foram bloqueados</h1>
            <p>Olá, ${professional.full_name}!</p>
            <p>Seus créditos acabaram e seu perfil <strong>não está mais recebendo novos agendamentos</strong>.</p>
            <p>Cada minuto sem créditos ativos pode significar clientes perdidos e faturamento interrompido.</p>
            <a href="https://vetperto.com.br/planos" style="${buttonStyle}">
              🔄 Reativar agendamentos agora
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
              Equipe VetPerto
            </p>
          </div>
        `;
        break;

      case 'lost_client':
        subject = '❌ Você perdeu um novo cliente - VetPerto';
        html = `
          <div style="${baseStyles}">
            <h1 style="color: #dc2626;">❌ Você perdeu um novo cliente</h1>
            <p>Olá, ${professional.full_name}!</p>
            <p>Um tutor tentou agendar um atendimento agora, mas <strong>não conseguiu porque seus créditos acabaram</strong>.</p>
            <p>Cada minuto sem créditos ativos pode significar clientes perdidos e faturamento interrompido.</p>
            <a href="https://vetperto.com.br/planos" style="${buttonStyle}">
              🔄 Reativar agendamentos agora
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
              Equipe VetPerto
            </p>
          </div>
        `;
        break;

      case 'credits_reactivated':
        subject = '✅ Seus agendamentos foram reativados - VetPerto';
        html = `
          <div style="${baseStyles}">
            <h1 style="color: #10b981;">✅ Seus agendamentos foram reativados com sucesso!</h1>
            <p>Olá, ${professional.full_name}!</p>
            <p>Seus créditos foram adicionados e seu perfil já está <strong>recebendo novos agendamentos</strong>.</p>
            <p>Continue oferecendo um atendimento de qualidade aos seus clientes!</p>
            <a href="https://vetperto.com.br/profissional" style="${buttonStyle}">
              Ver meu painel
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
              Equipe VetPerto
            </p>
          </div>
        `;
        break;
    }

    // Send email - Remetente oficial padronizado
    const emailResponse = await resend.emails.send({
      from: "VetPerto <contato@vetperto.com>",
      to: [professional.email],
      subject,
      html,
    });

    console.log("Credit notification email sent:", emailResponse);

    // Also create an in-app notification
    await supabaseClient
      .from('user_notifications')
      .insert({
        profile_id: professionalProfileId,
        title: subject.replace(' - VetPerto', ''),
        message: type === 'low_credits' 
          ? `Você tem apenas ${remainingCredits} créditos restantes. Recarregue para continuar atendendo.`
          : type === 'exhausted'
          ? 'Seus créditos acabaram e seu perfil não está recebendo novos agendamentos.'
          : type === 'lost_client'
          ? 'Um tutor tentou agendar um atendimento, mas não conseguiu porque seus créditos acabaram.'
          : 'Seus créditos foram recarregados e você está recebendo novos agendamentos.',
        type: type === 'credits_reactivated' ? 'success' : 'warning',
        action_url: '/planos',
        action_label: type === 'credits_reactivated' ? 'Ver painel' : 'Recarregar créditos',
      });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-credit-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
