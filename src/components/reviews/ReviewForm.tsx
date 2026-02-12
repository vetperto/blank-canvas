import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCreateReview } from '@/hooks/useReviews';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  appointmentId?: string;
}

export function ReviewForm({
  isOpen,
  onClose,
  professionalId,
  professionalName,
  appointmentId,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) return;

    await createReview.mutateAsync({
      appointmentId,
      professionalProfileId: professionalId,
      rating,
      comment: comment.trim(),
    });

    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    onClose();
  };

  const displayRating = hoverRating || rating;
  const remainingChars = 500 - comment.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar {professionalName}</DialogTitle>
          <DialogDescription>
            Compartilhe sua experiência para ajudar outros tutores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Como foi sua experiência?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={cn(
                      'w-10 h-10 transition-colors',
                      star <= displayRating
                        ? 'fill-star-filled text-star-filled'
                        : 'text-muted-foreground'
                    )}
                  />
                </motion.button>
              ))}
            </div>
            {displayRating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium mt-2"
              >
                {displayRating === 1 && 'Muito ruim'}
                {displayRating === 2 && 'Ruim'}
                {displayRating === 3 && 'Regular'}
                {displayRating === 4 && 'Bom'}
                {displayRating === 5 && 'Excelente'}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Conte como foi o atendimento, pontualidade, qualidade do serviço..."
              className="min-h-[120px] resize-none"
            />
            <p
              className={cn(
                'text-xs mt-1 text-right',
                remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {remainingChars} caracteres restantes
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            <p>
              💡 Sua avaliação será analisada em até 48 horas antes de ser publicada.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
            className="bg-gradient-primary"
          >
            {createReview.isPending ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
