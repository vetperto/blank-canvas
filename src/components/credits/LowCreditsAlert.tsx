import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfessionalCredits } from '@/hooks/useProfessionalCredits';
import { useNavigate } from 'react-router-dom';

export function LowCreditsAlert() {
  const { creditStats, isLowCredits, isExhausted } = useProfessionalCredits();
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Reset dismissed state when credit status changes significantly
  useEffect(() => {
    if (isExhausted) {
      setIsDismissed(false);
    }
  }, [isExhausted]);

  if (!creditStats || (!isLowCredits && !isExhausted) || isDismissed) {
    return null;
  }

  const isUrgent = isExhausted;
  const remainingCredits = creditStats.remaining_credits;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div 
          className={`
            rounded-lg shadow-xl border-2 p-4
            ${isUrgent 
              ? 'bg-red-50 border-red-300' 
              : 'bg-amber-50 border-amber-300'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`
              p-2 rounded-full flex-shrink-0
              ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}
            `}>
              <AlertTriangle className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>
                {isUrgent 
                  ? '❌ Você perdeu um novo cliente' 
                  : '⚠️ Seus créditos estão acabando'
                }
              </h4>
              
              <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                {isUrgent ? (
                  <>
                    Um tutor tentou agendar um atendimento agora, mas não conseguiu porque 
                    seus créditos acabaram.
                    <br /><br />
                    <strong>Cada minuto sem créditos ativos pode significar clientes perdidos 
                    e faturamento interrompido.</strong>
                  </>
                ) : (
                  <>
                    Você tem apenas <strong>{remainingCredits} créditos</strong> restantes.
                    <br /><br />
                    Quando seus créditos acabarem, seu perfil deixará de receber novos 
                    agendamentos, o que pode gerar <strong>perda direta de clientes</strong>.
                    <br /><br />
                    Recarregue agora para continuar atendendo sem interrupções.
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className={isUrgent 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-amber-600 hover:bg-amber-700'
                  }
                  onClick={() => navigate('/planos')}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  {isUrgent ? '🔄 Reativar agendamentos agora' : '👉 Recarregar créditos'}
                </Button>
              </div>
            </div>

            {!isUrgent && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
                onClick={() => setIsDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
