import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, AlertCircle, Loader2, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type ConfirmationState = 'loading' | 'success' | 'reschedule' | 'error' | 'already_processed';

export default function ConfirmAppointment() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ConfirmationState>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const action = searchParams.get('action') as 'confirm' | 'reschedule' | null;

  useEffect(() => {
    const processConfirmation = async () => {
      if (!token || !action) {
        setState('error');
        setMessage('Link inválido. Verifique se você clicou no link correto do e-mail.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-appointment', {
          body: { token, action }
        });

        if (error) {
          setState('error');
          setMessage(error.message || 'Ocorreu um erro ao processar sua solicitação.');
          return;
        }

        if (data.already_processed) {
          setState('already_processed');
          setMessage(data.message);
          return;
        }

        if (data.action === 'confirmed') {
          setState('success');
          setMessage(data.message);
        } else if (data.action === 'reschedule_requested') {
          setState('reschedule');
          setMessage(data.message);
        }
      } catch (err: any) {
        setState('error');
        setMessage('Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    };

    processConfirmation();
  }, [token, action]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Processando sua confirmação...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Presença Confirmada!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                🐾 Estamos preparando tudo com carinho para receber você e seu pet!
              </p>
            </div>
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        );

      case 'reschedule':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-amber-700 mb-4">Solicitação Registrada</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{message}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm">
                📞 O profissional entrará em contato para agendar um novo horário que seja conveniente para você.
              </p>
            </div>
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        );

      case 'already_processed':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Já Processado</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{message}</p>
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{message}</p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">Confirmação de Agendamento</CardTitle>
          <CardDescription>VetPerto - Cuidando do seu pet com amor</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
