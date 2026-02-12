import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { TutorLayout } from '@/components/tutor/TutorLayout';
import { FavoritesList } from '@/components/tutor/FavoritesList';

export default function TutorFavorites() {
  return (
    <TutorLayout 
      title="Profissionais Favoritos" 
      subtitle="Seus profissionais salvos para fácil acesso"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Meus Favoritos</h2>
            <p className="text-sm text-muted-foreground">
              Acesse rapidamente os profissionais que você mais gosta
            </p>
          </div>
        </div>

        <FavoritesList />
      </motion.div>
    </TutorLayout>
  );
}
