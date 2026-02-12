import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar,
  Star,
  MessageSquare,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';

interface Notification {
  id: string;
  type: 'appointment' | 'review' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function ProfessionalNotifications() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Novo agendamento',
      message: 'Maria Silva agendou uma consulta para amanhã às 14:00',
      time: 'Há 2 horas',
      read: false,
    },
    {
      id: '2',
      type: 'review',
      title: 'Nova avaliação',
      message: 'João Pedro deixou uma avaliação de 5 estrelas',
      time: 'Há 1 dia',
      read: true,
    },
    {
      id: '3',
      type: 'system',
      title: 'Perfil verificado',
      message: 'Parabéns! Seu perfil foi verificado com sucesso.',
      time: 'Há 3 dias',
      read: true,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'review':
        return Star;
      case 'system':
        return Bell;
      default:
        return MessageSquare;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-500 bg-blue-500/10';
      case 'review':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'system':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ProfessionalLayout title="Notificações" subtitle="Acompanhe suas atualizações">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-secondary" />
                    Suas Notificações
                    {unreadCount > 0 && (
                      <Badge className="bg-primary text-white ml-2">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Fique por dentro de tudo que acontece
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nenhuma notificação</h3>
                  <p className="text-sm text-muted-foreground">
                    Você receberá notificações sobre agendamentos e avaliações aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    const iconColor = getIconColor(notification.type);
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read 
                            ? 'bg-background' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{notification.title}</p>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfessionalLayout>
  );
}
