import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Filter,
  Eye,
  Ban,
  Unlock,
  Trash2,
  MoreVertical,
  UserCog,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  BadgeCheck,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminUsers, AdminUser, AccountStatus } from "@/hooks/useAdminUsers";
import { useNavigate } from "react-router-dom";

export default function AdminProfessionals() {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    totalCount,
    fetchUsers,
    getUserDetails,
    changeAccountStatus,
    toggleFeatured,
    deleteUser,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "all">("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<AdminUser | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    type: "block" | "unblock" | "delete" | "feature" | "unfeature";
    user: AdminUser;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const filters = {
      userType: "profissional" as const,
      search: searchQuery || undefined,
      accountStatus: statusFilter !== "all" ? statusFilter : undefined,
      isVerified: verificationFilter === "verified" ? true : verificationFilter === "unverified" ? false : undefined,
    };
    fetchUsers(filters, currentPage, pageSize);
  }, [fetchUsers, searchQuery, statusFilter, verificationFilter, currentPage]);

  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsDetailsLoading(true);
    const details = await getUserDetails(user.id);
    setUserDetails(details);
    setIsDetailsLoading(false);
  };

  const handleAction = async () => {
    if (!actionDialog) return;

    let success = false;
    switch (actionDialog.type) {
      case "block":
        success = await changeAccountStatus(actionDialog.user.id, "blocked", actionReason);
        break;
      case "unblock":
        success = await changeAccountStatus(actionDialog.user.id, "active", actionReason);
        break;
      case "delete":
        success = await deleteUser(actionDialog.user.id, actionReason);
        break;
      case "feature":
        success = await toggleFeatured(actionDialog.user.id, true);
        break;
      case "unfeature":
        success = await toggleFeatured(actionDialog.user.id, false);
        break;
    }

    if (success) {
      setActionDialog(null);
      setActionReason("");
      fetchUsers({ userType: "profissional" }, currentPage, pageSize);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Ativo", variant: "default" },
      blocked: { label: "Bloqueado", variant: "destructive" },
      suspended: { label: "Suspenso", variant: "secondary" },
      pending: { label: "Pendente", variant: "outline" },
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getVerificationBadge = (status: string | null, isVerified: boolean) => {
    if (isVerified || status === "verified") {
      return (
        <Badge className="bg-green-500/10 text-green-600">
          <BadgeCheck className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      );
    }
    if (status === "under_review") {
      return <Badge className="bg-yellow-500/10 text-yellow-600">Em Análise</Badge>;
    }
    if (status === "rejected") {
      return <Badge variant="destructive">Rejeitado</Badge>;
    }
    return <Badge variant="outline">Não verificado</Badge>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout
      title="Gestão de Profissionais"
      description="Gerenciar contas de profissionais veterinários"
      actions={
        <Button onClick={() => navigate("/admin/verificacao")}>
          <BadgeCheck className="w-4 h-4 mr-2" />
          Verificação de Perfis
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, CRMV..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as AccountStatus | "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={verificationFilter}
            onValueChange={(v) => {
              setVerificationFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <BadgeCheck className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Verificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="verified">Verificados</SelectItem>
              <SelectItem value="unverified">Não verificados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum profissional encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>CRMV</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_picture_url || undefined} />
                            <AvatarFallback>
                              {user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {user.social_name || user.full_name}
                              </p>
                              {user.is_featured && (
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {user.cpf || "CPF não informado"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.crmv ? (
                          <Badge variant="outline">{user.crmv}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.phone || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.city && user.state ? (
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {user.city}, {user.state}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(user.verification_status, user.is_verified)}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_featured ? (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "unfeature", user })}
                              >
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                Remover destaque
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "feature", user })}
                              >
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                Destacar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.account_status === "blocked" ? (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "unblock", user })}
                              >
                                <Unlock className="w-4 h-4 mr-2 text-green-600" />
                                Desbloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "block", user })}
                              >
                                <Ban className="w-4 h-4 mr-2 text-orange-600" />
                                Bloquear
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setActionDialog({ type: "delete", user })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir conta
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Profissional</DialogTitle>
          </DialogHeader>
          {isDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userDetails.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {userDetails.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {userDetails.social_name || userDetails.full_name}
                    </h3>
                    {userDetails.is_verified && (
                      <BadgeCheck className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{userDetails.phone || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">
                      {userDetails.reviews_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Avaliações</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">
                      {userDetails.appointments_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Atendimentos</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">CRMV</Label>
                  <p>{userDetails.crmv || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CPF</Label>
                  <p>{userDetails.cpf || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p>{userDetails.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Localização</Label>
                  <p>
                    {userDetails.city && userDetails.state
                      ? `${userDetails.city}, ${userDetails.state}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.type === "block" && "Bloquear Profissional"}
              {actionDialog?.type === "unblock" && "Desbloquear Profissional"}
              {actionDialog?.type === "delete" && "Excluir Profissional"}
              {actionDialog?.type === "feature" && "Destacar Profissional"}
              {actionDialog?.type === "unfeature" && "Remover Destaque"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.type === "block" &&
                "O profissional não poderá acessar sua conta enquanto estiver bloqueado."}
              {actionDialog?.type === "unblock" &&
                "O profissional poderá acessar sua conta novamente."}
              {actionDialog?.type === "delete" &&
                "Esta ação é irreversível. Todos os dados do profissional serão excluídos."}
              {actionDialog?.type === "feature" &&
                "O profissional será destacado nos resultados de busca."}
              {actionDialog?.type === "unfeature" &&
                "O destaque será removido deste profissional."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(actionDialog?.type === "block" ||
            actionDialog?.type === "unblock" ||
            actionDialog?.type === "delete") && (
            <div className="py-4">
              <Label>Motivo (obrigatório)</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Descreva o motivo desta ação..."
                className="mt-2"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionReason("")}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={
                (actionDialog?.type === "block" ||
                  actionDialog?.type === "unblock" ||
                  actionDialog?.type === "delete") &&
                !actionReason.trim()
              }
              className={
                actionDialog?.type === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
