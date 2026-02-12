import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CreditExhaustedMessageProps {
  className?: string;
}

export function CreditExhaustedMessage({ className }: CreditExhaustedMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Profissional Indisponível</AlertTitle>
      <AlertDescription>
        Este profissional está temporariamente indisponível para novos agendamentos.
        Por favor, tente novamente mais tarde ou escolha outro profissional disponível.
      </AlertDescription>
    </Alert>
  );
}
