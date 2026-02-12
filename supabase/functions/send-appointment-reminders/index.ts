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

const locationLabels: Record<string, string> = {
  clinic: "No consultório",
  home_visit: "Atendimento em domicílio",
  both: "Flexível"
};

const generateReminderEmail = (data: AppointmentData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header .countdown { font-size: 48px; font-weight: 700; margin: 16px 0; }
    .header p { margin: 10px 0 0; opacity: 0.95; font-size: 16px; }
    .content { padding: 30px; }
    .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; border: 2px solid #f59e0b; }
    .highlight-box h2 { margin: 0 0 8px; color: #92400e; font-size: 20px; }
    .highlight-box .time { font-size: 32px; font-weight: 700; color: #d97706; }
    .appointment-card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .appointment-card h3 { margin: 0 0 16px; color: #374151; font-size: 16px; font-weight: 600; }
    .detail-row { display: flex; margin: 8px 0; }
    .detail-label { color: #6b7280; width: 120px; font-size: 14px; }
    .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
    .message-box { background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .message-box p { margin: 0; color: #065f46; font-size: 16px; }
    .message-box .emoji { font-size: 32px; margin-bottom: 12px; }
    .tips { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .tips h4 { margin: 0 0 12px; color: #374151; font-size: 14px; }
    .tips ul { margin: 0; padding-left: 20px; }
    .tips li { color: #6b7280; font-size: 13px; margin: 4px 0; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Lembrete: Faltam 2 horas!</h1>
      <div class="countdown">2h</div>
      <p>Não se esqueça do seu agendamento!</p>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${data.tutor_name}</strong>!</p>
      
      <div class="message-box">
        <div class="emoji">🐾✨</div>
        <p><strong>Faltam apenas 2h para o atendimento!</strong><br>
        Será um momento muito especial para ${data.pet_name || 'seu pet'}!</p>
      </div>
      
      <div class="highlight-box">
        <h2>Seu horário</h2>
        <div class="time">${formatTime(data.start_time)}</div>
      </div>
      
      <div class="appointment-card">
        <h3>📋 Resumo do Agendamento</h3>
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
          <span class="detail-label">📍 Local:</span>
          <span class="detail-value">${locationLabels[data.location_type] || data.location_type}</span>
        </div>
      </div>
      
      <div class="tips">
        <h4>💡 Dicas para o atendimento:</h4>
        <ul>
          <li>Chegue com 10 minutos de antecedência</li>
          <li>Traga a carteirinha de vacinação do pet</li>
          <li>Anote quaisquer sintomas ou comportamentos recentes</li>
          <li>Mantenha seu pet calmo e confortável</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
      <p>Estamos ansiosos para atender ${data.pet_name || 'seu pet'}! 🐾</p>
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
    console.error("Unauthorized request to send-appointment-reminders");
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

    // Get appointments needing 2h reminder
    const { data: appointments, error: appointmentsError } = await supabase
      .rpc('get_appointments_needing_reminder');

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments needing 2h reminder`);

    const emailsSent: string[] = [];
    const notificationsCreated: string[] = [];
    const errors: string[] = [];

    for (const appointment of appointments || []) {
      const typedAppointment = appointment as AppointmentData;
      
      // Create reminder record
      const { error: confirmError } = await supabase
        .from('appointment_confirmations')
        .insert({
          appointment_id: typedAppointment.appointment_id,
          confirmation_type: '2h'
        });

      if (confirmError && !confirmError.message.includes('duplicate')) {
        console.error(`Error creating reminder for ${typedAppointment.appointment_id}:`, confirmError);
        errors.push(`${typedAppointment.tutor_email}: ${confirmError.message}`);
        continue;
      }

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
            subject: `⏰ Lembrete: Faltam 2h para o atendimento de ${typedAppointment.pet_name || 'seu pet'}!`,
            html: generateReminderEmail(typedAppointment),
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Email failed: ${errorText}`);
        }

        // Update reminder record with email sent timestamp
        await supabase
          .from('appointment_confirmations')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('appointment_id', typedAppointment.appointment_id)
          .eq('confirmation_type', '2h');

        emailsSent.push(typedAppointment.tutor_email);

        // Create in-app notification (max 110 chars)
        const { data: tutorProfile } = await supabase
          .from('appointments')
          .select('tutor_profile_id')
          .eq('id', typedAppointment.appointment_id)
          .single();

        if (tutorProfile) {
          // Push notification text (max 110 chars)
          const pushMessage = `⏰ Faltam 2h! ${typedAppointment.service_name || 'Consulta'} às ${formatTime(typedAppointment.start_time)} - ${typedAppointment.professional_name}`.slice(0, 110);

          await supabase
            .from('user_notifications')
            .insert({
              profile_id: tutorProfile.tutor_profile_id,
              title: 'Lembrete: Faltam 2 horas!',
              message: pushMessage,
              type: 'reminder',
              related_appointment_id: typedAppointment.appointment_id
            });

          notificationsCreated.push(tutorProfile.tutor_profile_id);
        }

        console.log(`Reminder sent to ${typedAppointment.tutor_email}`);
      } catch (emailError: any) {
        console.error(`Error sending reminder to ${typedAppointment.tutor_email}:`, emailError);
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
    console.error("Error in send-appointment-reminders:", error);
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
