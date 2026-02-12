import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReviews, useProfessionalRating, type Review } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  professionalProfileId: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4',
            star <= rating
              ? 'fill-star-filled text-star-filled'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={review.tutor?.profile_picture_url || undefined} />
          <AvatarFallback>
            {review.tutor?.full_name?.charAt(0) || 'T'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium truncate">
              {review.tutor?.full_name || 'Tutor'}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(review.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          <StarRating rating={review.rating} />

          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewList({ professionalProfileId }: ReviewListProps) {
  const { data: reviews, isLoading: loadingReviews } = useReviews(professionalProfileId);
  const { data: ratingData, isLoading: loadingRating } = useProfessionalRating(professionalProfileId);

  const isLoading = loadingReviews || loadingRating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Avaliações
          </span>
          {ratingData && ratingData.total_reviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-star-filled text-star-filled" />
                <span className="font-bold text-lg">
                  {ratingData.average_rating?.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({ratingData.total_reviews} {ratingData.total_reviews === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ReviewsSkeleton />
        ) : !reviews?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Nenhuma avaliação ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Rating Summary Component
export function RatingSummary({ professionalProfileId }: { professionalProfileId: string }) {
  const { data: ratingData } = useProfessionalRating(professionalProfileId);

  if (!ratingData || ratingData.total_reviews === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Star className="w-4 h-4" />
        <span className="text-sm">Novo</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-star-filled text-star-filled" />
        <span className="font-semibold">{ratingData.average_rating?.toFixed(1)}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        ({ratingData.total_reviews})
      </span>
    </div>
  );
}
