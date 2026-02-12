import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar, CheckCircle, Crown, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppointmentLimitCard() {
  const { subscriptionStatus, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  const limits = subscriptionStatus.appointmentLimits;
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // No subscription
  if (!subscriptionStatus.subscribed || !limits) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Sem Plano Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Você precisa de um plano ativo para receber agendamentos de clientes.
          </p>
          <Button onClick={() => navigate("/planos")} className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Unlimited plan
  if (limits.monthlyLimit === null) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              Agendamentos
            </CardTitle>
            <Badge variant="default" className="bg-primary">
              {limits.planName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-3xl font-bold text-primary">{limits.currentCount}</p>
              <p className="text-sm text-muted-foreground">agendamentos este mês</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-primary/50 text-primary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ilimitado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentage
  const percentage = Math.min(100, (limits.currentCount / limits.monthlyLimit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // Determine visual style based on usage
  const getProgressColor = () => {
    if (isAtLimit) return "bg-destructive";
    if (isNearLimit) return "bg-amber-500";
    return "bg-primary";
  };

  const getCardStyle = () => {
    if (isAtLimit) return "border-destructive/50 bg-destructive/5";
    if (isNearLimit) return "border-amber-500/50 bg-amber-500/5";
    return "border-primary/30";
  };

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (isNearLimit) return <TrendingUp className="h-5 w-5 text-amber-500" />;
    return <Calendar className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getIcon()}
            Agendamentos do Mês
          </CardTitle>
          <Badge variant="outline">
            {limits.planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Counter */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">
              {limits.currentCount}
              <span className="text-lg font-normal text-muted-foreground">
                /{limits.monthlyLimit}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {limits.remaining} agendamento{limits.remaining !== 1 ? 's' : ''} restante{limits.remaining !== 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-2xl font-semibold text-muted-foreground">
            {percentage.toFixed(0)}%
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <Progress value={percentage} className="h-3" />
          <div 
            className={`absolute inset-0 h-3 rounded-full ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Alert messages */}
        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Limite atingido!
              </p>
              <p className="text-xs text-muted-foreground">
                Você não pode receber novos agendamentos este mês. Faça upgrade para continuar.
              </p>
              <Button 
                size="sm" 
                className="mt-2" 
                onClick={() => navigate("/planos")}
              >
                <Crown className="h-3 w-3 mr-1" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                Quase no limite!
              </p>
              <p className="text-xs text-muted-foreground">
                Você está usando {percentage.toFixed(0)}% do seu limite mensal. 
                Considere fazer upgrade para não perder clientes.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="mt-2 border-amber-500/50 text-amber-700 hover:bg-amber-500/10" 
                onClick={() => navigate("/planos")}
              >
                <Crown className="h-3 w-3 mr-1" />
                Ver Planos
              </Button>
            </div>
          </div>
        )}

        {!isNearLimit && (
          <p className="text-xs text-muted-foreground text-center">
            Você está dentro do limite do seu plano. Continue assim! 🎉
          </p>
        )}
      </CardContent>
    </Card>
  );
}
