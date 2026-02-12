import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProfessionalCredits, type CreditStats } from '@/hooks/useProfessionalCredits';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function CreditStatusCard() {
  const { creditStats, isLoading, refetch } = useProfessionalCredits();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!creditStats) return null;

  const usagePercent = creditStats.total_credits > 0 
    ? (creditStats.used_credits / creditStats.total_credits) * 100 
    : 0;

  const getStatusConfig = (status: CreditStats['status']) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Ativo',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          progressColor: 'bg-emerald-500',
        };
      case 'low_credits':
        return {
          icon: AlertTriangle,
          label: 'Créditos Baixos',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          progressColor: 'bg-amber-500',
        };
      case 'exhausted':
        return {
          icon: XCircle,
          label: 'Indisponível',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
        };
    }
  };

  const statusConfig = getStatusConfig(creditStats.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('border-2', statusConfig.borderColor)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Impacto dos Créditos</CardTitle>
            </div>
            <Badge variant="outline" className={cn('gap-1', statusConfig.bgColor, statusConfig.color)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </div>
          <CardDescription>Gerencie seus créditos para receber agendamentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credit Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Créditos Restantes</span>
              <span className={cn('font-bold', statusConfig.color)}>
                {creditStats.remaining_credits} / {creditStats.total_credits}
              </span>
            </div>
            <Progress 
              value={100 - usagePercent} 
              className="h-3"
            />
            {creditStats.status === 'low_credits' && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Apenas {creditStats.remaining_credits} créditos restantes. Recarregue para continuar atendendo.
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn('p-3 rounded-lg', statusConfig.bgColor)}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Agendamentos Confirmados
              </div>
              <p className="text-2xl font-bold">{creditStats.confirmed_appointments}</p>
            </div>
            <div className={cn('p-3 rounded-lg', creditStats.lost_clients > 0 ? 'bg-red-50' : 'bg-muted/50')}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingDown className={cn('w-4 h-4', creditStats.lost_clients > 0 ? 'text-red-500' : 'text-muted-foreground')} />
                Clientes Perdidos
              </div>
              <p className={cn('text-2xl font-bold', creditStats.lost_clients > 0 && 'text-red-600')}>
                {creditStats.lost_clients}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-primary"
              onClick={() => navigate('/planos')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Créditos
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refetch()}
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Warning Messages */}
          {creditStats.status === 'exhausted' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-red-800">Seus agendamentos estão bloqueados</p>
                  <p className="text-sm text-red-600">
                    Seu perfil não está recebendo novos agendamentos. Recarregue seus créditos 
                    para voltar a atender clientes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
