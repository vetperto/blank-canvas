import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Star, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePendingReviews } from '@/hooks/useReviews';
import { ReviewForm } from './ReviewForm';
import { cn } from '@/lib/utils';

export function PendingReviews() {
  const { data: pendingAppointments, isLoading } = usePendingReviews();
  const [reviewingAppointment, setReviewingAppointment] = useState<{
    id: string;
    professionalId: string;
    professionalName: string;
  } | null>(null);

  if (isLoading) {
    return null;
  }

  if (!pendingAppointments?.length) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary-light/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-primary" />
            Avalie seus atendimentos
          </CardTitle>
          <CardDescription>
            Você tem {pendingAppointments.length} atendimento(s) para avaliar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingAppointments.slice(0, 3).map((apt: any) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-background rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={apt.professional?.profile_picture_url} />
                    <AvatarFallback>
                      {apt.professional?.full_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{apt.professional?.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(apt.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                      {apt.service && (
                        <>
                          <span>•</span>
                          <span>{apt.service.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setReviewingAppointment({
                    id: apt.id,
                    professionalId: apt.professional?.id,
                    professionalName: apt.professional?.full_name || 'Profissional',
                  })}
                  className="bg-gradient-primary"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Avaliar
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {reviewingAppointment && (
        <ReviewForm
          isOpen={true}
          onClose={() => setReviewingAppointment(null)}
          professionalId={reviewingAppointment.professionalId}
          professionalName={reviewingAppointment.professionalName}
          appointmentId={reviewingAppointment.id}
        />
      )}
    </>
  );
}
