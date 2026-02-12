import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedProfessionals } from "@/hooks/useFeaturedProfessionals";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function FeaturedProfessionals() {
  const { professionals, isLoading, error } = useFeaturedProfessionals(4);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleProfessionalClick = (e: React.MouseEvent, professionalId: string) => {
    if (authLoading) return;
    
    if (!user) {
      e.preventDefault();
      toast({
        title: "Login necessário",
        description: "Faça login para visualizar o perfil completo do profissional.",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/profissional/${professionalId}`)}`)}
          >
            Fazer Login
          </Button>
        ),
      });
      return;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-2xl border border-border overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error or empty state
  if (error || professionals.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-display-sm mb-2">
                Profissionais em destaque
              </h2>
              <p className="text-muted-foreground">
                Os melhores avaliados pelos tutores
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 bg-card rounded-2xl border border-border"
          >
            <p className="text-muted-foreground mb-4">
              {error 
                ? "Não foi possível carregar os profissionais. Tente novamente mais tarde."
                : "Ainda não há profissionais em destaque. Seja o primeiro a se cadastrar!"
              }
            </p>
            <Button asChild>
              <Link to="/buscar">
                Buscar profissionais <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-display-sm mb-2">
              Profissionais em destaque
            </h2>
            <p className="text-muted-foreground">
              Os melhores avaliados pelos tutores
            </p>
          </motion.div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/buscar">
              Ver todos <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map((pro, index) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={user ? `/profissional/${pro.id}` : "#"}
                onClick={(e) => handleProfessionalClick(e, pro.id)}
                className="block bg-card rounded-2xl border border-border shadow-card hover:shadow-hover transition-all overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {pro.photo ? (
                    <img
                      src={pro.photo}
                      alt={pro.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                      <span className="text-4xl font-bold text-primary-foreground">
                        {pro.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {pro.isVerified && (
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground rounded-full p-1.5 shadow-soft">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {pro.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {pro.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-star-filled text-star-filled" />
                      <span className="font-medium text-sm">
                        {pro.rating > 0 ? pro.rating.toFixed(1) : "Novo"}
                      </span>
                    </div>
                    {pro.reviewCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({pro.reviewCount} {pro.reviewCount === 1 ? "avaliação" : "avaliações"})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{pro.location}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile "Ver todos" button */}
        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline" asChild>
            <Link to="/buscar">
              Ver todos <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
