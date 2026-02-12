import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';

export function FavoritesList() {
  const { favorites, isLoading, removeFavorite, isRemovingFavorite } = useFavorites();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Salve seus profissionais favoritos para encontrá-los facilmente depois.
          </p>
          <Button asChild variant="outline">
            <Link to="/buscar">Buscar Profissionais</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite, index) => (
        <motion.div
          key={favorite.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="group hover:shadow-md transition-shadow border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={favorite.professional?.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(favorite.professional?.social_name || favorite.professional?.full_name || 'P')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">
                      {favorite.professional?.social_name || favorite.professional?.full_name}
                    </h4>
                    {favorite.professional?.is_verified && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  {(favorite.professional?.city || favorite.professional?.state) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {[favorite.professional?.city, favorite.professional?.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  
                  {favorite.professional?.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {favorite.professional.bio}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeFavorite(favorite.professional_profile_id)}
                  disabled={isRemovingFavorite}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover
                </Button>
                
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profissional/${favorite.professional_profile_id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver Perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
