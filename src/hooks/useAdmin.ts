import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface PendingReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  tutor_profile_id: string;
  professional_profile_id: string;
  tutor_name: string;
  professional_name: string;
  appointment_id: string | null;
}

export interface PendingDocument {
  id: string;
  profile_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  created_at: string;
  professional_name: string;
  professional_email: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalReviews: 0,
    pendingReviews: 0,
    pendingDocuments: 0,
    verifiedProfessionals: 0,
  });

  // Check if current user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [user]);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Total users (tutors)
      const { count: tutorCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "tutor");

      // Total professionals
      const { count: professionalCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("user_type", ["profissional", "empresa"]);

      // Verified professionals
      const { count: verifiedCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("user_type", ["profissional", "empresa"])
        .eq("is_verified", true);

      // Total reviews
      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      // Pending reviews
      const { count: pendingReviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_moderated", false);

      // Pending documents
      const { count: pendingDocCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", false);

      setStats({
        totalUsers: tutorCount || 0,
        totalProfessionals: professionalCount || 0,
        totalReviews: reviewCount || 0,
        pendingReviews: pendingReviewCount || 0,
        pendingDocuments: pendingDocCount || 0,
        verifiedProfessionals: verifiedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [isAdmin]);

  // Fetch pending reviews
  const fetchPendingReviews = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          tutor_profile_id,
          professional_profile_id,
          appointment_id
        `)
        .eq("is_moderated", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profile names
      const profileIds = [
        ...new Set([
          ...(reviews?.map(r => r.tutor_profile_id) || []),
          ...(reviews?.map(r => r.professional_profile_id) || []),
        ]),
      ];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, social_name")
        .in("id", profileIds);

      const profileMap = new Map(
        profiles?.map(p => [p.id, p.social_name || p.full_name]) || []
      );

      const enrichedReviews: PendingReview[] = (reviews || []).map(r => ({
        ...r,
        tutor_name: profileMap.get(r.tutor_profile_id) || "Usuário",
        professional_name: profileMap.get(r.professional_profile_id) || "Profissional",
      }));

      setPendingReviews(enrichedReviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
    }
  }, [isAdmin]);

  // Fetch pending documents
  const fetchPendingDocuments = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data: documents, error } = await supabase
        .from("documents")
        .select(`
          id,
          profile_id,
          document_type,
          file_name,
          file_url,
          created_at
        `)
        .eq("is_verified", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profile names
      const profileIds = documents?.map(d => d.profile_id) || [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, social_name")
        .in("id", profileIds);

      const profileMap = new Map(
        profiles?.map(p => [p.id, { name: p.social_name || p.full_name }]) || []
      );

      const enrichedDocs: PendingDocument[] = (documents || []).map(d => ({
        ...d,
        professional_name: profileMap.get(d.profile_id)?.name || "Profissional",
        professional_email: "",
      }));

      setPendingDocuments(enrichedDocs);
    } catch (error) {
      console.error("Error fetching pending documents:", error);
    }
  }, [isAdmin]);

  // Moderate review
  const moderateReview = useCallback(async (
    reviewId: string, 
    approved: boolean, 
    notes?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          is_moderated: true,
          is_approved: approved,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
          moderation_notes: notes || (approved ? "Aprovado pelo administrador" : "Rejeitado pelo administrador"),
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success(approved ? "Avaliação aprovada" : "Avaliação rejeitada");
      await fetchPendingReviews();
      await fetchStats();
      return true;
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error("Erro ao moderar avaliação");
      return false;
    }
  }, [user, fetchPendingReviews, fetchStats]);

  // Verify document
  const verifyDocument = useCallback(async (
    documentId: string,
    profileId: string,
    approved: boolean
  ) => {
    if (!user) return false;

    try {
      const { error: docError } = await supabase
        .from("documents")
        .update({
          is_verified: approved,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", documentId);

      if (docError) throw docError;

      // If approved and this is a CRMV document, mark professional as verified
      if (approved) {
        const { data: doc } = await supabase
          .from("documents")
          .select("document_type")
          .eq("id", documentId)
          .single();

        if (doc?.document_type === "crmv") {
          await supabase
            .from("profiles")
            .update({ is_verified: true })
            .eq("id", profileId);
        }
      }

      toast.success(approved ? "Documento verificado" : "Documento rejeitado");
      await fetchPendingDocuments();
      await fetchStats();
      return true;
    } catch (error) {
      console.error("Error verifying document:", error);
      toast.error("Erro ao verificar documento");
      return false;
    }
  }, [user, fetchPendingDocuments, fetchStats]);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      toast.success("Documento removido");
      await fetchPendingDocuments();
      await fetchStats();
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao remover documento");
      return false;
    }
  }, [fetchPendingDocuments, fetchStats]);

  return {
    isAdmin,
    isLoading,
    stats,
    pendingReviews,
    pendingDocuments,
    fetchStats,
    fetchPendingReviews,
    fetchPendingDocuments,
    moderateReview,
    verifyDocument,
    deleteDocument,
  };
}
