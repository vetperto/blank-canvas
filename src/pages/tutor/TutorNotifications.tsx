import { motion } from 'framer-motion';
import { Bell, Calendar, Syringe, MessageSquare, CheckCircle2, Trash2, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TutorLayout } from '@/components/tutor/TutorLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead, 
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  UserNotification
} from '@/hooks/useNotifications';

const notificationIcons: Record<string, any> = {
  appointment: Calendar,
  vaccine: Syringe,
  message: MessageSquare,
  info: Bell,
  warning: AlertCircle,
  success: CheckCircle2,
  reminder: Bell,
  confirmation: Calendar,
};

const notificationColors: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-600',
  vaccine: 'bg-amber-100 text-amber-600',
  message: 'bg-purple-100 text-purple-600',
  info: 'bg-gray-100 text-gray-600',
  warning: 'bg-orange-100 text-orange-600',
  success: 'bg-green-100 text-green-600',
  reminder: 'bg-amber-100 text-amber-600',
  confirmation: 'bg-primary/10 text-primary',
};

export default function TutorNotifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: preferences } = useNotificationPreferences();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const updatePreferences = useUpdateNotificationPreferences();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  const renderNotification = (notification: UserNotification) => {
    const Icon = notificationIcons[notification.type] || Bell;
    const colorClass = notificationColors[notification.type] || 'bg-gray-100 text-gray-600';

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <Card className={`border-border/50 ${!notification.is_read ? 'bg-primary/5 border-primary/20' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      {notification.title}
                      {!notification.is_read && (
                        <Badge variant="secondary" className="text-xs">Novo</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {notification.action_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={notification.action_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {notification.action_label || 'Abrir'}
                        </a>
                      </Button>
                    )}
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsRead.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Marcar como lida
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deleteNotification.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <TutorLayout title="Notificações" subtitle="Gerencie suas notificações e alertas">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout 
      title="Notificações" 
      subtitle="Gerencie suas notificações e alertas"
    >
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 
                    ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                    : 'Todas as notificações foram lidas'
                  }
                </p>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.map(renderNotification)}
              </div>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Você não tem notificações no momento. Quando houver novidades sobre seus agendamentos ou pets, elas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Canais de Notificação</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-appointments" className="flex flex-col">
                    <span>Emails de Agendamentos</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Confirmações e lembretes por email
                    </span>
                  </Label>
                  <Switch
                    id="email-appointments"
                    checked={preferences?.email_appointments ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('email_appointments', checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminders" className="flex flex-col">
                    <span>Emails de Lembretes</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Lembretes de vacinas e medicamentos
                    </span>
                  </Label>
                  <Switch
                    id="email-reminders"
                    checked={preferences?.email_reminders ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('email_reminders', checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-appointments" className="flex flex-col">
                    <span>Notificações Push de Agendamentos</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Alertas no app sobre agendamentos
                    </span>
                  </Label>
                  <Switch
                    id="push-appointments"
                    checked={preferences?.push_appointments ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('push_appointments', checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-reminders" className="flex flex-col">
                    <span>Notificações Push de Lembretes</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Alertas no app sobre vacinas e lembretes
                    </span>
                  </Label>
                  <Switch
                    id="push-reminders"
                    checked={preferences?.push_reminders ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('push_reminders', checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-medium text-foreground">Marketing</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-marketing" className="flex flex-col">
                    <span>Emails Promocionais</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Novidades, promoções e dicas de cuidado
                    </span>
                  </Label>
                  <Switch
                    id="email-marketing"
                    checked={preferences?.email_marketing ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange('email_marketing', checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TutorLayout>
  );
}
