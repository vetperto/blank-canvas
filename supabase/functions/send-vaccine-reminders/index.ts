import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VaccineReminder {
  pet_name: string;
  pet_species: string;
  vaccine_name: string;
  next_dose_date: string;
  tutor_name: string;
  tutor_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for authentication
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  
  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized request to send-vaccine-reminders");
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

    // Find vaccines with next_dose_date in the next 7 days
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const { data: upcomingVaccines, error: vaccinesError } = await supabase
      .from("pet_vaccines")
      .select(`
        id,
        name,
        next_dose_date,
        pet:pets!pet_vaccines_pet_id_fkey(
          id,
          name,
          species,
          profile:profiles!pets_profile_id_fkey(
            full_name,
            email
          )
        )
      `)
      .gte("next_dose_date", today.toISOString().split("T")[0])
      .lte("next_dose_date", sevenDaysFromNow.toISOString().split("T")[0]);

    if (vaccinesError) {
      console.error("Error fetching vaccines:", vaccinesError);
      throw vaccinesError;
    }

    console.log(`Found ${upcomingVaccines?.length || 0} vaccines due in next 7 days`);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const vaccine of upcomingVaccines || []) {
      const pet = vaccine.pet as any;
      const profile = pet?.profile;

      if (!profile?.email) {
        console.log(`Skipping vaccine ${vaccine.id}: no tutor email`);
        continue;
      }

      const daysUntilDue = Math.ceil(
        (new Date(vaccine.next_dose_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const speciesNames: Record<string, string> = {
        cao: "cachorro",
        gato: "gato",
        pequeno_porte: "pet de pequeno porte",
        grande_porte: "pet de grande porte",
        producao: "animal de produção",
        silvestre_exotico: "pet silvestre/exótico",
      };

      const petSpecies = speciesNames[pet.species] || "pet";

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "VetPerto <contato@vetperto.com>",
            to: [profile.email],
            subject: `🐾 Lembrete: Vacina de ${pet.name} vence em ${daysUntilDue} dias`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
                  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🐾 Lembrete de Vacina</h1>
                  </div>
                  <div class="content">
                    <p>Olá, <strong>${profile.full_name}</strong>!</p>
                    
                    <p>Este é um lembrete carinhoso sobre a próxima vacina do seu ${petSpecies}.</p>
                    
                    <div class="info-box">
                      <p><strong>🐕 Pet:</strong> ${pet.name}</p>
                      <p><strong>💉 Vacina:</strong> ${vaccine.name}</p>
                      <p><strong>📅 Data prevista:</strong> ${new Date(vaccine.next_dose_date!).toLocaleDateString("pt-BR")}</p>
                      <p><strong>⏰ Vence em:</strong> ${daysUntilDue} ${daysUntilDue === 1 ? "dia" : "dias"}</p>
                    </div>
                    
                    <p>Manter as vacinas em dia é essencial para a saúde e bem-estar do ${pet.name}. Não deixe para a última hora!</p>
                    
                    <div class="footer">
                      <p>Este email foi enviado automaticamente pelo sistema VetPerto.</p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Email failed: ${errorText}`);
        }

        const emailData = await emailResponse.json();
        console.log(`Email sent to ${profile.email}:`, emailData);
        emailsSent.push(profile.email);
      } catch (emailError: any) {
        console.error(`Error sending email to ${profile.email}:`, emailError);
        errors.push(`${profile.email}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-vaccine-reminders:", error);
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
