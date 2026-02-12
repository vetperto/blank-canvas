import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MessageSquare,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  tutor_profile: {
    full_name: string;
    profile_picture_url: string | null;
  };
}

export default function ProfessionalReviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!profile?.id) return;

      try {
        // Fetch reviews with explicit foreign key hint
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            tutor_profile_id
          `)
          .eq('professional_profile_id', profile.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Fetch tutor profiles separately
        if (reviewsData && reviewsData.length > 0) {
          const tutorIds = [...new Set(reviewsData.map(r => r.tutor_profile_id))];
          
          const { data: tutorProfiles, error: tutorError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url')
            .in('id', tutorIds);

          if (tutorError) throw tutorError;

          const tutorMap = new Map(tutorProfiles?.map(t => [t.id, t]) || []);
          
          const formattedReviews: Review[] = reviewsData.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            tutor_profile: tutorMap.get(r.tutor_profile_id) || {
              full_name: 'Usuário',
              profile_picture_url: null,
            },
          }));

          setReviews(formattedReviews);
        } else {
          setReviews([]);
        }

        // Fetch stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_professional_rating', { _professional_profile_id: profile.id });

        if (statsError) throw statsError;
        if (statsData && statsData.length > 0) {
          setStats({
            average: statsData[0].average_rating || 0,
            total: statsData[0].total_reviews || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [profile?.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <ProfessionalLayout title="Avaliações" subtitle="Veja o que seus clientes dizem">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout title="Avaliações" subtitle="Veja o que seus clientes dizem">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nota Média</p>
                  <p className="text-3xl font-bold text-foreground">{stats.average.toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {renderStars(Math.round(stats.average))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tendência</p>
                  <p className="text-lg font-semibold text-green-600">Positiva</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                Todas as Avaliações
              </CardTitle>
              <CardDescription>
                Feedback dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nenhuma avaliação ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    As avaliações aparecerão aqui após seus atendimentos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.tutor_profile?.profile_picture_url || undefined} />
                          <AvatarFallback>
                            {review.tutor_profile?.full_name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{review.tutor_profile?.full_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              "{review.comment}"
                            </p>
                          )}
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
