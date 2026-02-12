import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Check, X, ExternalLink, User, Mail, Loader2, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PendingDocument } from "@/hooks/useAdmin";

interface DocumentVerificationProps {
  documents: PendingDocument[];
  onVerify: (documentId: string, profileId: string, approved: boolean) => Promise<boolean>;
  onDelete: (documentId: string) => Promise<boolean>;
}

const documentTypeLabels: Record<string, string> = {
  rg: "RG",
  cnh: "CNH",
  crmv: "CRMV",
  cnpj_card: "Cartão CNPJ",
};

const documentTypeBadgeColors: Record<string, string> = {
  rg: "bg-blue-500/10 text-blue-500",
  cnh: "bg-green-500/10 text-green-500",
  crmv: "bg-primary/10 text-primary",
  cnpj_card: "bg-purple-500/10 text-purple-500",
};

export function DocumentVerification({ documents, onVerify, onDelete }: DocumentVerificationProps) {
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<PendingDocument | null>(null);

  const handleVerify = async (doc: PendingDocument, approved: boolean) => {
    setIsProcessing(true);
    const success = await onVerify(doc.id, doc.profile_id, approved);
    setIsProcessing(false);
    
    if (success) {
      setSelectedDoc(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDoc) return;
    
    setIsProcessing(true);
    await onDelete(deleteConfirmDoc.id);
    setIsProcessing(false);
    setDeleteConfirmDoc(null);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Tudo verificado!</h3>
        <p className="text-muted-foreground">Não há documentos pendentes de verificação</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.file_name}</h4>
                        <Badge className={documentTypeBadgeColors[doc.document_type] || "bg-muted"}>
                          {documentTypeLabels[doc.document_type] || doc.document_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enviado em {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{doc.professional_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{doc.professional_email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingUrl(doc.file_url)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleVerify(doc, true)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Verificar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteConfirmDoc(doc)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewingUrl} onOpenChange={() => setViewingUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Visualizar Documento</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {viewingUrl && (
              <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                {viewingUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={viewingUrl}
                    alt="Documento"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : viewingUrl.match(/\.pdf$/i) ? (
                  <iframe
                    src={viewingUrl}
                    className="w-full h-full min-h-[500px]"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="text-center p-8">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Não é possível visualizar este tipo de arquivo
                    </p>
                    <Button asChild>
                      <a href={viewingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir em nova aba
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUrl(null)}>
              Fechar
            </Button>
            {viewingUrl && (
              <Button asChild>
                <a href={viewingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir em nova aba
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmDoc} onOpenChange={() => setDeleteConfirmDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar este documento? Esta ação removerá o documento
              e o profissional precisará enviar novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Confirmar Rejeição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
