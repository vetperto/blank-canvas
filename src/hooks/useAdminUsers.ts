import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type UserType = "tutor" | "profissional" | "empresa";
export type AccountStatus = "active" | "blocked" | "suspended" | "pending";

export interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  social_name: string | null;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
  crmv: string | null;
  user_type: UserType;
  account_status: string;
  is_verified: boolean;
  is_featured: boolean;
  verification_status: "not_verified" | "under_review" | "verified" | "rejected" | null;
  city: string | null;
  state: string | null;
  created_at: string;
  profile_picture_url: string | null;
  pets_count?: number;
  appointments_count?: number;
  reviews_count?: number;
}

export interface UserFilters {
  search?: string;
  userType?: UserType;
  accountStatus?: AccountStatus;
  isVerified?: boolean;
  isFeatured?: boolean;
  city?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "created_at" | "full_name" | "email";
  sortOrder?: "asc" | "desc";
}

export function useAdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(
    async (filters: UserFilters = {}, page = 1, pageSize = 20) => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" });

        // Apply filters
        if (filters.userType) {
          query = query.eq("user_type", filters.userType);
        }

        if (filters.accountStatus) {
          query = query.eq("account_status", filters.accountStatus);
        }

        if (filters.isVerified !== undefined) {
          query = query.eq("is_verified", filters.isVerified);
        }

        if (filters.isFeatured !== undefined) {
          query = query.eq("is_featured", filters.isFeatured);
        }

        if (filters.city) {
          query = query.ilike("city", `%${filters.city}%`);
        }

        if (filters.state) {
          query = query.eq("state", filters.state);
        }

        if (filters.dateFrom) {
          query = query.gte("created_at", filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte("created_at", filters.dateTo);
        }

        if (filters.search) {
          query = query.or(
            `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`
          );
        }

        // Sorting
        const sortBy = filters.sortBy || "created_at";
        const sortOrder = filters.sortOrder || "desc";
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        setUsers((data as AdminUser[]) || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getUserDetails = useCallback(async (profileId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (profileError) throw profileError;

      // Get pets count for tutors
      let petsCount = 0;
      if (profile.user_type === "tutor") {
        const { count } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", profileId);
        petsCount = count || 0;
      }

      // Get appointments count
      const { count: appointmentsCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .or(`tutor_profile_id.eq.${profileId},professional_profile_id.eq.${profileId}`);

      // Get reviews count
      const { count: reviewsCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .or(`tutor_profile_id.eq.${profileId},professional_profile_id.eq.${profileId}`);

      return {
        ...profile,
        pets_count: petsCount,
        appointments_count: appointmentsCount || 0,
        reviews_count: reviewsCount || 0,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Erro ao carregar detalhes do usuário");
      return null;
    }
  }, []);

  const updateUser = useCallback(
    async (profileId: string, updates: Record<string, unknown>, reason?: string) => {
      if (!user) return false;

      try {
        // Get current values for logging
        const { data: oldData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        const { error } = await supabase
          .from("profiles")
          .update(updates as any)
          .eq("id", profileId);

        if (error) throw error;

        // Log the action
        await supabase.from("admin_logs").insert([{
          admin_user_id: user.id,
          action: "update_user",
          entity_type: "profile",
          entity_id: profileId,
          old_value: oldData as any,
          new_value: { ...oldData, ...updates } as any,
          description: reason || `Usuário atualizado`,
        }]);

        toast.success("Usuário atualizado com sucesso");
        return true;
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Erro ao atualizar usuário");
        return false;
      }
    },
    [user]
  );

  const changeAccountStatus = useCallback(
    async (profileId: string, status: AccountStatus, reason: string) => {
      if (!user) return false;

      try {
        const { data: oldData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        const { error } = await supabase
          .from("profiles")
          .update({ account_status: status })
          .eq("id", profileId);

        if (error) throw error;

        // Log the action
        await supabase.from("admin_logs").insert({
          admin_user_id: user.id,
          action: status === "blocked" ? "block_user" : status === "active" ? "unblock_user" : "change_status",
          entity_type: "profile",
          entity_id: profileId,
          old_value: { account_status: oldData?.account_status },
          new_value: { account_status: status },
          description: reason,
        });

        const statusMessages: Record<AccountStatus, string> = {
          active: "Conta ativada",
          blocked: "Conta bloqueada",
          suspended: "Conta suspensa",
          pending: "Conta pendente",
        };

        toast.success(statusMessages[status]);
        return true;
      } catch (error) {
        console.error("Error changing account status:", error);
        toast.error("Erro ao alterar status da conta");
        return false;
      }
    },
    [user]
  );

  const toggleFeatured = useCallback(
    async (profileId: string, featured: boolean) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_featured: featured })
          .eq("id", profileId);

        if (error) throw error;

        // Log the action
        await supabase.from("admin_logs").insert({
          admin_user_id: user.id,
          action: featured ? "feature_user" : "unfeature_user",
          entity_type: "profile",
          entity_id: profileId,
          new_value: { is_featured: featured },
          description: featured ? "Profissional destacado" : "Destaque removido",
        });

        toast.success(featured ? "Profissional destacado" : "Destaque removido");
        return true;
      } catch (error) {
        console.error("Error toggling featured:", error);
        toast.error("Erro ao alterar destaque");
        return false;
      }
    },
    [user]
  );

  const deleteUser = useCallback(
    async (profileId: string, reason: string) => {
      if (!user) return false;

      try {
        // Get user info before deletion
        const { data: userData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        // Log the action before deletion
        await supabase.from("admin_logs").insert([{
          admin_user_id: user.id,
          action: "delete_user",
          entity_type: "profile",
          entity_id: profileId,
          old_value: userData as any,
          description: reason,
        }]);

        // Delete the profile (this should cascade to related data)
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profileId);

        if (error) throw error;

        toast.success("Usuário excluído com sucesso");
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Erro ao excluir usuário");
        return false;
      }
    },
    [user]
  );

  return {
    users,
    isLoading,
    totalCount,
    fetchUsers,
    getUserDetails,
    updateUser,
    changeAccountStatus,
    toggleFeatured,
    deleteUser,
  };
}
