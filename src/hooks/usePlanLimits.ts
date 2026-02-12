import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlanLimits {
  planName: string;
  isSubscribed: boolean;
  monthlyAppointmentsLimit: number;
  hasVerifiedBadge: boolean;
  hasPriceTable: boolean;
  hasPortfolio: boolean;
  portfolioLimit: number;
}

export const usePlanLimits = () => {
  const { profile } = useAuth();
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanLimits = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_professional_plan_limits', { _profile_id: profile.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const limits = data[0];
        setPlanLimits({
          planName: limits.plan_name || 'Sem Plano',
          isSubscribed: limits.is_subscribed || false,
          monthlyAppointmentsLimit: limits.monthly_appointments_limit || 0,
          hasVerifiedBadge: limits.has_verified_badge || false,
          hasPriceTable: limits.has_price_table || false,
          hasPortfolio: limits.has_portfolio || false,
          portfolioLimit: limits.portfolio_limit || 0,
        });
      } else {
        setPlanLimits({
          planName: 'Sem Plano',
          isSubscribed: false,
          monthlyAppointmentsLimit: 0,
          hasVerifiedBadge: false,
          hasPriceTable: false,
          hasPortfolio: false,
          portfolioLimit: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching plan limits:', error);
      setPlanLimits({
        planName: 'Sem Plano',
        isSubscribed: false,
        monthlyAppointmentsLimit: 0,
        hasVerifiedBadge: false,
        hasPriceTable: false,
        hasPortfolio: false,
        portfolioLimit: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchPlanLimits();
  }, [fetchPlanLimits]);

  return {
    planLimits,
    isLoading,
    refetch: fetchPlanLimits,
  };
};
