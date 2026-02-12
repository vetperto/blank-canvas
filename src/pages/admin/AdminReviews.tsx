import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AdminReviews() {
  const { pendingReviews, fetchPendingReviews, moderateReview } = useAdmin();

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  return (
    <AdminLayout
      title="Moderação de Avaliações"
      description="Aprovar ou rejeitar avaliações pendentes"
      actions={
        <Button variant="outline" onClick={() => fetchPendingReviews()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      }
    >
      <ReviewModeration reviews={pendingReviews} onModerate={moderateReview} />
    </AdminLayout>
  );
}
