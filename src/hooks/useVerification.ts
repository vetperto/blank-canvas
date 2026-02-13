import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Debounce mechanism to prevent duplicate notifications
const notificationSentMap = new Map<string, number>();
const NOTIFICATION_COOLDOWN_MS = 5000; // 5 seconds cooldown

export type VerificationStatus = 'not_verified' | 'under_review' | 'verified' | 'rejected';

export interface ProfessionalVerification {
  id: string;
  full_name: string;
  social_name: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  user_type: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  crmv?: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  documents_count: number;
  has_crmv_document: boolean;
  has_id_document: boolean;
}

export interface VerificationLog {
  id: string;
  profile_id: string;
  action: string;
  old_status: VerificationStatus | null;
  new_status: VerificationStatus | null;
  notes: string | null;
  performed_by: string;
  created_at: string;
  admin_name?: string;
}

export interface VerificationStats {
  total_professionals: number;
  not_verified: number;
  under_review: number;
  verified: number;
  rejected: number;
}

export function useVerification() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<ProfessionalVerification[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [stats, setStats] = useState<VerificationStats>({
    total_professionals: 0,
    not_verified: 0,
    under_review: 0,
    verified: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch verification statistics
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_verification_stats');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0] as VerificationStats);
      }
    } catch (error) {
      console.error("Error fetching verification stats:", error);
    }
  }, []);

  // Fetch all professionals for verification management
  const fetchProfessionals = useCallback(async (statusFilter?: VerificationStatus) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          social_name,
          phone,
          profile_picture_url,
          user_type,
          verification_status,
          verified_at,
          verified_by,
          verification_notes,
          city,
          state,
          created_at
        `)
        .in("user_type", ["profissional", "empresa"])
        .order("created_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("verification_status", statusFilter);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Get document counts for each profile
      const profileIds = profiles?.map(p => p.id) || [];
      
      const { data: documents } = await supabase
        .from("documents")
        .select("profile_id, document_type, is_verified")
        .in("profile_id", profileIds);

      // Map document info to profiles
      const enrichedProfiles: ProfessionalVerification[] = (profiles || []).map(profile => {
        const profileDocs = documents?.filter(d => d.profile_id === profile.id) || [];
        const hasCrmv = profileDocs.some(d => d.document_type === 'crmv' && d.is_verified);
        const hasId = profileDocs.some(d => ['rg', 'cnh'].includes(d.document_type) && d.is_verified);

        return {
          ...profile,
          verification_status: profile.verification_status as VerificationStatus,
          documents_count: profileDocs.length,
          has_crmv_document: hasCrmv,
          has_id_document: hasId,
        };
      });

      setProfessionals(enrichedProfiles);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.error("Erro ao carregar profissionais");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch verification logs for a profile
  const fetchVerificationLogs = useCallback(async (profileId: string) => {
    try {
      const { data: logs, error } = await supabase
        .from("verification_logs")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVerificationLogs((logs || []) as VerificationLog[]);
    } catch (error) {
      console.error("Error fetching verification logs:", error);
    }
  }, []);

  // Send verification notification via edge function
  const sendVerificationNotification = useCallback(async (
    profileId: string,
    newStatus: VerificationStatus,
    oldStatus?: VerificationStatus,
    notes?: string
  ) => {
    // Check cooldown to prevent duplicate notifications
    const cacheKey = `${profileId}-${newStatus}`;
    const lastSent = notificationSentMap.get(cacheKey);
    const now = Date.now();
    
    if (lastSent && (now - lastSent) < NOTIFICATION_COOLDOWN_MS) {
      console.log("Skipping notification - cooldown active");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-notification', {
        body: { profileId, newStatus, oldStatus, notes }
      });

      if (error) {
        console.error("Error sending verification notification:", error);
      } else {
        console.log("Verification notification sent:", data);
        notificationSentMap.set(cacheKey, now);
      }
    } catch (error) {
      console.error("Error invoking notification function:", error);
    }
  }, []);

  // Change verification status
  const changeVerificationStatus = useCallback(async (
    profileId: string,
    newStatus: VerificationStatus,
    notes?: string
  ) => {
    if (!user) return false;

    // Get current status before change
    const currentProfessional = professionals.find(p => p.id === profileId);
    const oldStatus = currentProfessional?.verification_status;

    try {
      const { data, error } = await supabase.rpc('change_verification_status', {
        _profile_id: profileId,
        _new_status: newStatus,
        _notes: notes || null,
      });

      if (error) throw error;

      const statusLabels: Record<VerificationStatus, string> = {
        not_verified: "Não Verificado",
        under_review: "Em Análise",
        verified: "Verificado",
        rejected: "Rejeitado",
      };

      toast.success(`Status alterado para: ${statusLabels[newStatus]}`);
      
      // Send email notification (async, don't wait)
      sendVerificationNotification(profileId, newStatus, oldStatus, notes);
      
      // Refresh data
      await Promise.all([fetchProfessionals(), fetchStats()]);
      
      return true;
    } catch (error: any) {
      console.error("Error changing verification status:", error);
      toast.error(error.message || "Erro ao alterar status de verificação");
      return false;
    }
  }, [user, professionals, fetchProfessionals, fetchStats, sendVerificationNotification]);

  // Reset verification (convenience method)
  const resetVerification = useCallback(async (
    profileId: string,
    notes?: string
  ) => {
    return changeVerificationStatus(profileId, 'not_verified', notes || 'Verificação resetada pelo administrador');
  }, [changeVerificationStatus]);

  // Check if profile can be verified
  const checkCanVerify = useCallback(async (profileId: string) => {
    try {
      const { data, error } = await supabase.rpc('can_verify_profile', {
        _profile_id: profileId,
      });

      if (error) throw error;

      return data?.[0] || {
        can_verify: false,
        missing_documents: [],
        has_crmv_document: false,
        has_id_document: false,
      };
    } catch (error) {
      console.error("Error checking verification eligibility:", error);
      return {
        can_verify: false,
        missing_documents: ['Erro ao verificar'],
        has_crmv_document: false,
        has_id_document: false,
      };
    }
  }, []);

  return {
    professionals,
    verificationLogs,
    stats,
    isLoading,
    fetchStats,
    fetchProfessionals,
    fetchVerificationLogs,
    changeVerificationStatus,
    resetVerification,
    checkCanVerify,
  };
}
