import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  History,
  Search,
  Filter,
  User,
  FileText,
  Settings,
  Star,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminLogs, AdminLog, LogFilters } from "@/hooks/useAdminLogs";

export default function AdminLogs() {
  const { logs, isLoading, totalCount, fetchLogs, getActionLabel, getEntityTypeLabel } =
    useAdminLogs();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const pageSize = 50;

  useEffect(() => {
    const filters: LogFilters = {
      search: searchQuery || undefined,
      action: actionFilter !== "all" ? actionFilter : undefined,
      entityType: entityFilter !== "all" ? entityFilter : undefined,
    };
    fetchLogs(filters, currentPage, pageSize);
  }, [fetchLogs, searchQuery, actionFilter, entityFilter, currentPage]);

  const getActionBadge = (action: string) => {
    const positiveActions = ["unblock_user", "verify_profile", "approve_review", "feature_user"];
    const negativeActions = ["block_user", "delete_user", "reject_profile", "reject_review"];

    if (positiveActions.includes(action)) {
      return (
        <Badge className="bg-green-500/10 text-green-600">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {getActionLabel(action)}
        </Badge>
      );
    }

    if (negativeActions.includes(action)) {
      return (
        <Badge className="bg-red-500/10 text-red-600">
          <ArrowDownRight className="w-3 h-3 mr-1" />
          {getActionLabel(action)}
        </Badge>
      );
    }

    return <Badge variant="outline">{getActionLabel(action)}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, typeof User> = {
      profile: User,
      review: Star,
      document: FileText,
      setting: Settings,
    };
    const Icon = icons[entityType] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout
      title="Logs de Ações"
      description="Histórico de todas as ações administrativas"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na descrição..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo de ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="update_user">Atualização</SelectItem>
              <SelectItem value="block_user">Bloqueio</SelectItem>
              <SelectItem value="unblock_user">Desbloqueio</SelectItem>
              <SelectItem value="delete_user">Exclusão</SelectItem>
              <SelectItem value="verify_profile">Verificação</SelectItem>
              <SelectItem value="reject_profile">Rejeição</SelectItem>
              <SelectItem value="feature_user">Destaque</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={entityFilter}
            onValueChange={(v) => {
              setEntityFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="profile">Perfil</SelectItem>
              <SelectItem value="review">Avaliação</SelectItem>
              <SelectItem value="document">Documento</SelectItem>
              <SelectItem value="setting">Configuração</SelectItem>
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
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  As ações administrativas aparecerão aqui
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.admin_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.admin_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getEntityIcon(log.entity_type)}
                          {getEntityTypeLabel(log.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">
                          {log.description || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.created_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Administrador</p>
                  <p className="font-medium">{selectedLog.admin_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ação</p>
                  <p>{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entidade</p>
                  <p>{getEntityTypeLabel(selectedLog.entity_type)}</p>
                </div>
              </div>

              {selectedLog.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                  <p className="bg-muted p-3 rounded-lg text-sm">
                    {selectedLog.description}
                  </p>
                </div>
              )}

              {selectedLog.old_value && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Valor Anterior</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Novo Valor</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.entity_id && (
                <div>
                  <p className="text-sm text-muted-foreground">ID da Entidade</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {selectedLog.entity_id}
                  </code>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
