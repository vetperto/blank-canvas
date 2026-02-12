import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Lock, 
  Crown,
  Loader2,
  Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Link } from 'react-router-dom';

export default function ProfessionalPriceTable() {
  const { planLimits, isLoading } = usePlanLimits();
  const [prices] = useState<any[]>([]);

  if (isLoading) {
    return (
      <ProfessionalLayout title="Tabela de Preços" subtitle="Configure seus valores">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </ProfessionalLayout>
    );
  }

  const hasAccess = planLimits?.hasPriceTable;

  if (!hasAccess) {
    return (
      <ProfessionalLayout title="Tabela de Preços" subtitle="Configure seus valores">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recurso Bloqueado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A tabela de preços está disponível a partir do plano <strong>Intermediário</strong>. 
                Faça upgrade para exibir seus valores no perfil público!
              </p>
              <Badge variant="outline" className="mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Plano atual: {planLimits?.planName || 'Sem Plano'}
              </Badge>
              <div className="mt-6">
                <Link to="/planos">
                  <Button className="bg-gradient-primary">
                    <Crown className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout title="Tabela de Preços" subtitle="Configure seus valores">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-secondary" />
                    Seus Preços
                  </CardTitle>
                  <CardDescription>
                    Configure os valores dos seus serviços para exibir no perfil público
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Preço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prices.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nenhum preço cadastrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione seus preços para que clientes vejam seus valores
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Preço
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {prices.map((price, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{price.name}</p>
                        <p className="text-sm text-muted-foreground">{price.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">
                          R$ {price.value.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfessionalLayout>
  );
}
