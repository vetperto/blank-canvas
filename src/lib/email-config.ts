// =============================================
// CONFIGURAÇÃO CENTRALIZADA DE EMAIL - RESEND
// =============================================

/**
 * Configuração de domínio para envio de emails via Resend.
 * 
 * IMPORTANTE: Para que os emails funcionem para qualquer destinatário,
 * você precisa verificar seu domínio no Resend Dashboard:
 * https://resend.com/domains
 * 
 * Registros DNS necessários:
 * - SPF (TXT): Fornecido pelo Resend
 * - DKIM (CNAME): Fornecido pelo Resend
 * - DMARC (TXT): v=DMARC1; p=none;
 */

// ==========================================================================
// REMETENTE GLOBAL OFICIAL - TODOS OS E-MAILS DEVEM USAR ESTE REMETENTE
// ==========================================================================
// ⚠️ IMPORTANTE: NÃO ALTERE ESTE VALOR SEM AUTORIZAÇÃO
// Todos os e-mails transacionais e automáticos do sistema VetPerto
// DEVEM usar exclusivamente o remetente oficial abaixo.
// ==========================================================================

export const OFFICIAL_EMAIL_SENDER = 'VetPerto <contato@vetperto.com>';
export const OFFICIAL_EMAIL_ADDRESS = 'contato@vetperto.com';
export const OFFICIAL_EMAIL_NAME = 'VetPerto';

// Domínio verificado no Resend (para referência)
export const EMAIL_DOMAIN = 'vetperto.com' as string;

// Verifica se o domínio está configurado (não é o sandbox padrão)
export const isDomainVerified = (): boolean => {
  return EMAIL_DOMAIN !== 'resend.dev' && !EMAIL_DOMAIN.includes('onboarding@resend.dev');
};

/**
 * ⚠️ REMETENTES PADRONIZADOS - TODOS USAM O REMETENTE OFICIAL
 * 
 * Mantido para compatibilidade com código legado, mas TODOS
 * os valores agora apontam para o remetente oficial único.
 * 
 * Use getOfficialSender() para obter o remetente em qualquer contexto.
 */
export const EMAIL_SENDERS = {
  // Todos os tipos de email usam o remetente oficial único
  appointments: OFFICIAL_EMAIL_SENDER,
  notifications: OFFICIAL_EMAIL_SENDER,
  auth: OFFICIAL_EMAIL_SENDER,
  support: OFFICIAL_EMAIL_SENDER,
  system: OFFICIAL_EMAIL_SENDER,
  health: OFFICIAL_EMAIL_SENDER,
  finance: OFFICIAL_EMAIL_SENDER,
  marketing: OFFICIAL_EMAIL_SENDER,
  credits: OFFICIAL_EMAIL_SENDER,
  verification: OFFICIAL_EMAIL_SENDER,
} as const;

export type EmailSenderType = keyof typeof EMAIL_SENDERS;

/**
 * Retorna o remetente oficial - SEMPRE o mesmo valor
 * Mantido para compatibilidade, mas todos os tipos retornam o mesmo remetente
 */
export const getEmailSender = (_type?: EmailSenderType): string => {
  return OFFICIAL_EMAIL_SENDER;
};

/**
 * Função principal para obter o remetente oficial
 * Use esta função em todas as edge functions e serviços de email
 */
export const getOfficialSender = (): string => {
  return OFFICIAL_EMAIL_SENDER;
};

/**
 * Valida que o remetente usado é o oficial
 * Use para auditar e garantir conformidade
 */
export const validateSender = (sender: string): boolean => {
  return sender === OFFICIAL_EMAIL_SENDER;
};

/**
 * Templates de assunto para emails padrão
 */
export const EMAIL_SUBJECTS = {
  // Agendamentos
  appointmentConfirmation: (petName: string) => 
    `✅ Agendamento confirmado para ${petName}`,
  appointmentReminder24h: (petName: string) => 
    `⏰ Lembrete: Consulta de ${petName} amanhã`,
  appointmentReminder2h: (petName: string) => 
    `🔔 Sua consulta com ${petName} é daqui a 2 horas`,
  appointmentCancelled: (petName: string) => 
    `❌ Agendamento de ${petName} cancelado`,
  appointmentRescheduled: (petName: string) => 
    `📅 Agendamento de ${petName} reagendado`,
  
  // Profissional
  newAppointmentProfessional: (tutorName: string) => 
    `🆕 Novo agendamento de ${tutorName}`,
  appointmentCancelledProfessional: (tutorName: string) => 
    `❌ ${tutorName} cancelou o agendamento`,
  
  // Saúde
  vaccineReminder: (petName: string, daysUntil: number) => 
    `🐾 Lembrete: Vacina de ${petName} vence em ${daysUntil} dias`,
  
  // Autenticação
  passwordReset: () => 'Redefinição de senha - VetPerto',
  emailVerification: () => 'Confirme seu email - VetPerto',
  welcomeEmail: (userName: string) => `Bem-vindo ao VetPerto, ${userName}! 🎉`,
} as const;

/**
 * Configuração para validação de domínio antes do envio
 */
export const validateEmailConfig = (): { valid: boolean; message: string } => {
  if (!EMAIL_DOMAIN || EMAIL_DOMAIN === 'resend.dev' as string) {
    return {
      valid: false,
      message: 'Domínio de email não configurado. Configure EMAIL_DOMAIN em src/lib/email-config.ts',
    };
  }
  
  return { valid: true, message: 'Configuração de email válida' };
};

/**
 * Cores e estilos para templates de email HTML
 */
export const EMAIL_STYLES = {
  colors: {
    primary: '#6366f1',
    primaryGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    secondary: '#10b981',
    background: '#f9fafb',
    text: '#333333',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
  },
} as const;
