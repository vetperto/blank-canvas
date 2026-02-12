import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Clock, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { 
  useServices, 
  useManageServices, 
  type Service,
  type ServiceLocationType 
} from '@/hooks/useAppointments';

const locationLabels: Record<ServiceLocationType, string> = {
  clinic: 'Na clínica',
  home_visit: 'Domiciliar',
  both: 'Ambos',
};

export function ServiceManager() {
  const { profile } = useAuth();
  const { data: services, isLoading } = useServices(profile?.id);
  const { addService, updateService, deleteService } = useManageServices();

  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: '',
    location_type: 'clinic' as ServiceLocationType,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      price: '',
      location_type: 'clinic',
    });
    setEditingService(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price?.toString() || '',
      location_type: service.location_type,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    const serviceData = {
      name: formData.name,
      description: formData.description || null,
      duration_minutes: formData.duration_minutes,
      price: formData.price ? parseFloat(formData.price) : null,
      location_type: formData.location_type,
    };

    if (editingService) {
      updateService.mutate({ id: editingService.id, ...serviceData });
    } else {
      addService.mutate(serviceData);
    }

    handleOpenChange(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seus Serviços</CardTitle>
            <CardDescription>
              Configure os serviços que você oferece aos tutores
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? 'Atualize as informações do serviço'
                    : 'Adicione um novo serviço ao seu perfil'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Consulta Clínica Geral"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o que inclui este serviço..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duração</Label>
                    <Select
                      value={formData.duration_minutes.toString()}
                      onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1h30</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="150.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Local de Atendimento</Label>
                  <Select
                    value={formData.location_type}
                    onValueChange={(v) => setFormData({ ...formData, location_type: v as ServiceLocationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">Na clínica</SelectItem>
                      <SelectItem value="home_visit">Domiciliar</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || addService.isPending || updateService.isPending}
                  className="bg-gradient-primary"
                >
                  {editingService ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !services?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum serviço cadastrado. Adicione seu primeiro serviço.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{service.name}</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteService.mutate(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} min
                    </span>
                    {service.price && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-accent-light text-accent rounded">
                        <DollarSign className="w-3 h-3" />
                        R$ {service.price.toFixed(2)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-2 py-1 bg-primary-light text-primary rounded">
                      <MapPin className="w-3 h-3" />
                      {locationLabels[service.location_type]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
