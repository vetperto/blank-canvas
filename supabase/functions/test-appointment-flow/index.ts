import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestScenario {
  scenario: 'booking_confirmation' | 'professional_notification' | 'reschedule' | 'cancellation' | 'reminder_24h' | 'reminder_2h' | 'all';
  tutor_email: string;
  professional_email?: string;
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

// E-mail 1: Confirmação de agendamento para o tutor
const generateBookingConfirmationEmail = (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .appointment-card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #10b981; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
    .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Agendamento Confirmado!</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Seu atendimento foi agendado com sucesso</p>
    </div>
    
    <div class="content">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="success-badge">✅ Agendamento Realizado</span>
      </div>
      
      <p>Olá, <strong>${data.tutor_name}</strong>!</p>
      
      <p>Seu agendamento para ${data.pet_name} foi realizado com sucesso. Aguarde a confirmação do profissional.</p>
      
      <div class="appointment-card">
        <h3 style="margin: 0 0 16px; color: #374151;">📋 Detalhes do Agendamento</h3>
        <div class="detail-row">
          <span class="detail-label">🐕 Pet</span>
          <span class="detail-value">${data.pet_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Serviço</span>
          <span class="detail-value">${data.service_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👨‍⚕️ Veterinário</span>
          <span class="detail-value">${data.professional_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Data</span>
          <span class="detail-value">${formatDate(data.appointment_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Horário</span>
          <span class="detail-value">${data.start_time} às ${data.end_time}</span>
        </div>
        <div class="detail-row" style="border: none;">
          <span class="detail-label">📍 Local</span>
          <span class="detail-value">${data.location}</span>
        </div>
      </div>
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <strong>⏳ Próximo passo:</strong><br>
        Aguarde a confirmação do veterinário. Você receberá um e-mail quando o agendamento for confirmado.
      </div>
      
      <div style="text-align: center;">
        <a href="#" class="btn">Ver Meus Agendamentos</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// E-mail 2: Notificação para o veterinário sobre novo agendamento
const generateProfessionalNotificationEmail = (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .appointment-card { background: #eff6ff; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #dbeafe; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
    .new-badge { background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px; }
    .btn-primary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .cta-section { text-align: center; margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📥 Novo Agendamento Recebido!</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Um cliente solicitou atendimento</p>
    </div>
    
    <div class="content">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="new-badge">🆕 Aguardando Confirmação</span>
      </div>
      
      <p>Olá, <strong>Dr(a). ${data.professional_name}</strong>!</p>
      
      <p>Você recebeu uma nova solicitação de agendamento. Confira os detalhes abaixo e confirme ou recuse o atendimento.</p>
      
      <div class="appointment-card">
        <h3 style="margin: 0 0 16px; color: #374151;">📋 Detalhes da Consulta</h3>
        <div class="detail-row">
          <span class="detail-label">👤 Cliente</span>
          <span class="detail-value">${data.tutor_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📞 Telefone</span>
          <span class="detail-value">${data.tutor_phone || 'Não informado'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🐕 Pet</span>
          <span class="detail-value">${data.pet_name} (${data.pet_species})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💼 Serviço</span>
          <span class="detail-value">${data.service_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Data</span>
          <span class="detail-value">${formatDate(data.appointment_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Horário</span>
          <span class="detail-value">${data.start_time} às ${data.end_time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Local</span>
          <span class="detail-value">${data.location}</span>
        </div>
        ${data.notes ? `
        <div class="detail-row" style="border: none;">
          <span class="detail-label">📝 Observações</span>
          <span class="detail-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="cta-section">
        <a href="#" class="btn btn-primary">✅ Confirmar Agendamento</a>
        <a href="#" class="btn btn-secondary">❌ Recusar</a>
      </div>
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <strong>⚠️ Importante:</strong><br>
        Você tem até 24 horas para confirmar este agendamento. Caso contrário, ele será cancelado automaticamente.
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// E-mail 3: Notificação de reagendamento
const generateRescheduleEmail = (data: any, isForTutor: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .change-card { background: #fffbeb; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .old-value { color: #dc2626; text-decoration: line-through; }
    .new-value { color: #059669; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
    .arrow { color: #f59e0b; font-weight: bold; margin: 0 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Agendamento Alterado</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">A data/horário do atendimento foi modificada</p>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${isForTutor ? data.tutor_name : 'Dr(a). ' + data.professional_name}</strong>!</p>
      
      <p>${isForTutor 
        ? 'Seu agendamento foi alterado pelo veterinário. Confira os novos detalhes abaixo:' 
        : 'O cliente solicitou alteração no agendamento. Confira os novos detalhes abaixo:'
      }</p>
      
      <div class="change-card">
        <h3 style="margin: 0 0 16px; color: #374151;">🔄 Alterações Realizadas</h3>
        
        <div style="margin: 16px 0; padding: 12px; background: white; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>📅 Data:</strong></p>
          <span class="old-value">${formatDate(data.old_date)}</span>
          <span class="arrow">→</span>
          <span class="new-value">${formatDate(data.new_date)}</span>
        </div>
        
        <div style="margin: 16px 0; padding: 12px; background: white; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>🕐 Horário:</strong></p>
          <span class="old-value">${data.old_time}</span>
          <span class="arrow">→</span>
          <span class="new-value">${data.new_time}</span>
        </div>
      </div>
      
      <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px;">📋 Detalhes Atualizados:</h4>
        <p style="margin: 4px 0;"><strong>🐕 Pet:</strong> ${data.pet_name}</p>
        <p style="margin: 4px 0;"><strong>💼 Serviço:</strong> ${data.service_name}</p>
        <p style="margin: 4px 0;"><strong>📅 Nova Data:</strong> ${formatDate(data.new_date)}</p>
        <p style="margin: 4px 0;"><strong>🕐 Novo Horário:</strong> ${data.new_time}</p>
        <p style="margin: 4px 0;"><strong>👨‍⚕️ Veterinário:</strong> ${data.professional_name}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// E-mail 4: Notificação de cancelamento
const generateCancellationEmail = (data: any, isForTutor: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .cancelled-card { background: #fef2f2; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Agendamento Cancelado</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">O atendimento foi cancelado</p>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${isForTutor ? data.tutor_name : 'Dr(a). ' + data.professional_name}</strong>!</p>
      
      <p>Infelizmente, o agendamento abaixo foi cancelado ${data.cancelled_by === 'tutor' ? 'pelo cliente' : 'pelo veterinário'}.</p>
      
      <div class="cancelled-card">
        <h3 style="margin: 0 0 16px; color: #374151;">📋 Agendamento Cancelado</h3>
        <p style="margin: 4px 0;"><strong>🐕 Pet:</strong> ${data.pet_name}</p>
        <p style="margin: 4px 0;"><strong>💼 Serviço:</strong> ${data.service_name}</p>
        <p style="margin: 4px 0;"><strong>📅 Data:</strong> ${formatDate(data.appointment_date)}</p>
        <p style="margin: 4px 0;"><strong>🕐 Horário:</strong> ${data.start_time} às ${data.end_time}</p>
        ${data.cancellation_reason ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fecaca;">
          <p style="margin: 0;"><strong>📝 Motivo:</strong> ${data.cancellation_reason}</p>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center;">
        <p>Deseja agendar um novo atendimento?</p>
        <a href="#" class="btn">Agendar Novamente</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// E-mail 5: Lembrete 24h (confirmação de presença)
const generateReminder24hEmail = (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .appointment-card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #6366f1; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px; }
    .btn-primary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .cta-section { text-align: center; margin: 30px 0; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Confirme seu Agendamento</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Falta apenas 1 dia para o atendimento do ${data.pet_name}!</p>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${data.tutor_name}</strong>!</p>
      
      <p>Estamos muito animados para atender ${data.pet_name} amanhã! Para garantir que tudo corra perfeitamente, precisamos da sua confirmação de presença.</p>
      
      <div class="appointment-card">
        <h3 style="margin: 0 0 16px; color: #374151;">📋 Detalhes do Agendamento</h3>
        <p style="margin: 8px 0;"><strong>🐕 Pet:</strong> ${data.pet_name}</p>
        <p style="margin: 8px 0;"><strong>💼 Serviço:</strong> ${data.service_name}</p>
        <p style="margin: 8px 0;"><strong>👨‍⚕️ Profissional:</strong> ${data.professional_name}</p>
        <p style="margin: 8px 0;"><strong>📅 Data:</strong> ${formatDate(data.appointment_date)}</p>
        <p style="margin: 8px 0;"><strong>🕐 Horário:</strong> ${data.start_time} às ${data.end_time}</p>
        <p style="margin: 8px 0;"><strong>📍 Local:</strong> ${data.location}</p>
      </div>
      
      <div class="cta-section">
        <a href="#" class="btn btn-primary">✅ Confirmar Presença</a>
        <br>
        <a href="#" class="btn btn-secondary">📅 Preciso Reagendar</a>
      </div>
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <strong>⚠️ Importante:</strong><br>
        Caso não recebamos sua confirmação, entraremos em contato para verificar se você ainda poderá comparecer.
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// E-mail 6: Lembrete 2h (lembrete final)
const generateReminder2hEmail = (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .urgent-card { background: #ecfdf5; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #10b981; }
    .countdown { font-size: 48px; text-align: center; color: #10b981; font-weight: bold; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Faltam 2 Horas!</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Seu atendimento está chegando</p>
    </div>
    
    <div class="content">
      <div class="countdown">⏱️ 2h</div>
      
      <p>Olá, <strong>${data.tutor_name}</strong>!</p>
      
      <p>Este é um lembrete rápido: o atendimento de <strong>${data.pet_name}</strong> está marcado para daqui a 2 horas!</p>
      
      <div class="urgent-card">
        <h3 style="margin: 0 0 16px; color: #374151;">📋 Resumo Rápido</h3>
        <p style="margin: 8px 0; font-size: 18px;"><strong>🕐 ${data.start_time}</strong></p>
        <p style="margin: 8px 0;"><strong>🐕</strong> ${data.pet_name}</p>
        <p style="margin: 8px 0;"><strong>👨‍⚕️</strong> ${data.professional_name}</p>
        <p style="margin: 8px 0;"><strong>📍</strong> ${data.location}</p>
      </div>
      
      <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <strong>📝 Não esqueça de levar:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px;">
          <li>Carteira de vacinação do pet</li>
          <li>Exames anteriores (se houver)</li>
          <li>Documento de identificação</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo sistema VetPerto.</p>
    </div>
  </div>
</body>
</html>
`;

// Simulação de mensagem SMS/WhatsApp
const generateSMSContent = (scenario: string, data: any): string => {
  switch (scenario) {
    case 'booking_confirmation':
      return `🐾 VetPerto: Agendamento realizado!\n\n📅 ${formatDate(data.appointment_date)}\n🕐 ${data.start_time}\n👨‍⚕️ ${data.professional_name}\n🐕 ${data.pet_name}\n\nAguarde confirmação do veterinário.`;
    
    case 'professional_notification':
      return `📥 VetPerto: Novo agendamento!\n\n👤 ${data.tutor_name}\n🐕 ${data.pet_name}\n📅 ${formatDate(data.appointment_date)}\n🕐 ${data.start_time}\n\nConfirme no app em até 24h.`;
    
    case 'reschedule':
      return `📅 VetPerto: Agendamento alterado!\n\n🐕 ${data.pet_name}\n📅 Nova data: ${formatDate(data.new_date)}\n🕐 Novo horário: ${data.new_time}\n👨‍⚕️ ${data.professional_name}`;
    
    case 'cancellation':
      return `❌ VetPerto: Agendamento cancelado\n\n🐕 ${data.pet_name}\n📅 ${formatDate(data.appointment_date)}\n🕐 ${data.start_time}\n\n${data.cancellation_reason ? `Motivo: ${data.cancellation_reason}` : ''}`;
    
    case 'reminder_24h':
      return `🐾 VetPerto: Lembrete!\n\nSeu atendimento é AMANHÃ:\n📅 ${formatDate(data.appointment_date)}\n🕐 ${data.start_time}\n👨‍⚕️ ${data.professional_name}\n\nConfirme sua presença no app!`;
    
    case 'reminder_2h':
      return `⏰ VetPerto: Faltam 2 HORAS!\n\n🐕 ${data.pet_name}\n🕐 ${data.start_time}\n📍 ${data.location}\n\nNão esqueça a carteira de vacinação!`;
    
    default:
      return '';
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, tutor_email, professional_email }: TestScenario = await req.json();

    if (!tutor_email) {
      return new Response(
        JSON.stringify({ error: "tutor_email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Dados de exemplo para os testes
    const mockData = {
      tutor_name: "Lucas Monteiro",
      tutor_email: tutor_email,
      tutor_phone: "(11) 99999-9999",
      professional_name: "Dra. Maria Silva",
      professional_email: professional_email || tutor_email,
      pet_name: "Rex",
      pet_species: "Cão",
      service_name: "Consulta Domiciliar",
      appointment_date: "2026-01-30",
      start_time: "14:00",
      end_time: "14:30",
      location: "Atendimento em domicílio",
      notes: "Pet está com falta de apetite há 2 dias",
      old_date: "2026-01-29",
      new_date: "2026-01-30",
      old_time: "10:00",
      new_time: "14:00",
      cancellation_reason: "Imprevisto pessoal",
      cancelled_by: "tutor"
    };

    const emailsSent: { to: string; subject: string; scenario: string }[] = [];
    const smsSent: { to: string; message: string; scenario: string }[] = [];
    const errors: string[] = [];

    const sendEmail = async (to: string, subject: string, html: string, scenarioName: string) => {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "VetPerto <contato@vetperto.com>",
            to: [to],
            subject,
            html,
          }),
        });
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Email failed: ${errorText}`);
        }
        
        emailsSent.push({ to, subject, scenario: scenarioName });
      } catch (error: any) {
        errors.push(`${scenarioName}: ${error.message}`);
      }
    };

    const simulateSMS = (to: string, message: string, scenarioName: string) => {
      // Simulação - em produção integraria com Twilio/WhatsApp API
      smsSent.push({ to, message, scenario: scenarioName });
    };

    const scenariosToRun = scenario === 'all' 
      ? ['booking_confirmation', 'professional_notification', 'reschedule', 'cancellation', 'reminder_24h', 'reminder_2h']
      : [scenario];

    for (const s of scenariosToRun) {
      switch (s) {
        case 'booking_confirmation':
          await sendEmail(
            tutor_email,
            `✅ Agendamento realizado para ${mockData.pet_name} - ${formatDate(mockData.appointment_date)}`,
            generateBookingConfirmationEmail(mockData),
            s
          );
          simulateSMS(mockData.tutor_phone, generateSMSContent(s, mockData), s);
          break;

        case 'professional_notification':
          await sendEmail(
            professional_email || tutor_email,
            `📥 Novo agendamento: ${mockData.tutor_name} - ${mockData.pet_name}`,
            generateProfessionalNotificationEmail(mockData),
            s
          );
          simulateSMS("(11) 98888-8888", generateSMSContent(s, mockData), s);
          break;

        case 'reschedule':
          await sendEmail(
            tutor_email,
            `📅 Agendamento alterado para ${mockData.pet_name}`,
            generateRescheduleEmail(mockData, true),
            `${s}_tutor`
          );
          await sendEmail(
            professional_email || tutor_email,
            `📅 Agendamento alterado: ${mockData.tutor_name} - ${mockData.pet_name}`,
            generateRescheduleEmail(mockData, false),
            `${s}_professional`
          );
          simulateSMS(mockData.tutor_phone, generateSMSContent(s, mockData), `${s}_tutor`);
          break;

        case 'cancellation':
          await sendEmail(
            tutor_email,
            `❌ Agendamento cancelado - ${mockData.pet_name}`,
            generateCancellationEmail(mockData, true),
            `${s}_tutor`
          );
          await sendEmail(
            professional_email || tutor_email,
            `❌ Agendamento cancelado: ${mockData.tutor_name} - ${mockData.pet_name}`,
            generateCancellationEmail(mockData, false),
            `${s}_professional`
          );
          simulateSMS(mockData.tutor_phone, generateSMSContent(s, mockData), `${s}_tutor`);
          break;

        case 'reminder_24h':
          await sendEmail(
            tutor_email,
            `🐾 Confirme seu agendamento para amanhã - ${mockData.pet_name}`,
            generateReminder24hEmail(mockData),
            s
          );
          simulateSMS(mockData.tutor_phone, generateSMSContent(s, mockData), s);
          break;

        case 'reminder_2h':
          await sendEmail(
            tutor_email,
            `⏰ Faltam 2 horas! - Atendimento de ${mockData.pet_name}`,
            generateReminder2hEmail(mockData),
            s
          );
          simulateSMS(mockData.tutor_phone, generateSMSContent(s, mockData), s);
          break;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Teste do cenário "${scenario}" executado com sucesso!`,
        emails_sent: emailsSent,
        sms_simulated: smsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in test-appointment-flow:", error);
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
