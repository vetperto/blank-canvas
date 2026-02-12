import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentNotification {
  appointmentId: string;
}

interface NotificationResult {
  success: boolean;
  appointmentId: string;
  emailSent?: boolean;
  notificationCreated?: boolean;
  error?: string;
}

const formatTime = (time: string) => time?.slice(0, 5) || '';
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const speciesLabels: Record<string, string> = {
  cao: 'Cão',
  gato: 'Gato',
  pequeno_porte: 'Pequeno Porte',
  grande_porte: 'Grande Porte',
  producao: 'Produção',
  silvestre_exotico: 'Silvestre/Exótico',
};

const genderLabels: Record<string, string> = {
  male: 'Macho',
  female: 'Fêmea',
};

const locationLabels: Record<string, string> = {
  clinic: "No consultório",
  home_visit: "Atendimento em domicílio",
  both: "Flexível"
};

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return 'Idade não informada';
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  
  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
  }
  const y = Math.floor(totalMonths / 12);
  return `${y} ${y === 1 ? 'ano' : 'anos'}`;
};

const generateProfessionalEmail = (data: {
  professionalName: string;
  tutorName: string;
  tutorPhone: string | null;
  serviceName: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  locationType: string;
  locationAddress: string | null;
  tutorNotes: string | null;
  pet: {
    name: string;
    species: string;
    breed: string | null;
    birthDate: string | null;
    gender: string | null;
    healthHistory: string | null;
    preferences: string | null;
    photoUrl: string | null;
  } | null;
  vaccines: Array<{
    name: string;
    dateAdministered: string;
    nextDoseDate: string | null;
  }>;
  recentMedicalRecords: Array<{
    title: string;
    recordType: string;
    date: string;
    description: string | null;
  }>;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 24px; }
    .pet-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin: 16px 0; border: 2px solid #f59e0b; }
    .pet-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .pet-avatar { width: 80px; height: 80px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 3px solid #f59e0b; overflow: hidden; }
    .pet-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .pet-info h2 { margin: 0 0 4px; color: #92400e; font-size: 20px; }
    .pet-info p { margin: 0; color: #b45309; font-size: 14px; }
    .pet-badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
    .info-item { background: white; padding: 12px; border-radius: 8px; }
    .info-item label { display: block; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .info-item span { color: #78350f; font-weight: 500; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
    .section-content { background: #f9fafb; border-radius: 8px; padding: 16px; }
    .appointment-card { background: #eff6ff; border-radius: 12px; padding: 16px; margin: 16px 0; border-left: 4px solid #3b82f6; }
    .appointment-card h3 { margin: 0 0 12px; color: #1e40af; font-size: 16px; }
    .detail-row { display: flex; margin: 6px 0; font-size: 14px; }
    .detail-label { color: #6b7280; width: 100px; }
    .detail-value { color: #111827; font-weight: 500; flex: 1; }
    .notes-box { background: #fef3c7; border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 14px; color: #92400e; }
    .vaccine-list, .record-list { list-style: none; padding: 0; margin: 0; }
    .vaccine-list li, .record-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .vaccine-list li:last-child, .record-list li:last-child { border-bottom: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Novo Agendamento Recebido!</h1>
      <p>Você tem uma nova consulta agendada</p>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${data.professionalName}</strong>!</p>
      
      <p>Um novo atendimento foi agendado. Confira todos os detalhes abaixo para se preparar:</p>
      
      <!-- Appointment Info -->
      <div class="appointment-card">
        <h3>📋 Detalhes do Agendamento</h3>
        <div class="detail-row">
          <span class="detail-label">Serviço:</span>
          <span class="detail-value">${data.serviceName || 'Consulta'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data:</span>
          <span class="detail-value">${formatDate(data.appointmentDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Horário:</span>
          <span class="detail-value">${formatTime(data.startTime)} às ${formatTime(data.endTime)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Local:</span>
          <span class="detail-value">${locationLabels[data.locationType] || data.locationType}</span>
        </div>
        ${data.locationAddress ? `
        <div class="detail-row">
          <span class="detail-label">Endereço:</span>
          <span class="detail-value">${data.locationAddress}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Tutor:</span>
          <span class="detail-value">${data.tutorName}${data.tutorPhone ? ` - ${data.tutorPhone}` : ''}</span>
        </div>
      </div>
      
      ${data.tutorNotes ? `
      <div class="notes-box">
        <strong>📝 Observações do tutor:</strong><br>
        ${data.tutorNotes}
      </div>
      ` : ''}
      
      <!-- Pet Card -->
      ${data.pet ? `
      <div class="pet-card">
        <div class="pet-header">
          <div class="pet-avatar">
            ${data.pet.photoUrl ? `<img src="${data.pet.photoUrl}" alt="${data.pet.name}">` : '🐕'}
          </div>
          <div class="pet-info">
            <h2>${data.pet.name}</h2>
            <span class="pet-badge">${speciesLabels[data.pet.species] || data.pet.species}</span>
            <p style="margin-top: 4px;">${data.pet.breed || 'Raça não informada'} • ${calculateAge(data.pet.birthDate)}</p>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <label>Espécie</label>
            <span>${speciesLabels[data.pet.species] || data.pet.species}</span>
          </div>
          <div class="info-item">
            <label>Raça</label>
            <span>${data.pet.breed || 'Não informada'}</span>
          </div>
          <div class="info-item">
            <label>Idade</label>
            <span>${calculateAge(data.pet.birthDate)}</span>
          </div>
          <div class="info-item">
            <label>Sexo</label>
            <span>${data.pet.gender ? genderLabels[data.pet.gender] || data.pet.gender : 'Não informado'}</span>
          </div>
        </div>
        
        ${data.pet.healthHistory ? `
        <div style="margin-top: 16px; background: white; padding: 12px; border-radius: 8px;">
          <label style="display: block; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Histórico de Saúde</label>
          <p style="margin: 0; color: #78350f; font-size: 13px;">${data.pet.healthHistory}</p>
        </div>
        ` : ''}
        
        ${data.pet.preferences ? `
        <div style="margin-top: 12px; background: white; padding: 12px; border-radius: 8px;">
          <label style="display: block; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Preferências e Observações</label>
          <p style="margin: 0; color: #78350f; font-size: 13px;">${data.pet.preferences}</p>
        </div>
        ` : ''}
      </div>
      ` : `
      <div class="notes-box">
        ⚠️ <strong>Atenção:</strong> Nenhum pet foi selecionado para este agendamento.
      </div>
      `}
      
      <!-- Vaccines Section -->
      ${data.vaccines.length > 0 ? `
      <div class="section">
        <div class="section-title">
          💉 Carteira de Vacinação
        </div>
        <div class="section-content">
          <ul class="vaccine-list">
            ${data.vaccines.slice(0, 5).map(v => `
            <li>
              <strong>${v.name}</strong> - ${new Date(v.dateAdministered).toLocaleDateString('pt-BR')}
              ${v.nextDoseDate ? `<br><small style="color: #6b7280;">Próxima dose: ${new Date(v.nextDoseDate).toLocaleDateString('pt-BR')}</small>` : ''}
            </li>
            `).join('')}
          </ul>
          ${data.vaccines.length > 5 ? `<p style="font-size: 12px; color: #6b7280; margin: 8px 0 0;">+ ${data.vaccines.length - 5} vacinas anteriores</p>` : ''}
        </div>
      </div>
      ` : ''}
      
      <!-- Medical Records Section -->
      ${data.recentMedicalRecords.length > 0 ? `
      <div class="section">
        <div class="section-title">
          📋 Histórico Médico Recente
        </div>
        <div class="section-content">
          <ul class="record-list">
            ${data.recentMedicalRecords.map(r => `
            <li>
              <strong>${r.title}</strong> <small style="color: #6b7280;">(${r.recordType})</small>
              <br><small>${new Date(r.date).toLocaleDateString('pt-BR')}</small>
              ${r.description ? `<br><small style="color: #4b5563;">${r.description.slice(0, 100)}${r.description.length > 100 ? '...' : ''}</small>` : ''}
            </li>
            `).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
        Acesse seu painel para ver todos os detalhes e gerenciar este agendamento.
      </p>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
      <p>© ${new Date().getFullYear()} VetPerto - Conectando tutores e profissionais</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const result: NotificationResult = {
    success: false,
    appointmentId: '',
  };

  try {
    const { appointmentId }: AppointmentNotification = await req.json();
    result.appointmentId = appointmentId;

    if (!appointmentId) {
      throw new Error("appointmentId is required");
    }

    console.log(`Processing notification for appointment: ${appointmentId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch appointment with all related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        tutor:profiles!appointments_tutor_profile_id_fkey(id, full_name, email, phone),
        professional:profiles!appointments_professional_profile_id_fkey(id, full_name, email, phone),
        service:services(id, name, duration_minutes),
        pet:pets(*)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error(`Appointment not found: ${appointmentError?.message}`);
    }

    console.log(`Appointment found: ${appointment.id}`);

    // Fetch pet vaccines if pet exists
    let vaccines: any[] = [];
    let medicalRecords: any[] = [];
    
    if (appointment.pet) {
      const { data: vaccineData } = await supabase
        .from('pet_vaccines')
        .select('*')
        .eq('pet_id', appointment.pet.id)
        .order('date_administered', { ascending: false })
        .limit(10);
      
      vaccines = vaccineData || [];

      const { data: recordData } = await supabase
        .from('pet_medical_records')
        .select('*')
        .eq('pet_id', appointment.pet.id)
        .order('date', { ascending: false })
        .limit(5);
      
      medicalRecords = recordData || [];
    }

    // Build email data
    const emailData = {
      professionalName: appointment.professional?.full_name || 'Profissional',
      tutorName: appointment.tutor?.full_name || 'Tutor',
      tutorPhone: appointment.tutor?.phone,
      serviceName: appointment.service?.name,
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      locationType: appointment.location_type,
      locationAddress: appointment.location_address,
      tutorNotes: appointment.tutor_notes,
      pet: appointment.pet ? {
        name: appointment.pet.name,
        species: appointment.pet.species,
        breed: appointment.pet.breed,
        birthDate: appointment.pet.birth_date,
        gender: appointment.pet.gender,
        healthHistory: appointment.pet.health_history,
        preferences: appointment.pet.preferences,
        photoUrl: appointment.pet.photo_url,
      } : null,
      vaccines: vaccines.map(v => ({
        name: v.name,
        dateAdministered: v.date_administered,
        nextDoseDate: v.next_dose_date,
      })),
      recentMedicalRecords: medicalRecords.map(r => ({
        title: r.title,
        recordType: r.record_type,
        date: r.date,
        description: r.description,
      })),
    };

    // Send email to professional
    if (RESEND_API_KEY && appointment.professional?.email) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "VetPerto <contato@vetperto.com>",
            to: [appointment.professional.email],
            subject: `🐾 Novo agendamento: ${appointment.pet?.name || 'Consulta'} - ${formatDate(appointment.appointment_date)}`,
            html: generateProfessionalEmail(emailData),
          }),
        });

        if (emailResponse.ok) {
          result.emailSent = true;
          console.log(`Email sent to ${appointment.professional.email}`);
        } else {
          const errorText = await emailResponse.text();
          console.error(`Email failed: ${errorText}`);
        }
      } catch (emailError: any) {
        console.error(`Email error: ${emailError.message}`);
      }
    }

    // Create in-app notification for professional
    const { error: notifError } = await supabase
      .from('user_notifications')
      .insert({
        profile_id: appointment.professional.id,
        title: 'Novo agendamento recebido',
        message: `${appointment.tutor?.full_name || 'Tutor'} agendou ${appointment.service?.name || 'consulta'} para ${appointment.pet?.name || 'pet'} em ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às ${formatTime(appointment.start_time)}`,
        type: 'appointment',
        related_appointment_id: appointmentId,
        action_url: '/profissional/agendamentos',
        action_label: 'Ver agendamento'
      });

    if (!notifError) {
      result.notificationCreated = true;
      console.log(`In-app notification created`);
    } else {
      console.error(`Notification error: ${notifError.message}`);
    }

    result.success = true;

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-professional-appointment:", error);
    result.error = error.message;
    
    return new Response(
      JSON.stringify(result),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
