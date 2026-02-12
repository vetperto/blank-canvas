import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPlanByProductId, SubscriptionPlan } from "@/lib/stripe-plans";
import { toast } from "sonner";

interface AppointmentLimits {
  canAccept: boolean;
  currentCount: number;
  monthlyLimit: number | null;
  remaining: number | null;
  planName: string;
}

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  plan: SubscriptionPlan | null;
  appointmentLimits: AppointmentLimits | null;
}

export const useSubscription = () => {
  const { user, profile } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    plan: null,
    appointmentLimits: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        productId: null,
        priceId: null,
        subscriptionEnd: null,
        plan: null,
        appointmentLimits: null,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      const plan = data.product_id ? getPlanByProductId(data.product_id) : null;
      
      const appointmentLimits: AppointmentLimits | null = data.appointment_limits ? {
        canAccept: data.appointment_limits.can_accept,
        currentCount: data.appointment_limits.current_count,
        monthlyLimit: data.appointment_limits.monthly_limit,
        remaining: data.appointment_limits.remaining,
        planName: data.appointment_limits.plan_name,
      } : null;
      
      setSubscriptionStatus({
        subscribed: data.subscribed,
        productId: data.product_id,
        priceId: data.price_id,
        subscriptionEnd: data.subscription_end,
        plan,
        appointmentLimits,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (profile?.user_type === "profissional" || profile?.user_type === "empresa")) {
      checkSubscription();
    }
  }, [user, profile?.user_type, checkSubscription]);

  const createCheckout = async (priceId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao iniciar o checkout. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Erro ao abrir o portal do cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptionStatus,
    isLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
