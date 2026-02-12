import { AdminLayout } from "@/components/admin/AdminLayout";
import { DocumentVerification } from "@/components/admin/DocumentVerification";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AdminDocuments() {
  const { pendingDocuments, fetchPendingDocuments, verifyDocument, deleteDocument } = useAdmin();

  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  return (
    <AdminLayout
      title="Verificação de Documentos"
      description="Verificar documentos enviados por profissionais"
      actions={
        <Button variant="outline" onClick={() => fetchPendingDocuments()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      }
    >
      <DocumentVerification
        documents={pendingDocuments}
        onVerify={verifyDocument}
        onDelete={deleteDocument}
      />
    </AdminLayout>
  );
}
