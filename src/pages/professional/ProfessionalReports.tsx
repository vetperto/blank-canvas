import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfessionalReports() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlyAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    uniqueClients: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;

      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      try {
        // Monthly appointments
        const { data: appointments, error: appError } = await supabase
          .from('appointments')
          .select('id, status, price, tutor_profile_id')
          .eq('professional_profile_id', profile.id)
          .gte('appointment_date', monthStart)
          .lte('appointment_date', monthEnd);

        if (appError) throw appError;

        const completed = appointments?.filter(a => a.status === 'completed') || [];
        const uniqueTutors = new Set(appointments?.map(a => a.tutor_profile_id) || []);
        const revenue = completed.reduce((sum, a) => sum + (a.price || 0), 0);

        setStats({
          monthlyAppointments: appointments?.length || 0,
          completedAppointments: completed.length,
          totalRevenue: revenue,
          uniqueClients: uniqueTutors.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <ProfessionalLayout title="Relatórios" subtitle="Métricas e análises do seu desempenho">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </ProfessionalLayout>
    );
  }

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <ProfessionalLayout title="Relatórios" subtitle="Métricas e análises do seu desempenho">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Resumo de {currentMonth}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.monthlyAppointments}</p>
                  <p className="text-xs text-muted-foreground">Agendamentos</p>
                </div>
                
                <div className="text-center p-4 bg-background rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.completedAppointments}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
                
                <div className="text-center p-4 bg-background rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                </div>
                
                <div className="text-center p-4 bg-background rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{stats.uniqueClients}</p>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taxa de Conclusão</CardTitle>
              <CardDescription>Agendamentos realizados vs. cancelados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-green-500">
                  {stats.monthlyAppointments > 0 
                    ? Math.round((stats.completedAppointments / stats.monthlyAppointments) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.completedAppointments} de {stats.monthlyAppointments} concluídos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Médio</CardTitle>
              <CardDescription>Valor médio por atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-primary">
                  R$ {stats.completedAppointments > 0 
                    ? (stats.totalRevenue / stats.completedAppointments).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  por atendimento concluído
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfessionalLayout>
  );
}
