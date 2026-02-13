import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Eye, CheckCircle, Calendar, Clock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ProfessionalCardProps {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  rating: number;
  reviewCount: number;
  views: number;
  location: string;
  distance?: string;
  services: string[];
  isVerified?: boolean;
  planType?: "basic" | "intermediate" | "complete" | "enterprise";
  nextAvailable?: string;
  priceRange?: string;
}

const planBadges = {
  basic: { label: "Básico", className: "plan-basic" },
  intermediate: { label: "Verificado", className: "plan-intermediate" },
  complete: { label: "Completo", className: "plan-complete" },
  enterprise: { label: "Empresa", className: "plan-enterprise" },
};

export function ProfessionalCard({
  id,
  name,
  specialty,
  photo,
  rating,
  reviewCount,
  views,
  location,
  distance,
  services,
  isVerified,
  planType = "basic",
  nextAvailable,
  priceRange,
}: ProfessionalCardProps) {
  const plan = planBadges[planType];
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if (loading) return;
    
    if (!user) {
      e.preventDefault();
      toast({
        title: "Login necessário",
        description: "Faça login para visualizar o perfil completo do profissional.",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/profissional/${id}`)}`)}
          >
            Fazer Login
          </Button>
        ),
      });
      return;
    }
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para agendar com este profissional.",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/profissional/${id}`)}`)}
          >
            Fazer Login
          </Button>
        ),
      });
      return;
    }
    
    navigate(`/profissional/${encodeURIComponent(id)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={user ? `/profissional/${encodeURIComponent(id)}` : "#"}
        onClick={handleCardClick}
        className="block bg-card rounded-2xl border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group"
      >
        <div className="p-5">
          <div className="flex gap-4">
            {/* Photo */}
            <div className="relative shrink-0">
              <img
                src={photo}
                alt={name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-soft">
                  <CheckCircle className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{specialty}</p>
                </div>
                <Badge variant="outline" className={plan.className}>
                  {plan.label}
                </Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2">
                {reviewCount > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-star-filled text-star-filled" />
                      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
                    </span>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Novo no VetPerto
                  </Badge>
                )}
              </div>

              {/* Location & Views */}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {location}
                    {distance && ` • ${distance}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{views}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {services.slice(0, 4).map((service) => (
              <span
                key={service}
                className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground"
              >
                {service}
              </span>
            ))}
            {services.length > 4 && (
              <span className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                +{services.length - 4}
              </span>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {nextAvailable && (
                <div className="flex items-center gap-1.5 text-accent">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{nextAvailable}</span>
                </div>
              )}
              {priceRange && (
                <span className="text-muted-foreground">{priceRange}</span>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-primary hover:opacity-90"
              onClick={handleScheduleClick}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Agendar
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
