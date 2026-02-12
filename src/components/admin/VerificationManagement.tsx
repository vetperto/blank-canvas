import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  RotateCcw,
  Eye,
  FileText,
  BadgeCheck,
  Loader2,
  ChevronDown,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVerification, VerificationStatus, ProfessionalVerification } from "@/hooks/useVerification";

const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: typeof UserCheck }> = {
  not_verified: { 
    label: "Não Verificado", 
    color: "bg-gray-500/10 text-gray-500", 
    icon: UserX 
  },
  under_review: { 
    label: "Em Análise", 
    color: "bg-yellow-500/10 text-yellow-600", 
    icon: Clock 
  },
  verified: { 
    label: "Verificado", 
    color: "bg-green-500/10 text-green-600", 
    icon: UserCheck 
  },
  rejected: { 
    label: "Rejeitado", 
    color: "bg-red-500/10 text-red-600", 
    icon: AlertCircle 
  },
};

export function VerificationManagement() {
  const {
    professionals,
    stats,
    isLoading,
    fetchStats,
    fetchProfessionals,
    changeVerificationStatus,
    resetVerification,
    checkCanVerify,
  } = useVerification();

  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalVerification | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'verify' | 'reject' | 'reset' | 'review';
    professional: ProfessionalVerification;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [canVerifyInfo, setCanVerifyInfo] = useState<{
    can_verify: boolean;
    missing_documents: string[];
  } | null>(null);

  useEffect(() => {
    fetchStats();
    fetchProfessionals();
  }, [fetchStats, fetchProfessionals]);

  useEffect(() => {
    if (statusFilter === 'all') {
      fetchProfessionals();
    } else {
      fetchProfessionals(statusFilter);
    }
  }, [statusFilter, fetchProfessionals]);

  // Filter professionals by search query
  const filteredProfessionals = professionals.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.crmv?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query)
    );
  });

  const handleOpenActionDialog = async (
    type: 'verify' | 'reject' | 'reset' | 'review',
    professional: ProfessionalVerification
  ) => {
    setActionNotes("");
    
    if (type === 'verify') {
      const canVerify = await checkCanVerify(professional.id);
      setCanVerifyInfo(canVerify);
    } else {
      setCanVerifyInfo(null);
    }
    
    setActionDialog({ type, professional });
  };

  const handleAction = async () => {
    if (!actionDialog) return;
    
    setIsProcessing(true);
    let success = false;

    switch (actionDialog.type) {
      case 'verify':
        success = await changeVerificationStatus(
          actionDialog.professional.id,
          'verified',
          actionNotes || 'Perfil verificado pelo administrador'
        );
        break;
      case 'reject':
        success = await changeVerificationStatus(
          actionDialog.professional.id,
          'rejected',
          actionNotes || 'Perfil rejeitado pelo administrador'
        );
        break;
      case 'reset':
        success = await resetVerification(
          actionDialog.professional.id,
          actionNotes || 'Verificação resetada pelo administrador'
        );
        break;
      case 'review':
        success = await changeVerificationStatus(
          actionDialog.professional.id,
          'under_review',
          actionNotes || 'Perfil enviado para análise'
        );
        break;
    }

    setIsProcessing(false);
    if (success) {
      setActionDialog(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total_professionals}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'not_verified' ? 'border-primary' : ''}`}
          onClick={() => setStatusFilter('not_verified')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.not_verified}</div>
            <div className="text-sm text-muted-foreground">Não Verificados</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'under_review' ? 'border-primary' : ''}`}
          onClick={() => setStatusFilter('under_review')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.under_review}</div>
            <div className="text-sm text-muted-foreground">Em Análise</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'verified' ? 'border-primary' : ''}`}
          onClick={() => setStatusFilter('verified')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-sm text-muted-foreground">Verificados</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'rejected' ? 'border-primary' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejeitados</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CRMV ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VerificationStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="not_verified">Não Verificados</SelectItem>
            <SelectItem value="under_review">Em Análise</SelectItem>
            <SelectItem value="verified">Verificados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => fetchProfessionals(statusFilter === 'all' ? undefined : statusFilter)}>
          Atualizar
        </Button>
      </div>

      {/* Professionals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum profissional encontrado</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Tente ajustar os filtros de busca" : "Não há profissionais com este status"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredProfessionals.map((professional, index) => {
              const status = statusConfig[professional.verification_status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={professional.profile_picture_url || undefined} />
                        <AvatarFallback>
                          {professional.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">
                            {professional.social_name || professional.full_name}
                          </h4>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          {professional.verification_status === 'verified' && (
                            <BadgeCheck className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">{professional.email}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {professional.crmv && (
                            <Badge variant="outline" className="text-xs">
                              CRMV: {professional.crmv}
                            </Badge>
                          )}
                          {professional.city && professional.state && (
                            <Badge variant="outline" className="text-xs">
                              {professional.city}, {professional.state}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {professional.documents_count} doc(s)
                          </Badge>
                          {professional.has_crmv_document && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              CRMV OK
                            </Badge>
                          )}
                          {professional.has_id_document && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              ID OK
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Ações
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {professional.verification_status !== 'verified' && (
                            <DropdownMenuItem onClick={() => handleOpenActionDialog('verify', professional)}>
                              <Check className="w-4 h-4 mr-2 text-green-600" />
                              Verificar Perfil
                            </DropdownMenuItem>
                          )}
                          {professional.verification_status !== 'under_review' && (
                            <DropdownMenuItem onClick={() => handleOpenActionDialog('review', professional)}>
                              <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                              Enviar para Análise
                            </DropdownMenuItem>
                          )}
                          {professional.verification_status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleOpenActionDialog('reject', professional)}>
                              <X className="w-4 h-4 mr-2 text-red-600" />
                              Rejeitar Perfil
                            </DropdownMenuItem>
                          )}
                          {professional.verification_status === 'verified' && (
                            <DropdownMenuItem onClick={() => handleOpenActionDialog('reset', professional)}>
                              <RotateCcw className="w-4 h-4 mr-2 text-orange-600" />
                              Resetar Verificação
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {professional.verified_at && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Verificado em {format(new Date(professional.verified_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {professional.verification_notes && (
                        <span className="ml-2">• {professional.verification_notes}</span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'verify' && 'Verificar Perfil'}
              {actionDialog?.type === 'reject' && 'Rejeitar Perfil'}
              {actionDialog?.type === 'reset' && 'Resetar Verificação'}
              {actionDialog?.type === 'review' && 'Enviar para Análise'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'verify' && 'O profissional receberá o selo de verificado e aparecerá na busca pública.'}
              {actionDialog?.type === 'reject' && 'O profissional será notificado e precisará corrigir as pendências.'}
              {actionDialog?.type === 'reset' && 'O profissional perderá o selo e será removido da busca pública imediatamente.'}
              {actionDialog?.type === 'review' && 'O profissional será marcado como em análise.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog?.type === 'verify' && canVerifyInfo && !canVerifyInfo.can_verify && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <AlertCircle className="w-5 h-5" />
                Documentos Pendentes
              </div>
              <p className="text-sm">
                Este perfil não pode ser verificado. Faltam os seguintes documentos verificados:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm">
                {canVerifyInfo.missing_documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notas (opcional)
              </label>
              <Textarea
                placeholder="Adicione observações sobre esta ação..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={isProcessing || (actionDialog?.type === 'verify' && canVerifyInfo && !canVerifyInfo.can_verify)}
              variant={actionDialog?.type === 'reject' || actionDialog?.type === 'reset' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  {actionDialog?.type === 'verify' && <Check className="w-4 h-4 mr-2" />}
                  {actionDialog?.type === 'reject' && <X className="w-4 h-4 mr-2" />}
                  {actionDialog?.type === 'reset' && <RotateCcw className="w-4 h-4 mr-2" />}
                  {actionDialog?.type === 'review' && <Clock className="w-4 h-4 mr-2" />}
                </>
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
