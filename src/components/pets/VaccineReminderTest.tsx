import { useState } from "react";
import { Bell, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReminderResult {
  success: boolean;
  emailsSent: number;
  emails: string[];
  errors?: string[];
}

export function VaccineReminderTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<ReminderResult | null>(null);

  const handleTestReminders = async () => {
    setIsTesting(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-vaccine-reminders", {
        body: { test: true },
      });

      if (error) {
        console.error("Error invoking function:", error);
        toast.error("Erro ao executar lembretes de vacinas");
        return;
      }

      const result = data as ReminderResult;
      setLastResult(result);

      if (result.success) {
        if (result.emailsSent > 0) {
          toast.success(`${result.emailsSent} lembrete(s) enviado(s) com sucesso!`);
        } else {
          toast.info("Nenhuma vacina próxima do vencimento encontrada.");
        }
      } else {
        toast.error("Falha ao enviar lembretes");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao testar lembretes de vacinas");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Lembretes de Vacinas
        </CardTitle>
        <CardDescription>
          Envie lembretes por email sobre vacinas próximas do vencimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Este sistema envia automaticamente lembretes diários às 9h para vacinas 
            que vencem nos próximos 7 dias.
          </p>
        </div>

        <Button
          onClick={handleTestReminders}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando vacinas...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Enviar Lembretes Agora
            </>
          )}
        </Button>

        {lastResult && (
          <div className={`p-3 rounded-lg ${lastResult.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium text-sm">
                {lastResult.success ? "Concluído" : "Falha"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Emails enviados: {lastResult.emailsSent}</p>
              {lastResult.emails.length > 0 && (
                <p className="truncate">
                  Para: {lastResult.emails.join(", ")}
                </p>
              )}
              {lastResult.errors && lastResult.errors.length > 0 && (
                <p className="text-red-600">
                  Erros: {lastResult.errors.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
