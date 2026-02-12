import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapping of Stripe product IDs to local subscription slugs
const PRODUCT_TO_SLUG: Record<string, string> = {
  "prod_TpLBnjdZLViNZe": "basico",
  "prod_TpLCjtWx3U8NIq": "intermediario",
  "prod_TpLCwKtKHrasIG": "completo",
  "prod_TpLCwkmt7HfeJW": "empresas",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, user_type")
      .eq("user_id", user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    logStep("Profile found", { profileId: profile.id, userType: profile.user_type });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, syncing unsubscribed state");
      
      // Cancel any existing local subscriptions
      await supabaseClient
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("profile_id", profile.id)
        .eq("status", "active");
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      stripeSubscriptionId = subscription.id;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      logStep("Determined subscription details", { productId, priceId });

      // Find corresponding local subscription by slug
      const slug = PRODUCT_TO_SLUG[productId];
      if (slug) {
        const { data: localSubscription } = await supabaseClient
          .from("subscriptions")
          .select("id")
          .eq("slug", slug)
          .single();

        if (localSubscription) {
          logStep("Found local subscription", { subscriptionId: localSubscription.id, slug });

          // Check if user already has an active subscription record
          const { data: existingUserSub } = await supabaseClient
            .from("user_subscriptions")
            .select("id, subscription_id")
            .eq("profile_id", profile.id)
            .eq("status", "active")
            .single();

          if (existingUserSub) {
            // Update existing subscription if different
            if (existingUserSub.subscription_id !== localSubscription.id) {
              await supabaseClient
                .from("user_subscriptions")
                .update({
                  subscription_id: localSubscription.id,
                  stripe_subscription_id: stripeSubscriptionId,
                  stripe_customer_id: customerId,
                  end_date: subscriptionEnd.split('T')[0],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingUserSub.id);
              logStep("Updated existing subscription record");
            } else {
              // Just update the end date
              await supabaseClient
                .from("user_subscriptions")
                .update({
                  end_date: subscriptionEnd.split('T')[0],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingUserSub.id);
              logStep("Updated subscription end date");
            }
          } else {
            // Cancel any old subscriptions first
            await supabaseClient
              .from("user_subscriptions")
              .update({ status: "cancelled" })
              .eq("profile_id", profile.id)
              .neq("status", "cancelled");

            // Create new subscription record
            const startDate = new Date(subscription.current_period_start * 1000).toISOString().split('T')[0];
            const endDate = subscriptionEnd.split('T')[0];
            
            await supabaseClient
              .from("user_subscriptions")
              .insert({
                profile_id: profile.id,
                subscription_id: localSubscription.id,
                stripe_subscription_id: stripeSubscriptionId,
                stripe_customer_id: customerId,
                status: "active",
                start_date: startDate,
                end_date: endDate,
              });
            logStep("Created new subscription record");
          }
        }
      }
    } else {
      logStep("No active subscription found, cancelling local records");
      
      // Cancel any existing local subscriptions
      await supabaseClient
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("profile_id", profile.id)
        .eq("status", "active");
    }

    // Get appointment limits info
    const { data: limitsData } = await supabaseClient
      .rpc("can_accept_appointment", { _professional_profile_id: profile.id });
    
    const limits = limitsData?.[0] || null;
    logStep("Appointment limits", limits);

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      appointment_limits: limits ? {
        can_accept: limits.can_accept,
        current_count: limits.current_count,
        monthly_limit: limits.monthly_limit,
        remaining: limits.remaining,
        plan_name: limits.plan_name,
      } : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
