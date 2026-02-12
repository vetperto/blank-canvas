import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ImagePlus, 
  Trash2, 
  Lock, 
  Crown,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Link } from 'react-router-dom';

export default function ProfessionalPortfolio() {
  const { planLimits, isLoading } = usePlanLimits();
  const [portfolioImages] = useState<string[]>([]);

  if (isLoading) {
    return (
      <ProfessionalLayout title="Portfólio" subtitle="Mostre seus melhores trabalhos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </ProfessionalLayout>
    );
  }

  const hasAccess = planLimits?.hasPortfolio;
  const limit = planLimits?.portfolioLimit || 0;
  const remaining = limit === -1 ? 'Ilimitado' : `${limit - portfolioImages.length} restantes`;

  if (!hasAccess) {
    return (
      <ProfessionalLayout title="Portfólio" subtitle="Mostre seus melhores trabalhos">
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
                O portfólio está disponível apenas para os planos <strong>Completo</strong> e <strong>Empresas</strong>. 
                Faça upgrade para mostrar seus melhores trabalhos!
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
    <ProfessionalLayout title="Portfólio" subtitle="Mostre seus melhores trabalhos">
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
                    <ImageIcon className="w-5 h-5 text-secondary" />
                    Galeria de Trabalhos
                  </CardTitle>
                  <CardDescription>
                    Adicione fotos dos seus trabalhos para atrair mais clientes
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {remaining}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {portfolioImages.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <ImagePlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nenhuma imagem ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione fotos dos seus melhores trabalhos para atrair mais clientes
                  </p>
                  <Button>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Imagem
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            Dica: Use fotos de alta qualidade com boa iluminação para causar uma melhor impressão.
          </AlertDescription>
        </Alert>
      </div>
    </ProfessionalLayout>
  );
}
