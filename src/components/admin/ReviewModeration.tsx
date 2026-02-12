import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Check, X, MessageSquare, User, Briefcase, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { PendingReview } from "@/hooks/useAdmin";

interface ReviewModerationProps {
  reviews: PendingReview[];
  onModerate: (reviewId: string, approved: boolean, notes?: string) => Promise<boolean>;
}

export function ReviewModeration({ reviews, onModerate }: ReviewModerationProps) {
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const handleModerate = async (approved: boolean) => {
    if (!selectedReview) return;
    
    setIsProcessing(true);
    const success = await onModerate(selectedReview.id, approved, moderationNotes);
    setIsProcessing(false);
    
    if (success) {
      setSelectedReview(null);
      setModerationNotes("");
      setActionType(null);
    }
  };

  const openDialog = (review: PendingReview, type: "approve" | "reject") => {
    setSelectedReview(review);
    setActionType(type);
    setModerationNotes("");
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Tudo em dia!</h3>
        <p className="text-muted-foreground">Não há avaliações pendentes de moderação</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary">
                      {format(new Date(review.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </Badge>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Users */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tutor:</span>
                      <span className="font-medium">{review.tutor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Profissional:</span>
                      <span className="font-medium">{review.professional_name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => openDialog(review, "approve")}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDialog(review, "reject")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Moderation Dialog */}
      <Dialog open={!!selectedReview && !!actionType} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Aprovar Avaliação" : "Rejeitar Avaliação"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirme a aprovação desta avaliação. Ela ficará visível publicamente."
                : "Informe o motivo da rejeição. Esta avaliação não será exibida."}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < selectedReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {selectedReview.comment && (
                <p className="text-sm text-muted-foreground italic">"{selectedReview.comment}"</p>
              )}
            </div>
          )}

          <Textarea
            placeholder={
              actionType === "approve"
                ? "Notas de moderação (opcional)"
                : "Motivo da rejeição (obrigatório)"
            }
            value={moderationNotes}
            onChange={(e) => setModerationNotes(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Cancelar
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => handleModerate(actionType === "approve")}
              disabled={isProcessing || (actionType === "reject" && !moderationNotes.trim())}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : actionType === "approve" ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {actionType === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
