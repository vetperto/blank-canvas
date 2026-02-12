import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { TutorLayout } from '@/components/tutor/TutorLayout';
import { AppointmentHistory } from '@/components/tutor/AppointmentHistory';

export default function TutorHistory() {
  return (
    <TutorLayout 
      title="Histórico de Consultas" 
      subtitle="Visualize suas consultas anteriores"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Histórico Completo</h2>
            <p className="text-sm text-muted-foreground">
              Todas as suas consultas e atendimentos anteriores
            </p>
          </div>
        </div>

        <AppointmentHistory />
      </motion.div>
    </TutorLayout>
  );
}
