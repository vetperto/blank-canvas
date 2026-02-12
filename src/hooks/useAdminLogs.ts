import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: unknown;
  new_value: unknown;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
}

export interface LogFilters {
  action?: string;
  entityType?: string;
  adminUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(
    async (filters: LogFilters = {}, page = 1, pageSize = 50) => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("admin_logs")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (filters.action) {
          query = query.eq("action", filters.action);
        }

        if (filters.entityType) {
          query = query.eq("entity_type", filters.entityType);
        }

        if (filters.adminUserId) {
          query = query.eq("admin_user_id", filters.adminUserId);
        }

        if (filters.dateFrom) {
          query = query.gte("created_at", filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte("created_at", filters.dateTo);
        }

        if (filters.search) {
          query = query.ilike("description", `%${filters.search}%`);
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        // Enrich logs with admin user info
        const adminIds = [...new Set(data?.map((log) => log.admin_user_id) || [])];
        const { data: adminProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", adminIds);

        const adminMap = new Map(
          adminProfiles?.map((p) => [p.user_id, { name: p.full_name, email: p.email }]) || []
        );

        const enrichedLogs: AdminLog[] = (data || []).map((log) => ({
          ...log,
          admin_name: adminMap.get(log.admin_user_id)?.name || "Admin",
          admin_email: adminMap.get(log.admin_user_id)?.email || "",
        }));

        setLogs(enrichedLogs);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error fetching admin logs:", error);
        toast.error("Erro ao carregar logs");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getActionLabel = (action: string): string => {
    const actionLabels: Record<string, string> = {
      update_user: "Atualização de usuário",
      block_user: "Bloqueio de conta",
      unblock_user: "Desbloqueio de conta",
      change_status: "Alteração de status",
      feature_user: "Usuário destacado",
      unfeature_user: "Destaque removido",
      delete_user: "Exclusão de usuário",
      verify_document: "Verificação de documento",
      reject_document: "Rejeição de documento",
      approve_review: "Aprovação de avaliação",
      reject_review: "Rejeição de avaliação",
      verify_profile: "Verificação de perfil",
      reject_profile: "Rejeição de perfil",
      reset_verification: "Reset de verificação",
      update_settings: "Atualização de configurações",
    };
    return actionLabels[action] || action;
  };

  const getEntityTypeLabel = (entityType: string): string => {
    const entityLabels: Record<string, string> = {
      profile: "Perfil",
      review: "Avaliação",
      document: "Documento",
      subscription: "Assinatura",
      setting: "Configuração",
    };
    return entityLabels[entityType] || entityType;
  };

  return {
    logs,
    isLoading,
    totalCount,
    fetchLogs,
    getActionLabel,
    getEntityTypeLabel,
  };
}
