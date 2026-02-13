import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Payment method ID to display label mapping
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
  cash: "Dinheiro"
};

function formatPaymentMethods(methods: string[]): string[] {
  if (!methods || methods.length === 0) {
    return ["Consulte"]; // Default when no methods configured
  }
  return methods.map(m => PAYMENT_METHOD_LABELS[m] || m);
}

export interface ProfessionalProfileData {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  views: number;
  location: string;
  address: string;
  crmv: string | null;
  isVerified: boolean;
  planType: "basic" | "intermediate" | "complete" | "enterprise";
  description: string;
  services: Array<{
    name: string;
    price: string;
    duration: string;
  }>;
  paymentMethods: string[];
  attendanceTypes: string[];
  experience: string;
  education: Array<{
    title: string;
    institution: string;
    year: string;
  }>;
  availability: Record<string, string[]>;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    pet: string;
  }>;
}

export function useProfessionalProfile(profileId: string | undefined) {
  const [professional, setProfessional] = useState<ProfessionalProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    async function fetchProfessional() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch profile data from public view (excludes sensitive fields like CPF, email, phone)
        const { data: profile, error: profileError } = await (supabase
          .from("public_search_professionals" as any)
          .select("*") as any)
          .eq("id", profileId)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profissional não encontrado");

        // Fetch services
        const { data: services } = await supabase
          .from("services")
          .select("*")
          .eq("profile_id", profileId)
          .eq("is_active", true);

        // Fetch reviews
        const { data: reviews } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            tutor_profile_id,
            profiles!reviews_tutor_profile_id_fkey (full_name, social_name)
          `)
          .eq("professional_profile_id", profileId)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch availability
        const { data: availability } = await supabase
          .from("availability")
          .select("*")
          .eq("profile_id", profileId);

        // Fetch education
        const { data: education } = await supabase
          .from("professional_education")
          .select("*")
          .eq("profile_id", profileId)
          .order("year", { ascending: false });

        // Fetch subscription for plan type
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select(`
            subscription_id,
            subscriptions (slug, name)
          `)
          .eq("profile_id", profileId)
          .eq("status", "active")
          .maybeSingle();

        // Calculate average rating
        const avgRating = reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Build location string (public view doesn't expose exact street address for privacy)
        const locationParts = [profile.neighborhood, profile.city, profile.state].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : "Localização não informada";
        
        // Address not exposed in public view - use neighborhood/city instead
        const address = location;

        // Determine specialty
        let specialty = "Profissional Pet";
        if (profile.crmv) {
          specialty = "Veterinário";
        } else if (services?.some(s => s.name?.toLowerCase().includes("banho") || s.name?.toLowerCase().includes("tosa"))) {
          specialty = "Pet Groomer • Banho e Tosa";
        } else if (services?.some(s => s.name?.toLowerCase().includes("passeio") || s.name?.toLowerCase().includes("walker"))) {
          specialty = "Pet Walker";
        }

        // Determine plan type
        let planType: "basic" | "intermediate" | "complete" | "enterprise" = "basic";
        if (subscription?.subscriptions?.slug) {
          const slug = subscription.subscriptions.slug;
          if (slug.includes("empresas") || slug.includes("enterprise")) {
            planType = "enterprise";
          } else if (slug.includes("completo") || slug.includes("complete")) {
            planType = "complete";
          } else if (slug.includes("intermediario") || slug.includes("intermediate")) {
            planType = "intermediate";
          }
        }

        // Build availability by day
        const availabilityByDay: Record<string, string[]> = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        };

        availability?.forEach((slot) => {
          const dayKey = slot.day_of_week;
          if (availabilityByDay[dayKey]) {
            // Generate time slots between start and end time
            const startHour = parseInt(slot.start_time.split(":")[0]);
            const endHour = parseInt(slot.end_time.split(":")[0]);
            for (let hour = startHour; hour < endHour; hour++) {
              availabilityByDay[dayKey].push(`${hour.toString().padStart(2, "0")}:00`);
            }
          }
        });

        // Format services
        const formattedServices = (services || []).map((s) => ({
          name: s.name,
          price: s.price ? `R$ ${s.price.toFixed(2).replace(".", ",")}` : "Consulte",
          duration: `${s.duration_minutes} min`,
        }));

        // Format reviews
        const formattedReviews = (reviews || []).map((r: any) => ({
          id: r.id,
          author: r.profiles?.social_name || r.profiles?.full_name || "Anônimo",
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("pt-BR"),
          comment: r.comment || "",
          pet: "",
        }));

        // Calculate experience
        const yearsExp = profile.years_experience || 0;
        const experience = yearsExp > 0 ? `${yearsExp} anos` : "Não informado";

        const professionalData: ProfessionalProfileData = {
          id: profile.id,
          name: profile.social_name || profile.full_name,
          specialty,
          photo: profile.profile_picture_url,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews?.length || 0,
          views: Math.floor(Math.random() * 1000) + 100, // Mock views for now
          location,
          address,
          crmv: profile.crmv,
          isVerified: profile.is_verified || false,
          planType,
          description: profile.bio || "Este profissional ainda não adicionou uma descrição.",
          services: formattedServices,
          paymentMethods: formatPaymentMethods((profile as any).payment_methods || []),
          attendanceTypes: ["Consultório"], // Default
          experience,
          education: (education || []).map((e) => ({
            title: e.title,
            institution: e.institution,
            year: String(e.year),
          })),
          availability: availabilityByDay,
          reviews: formattedReviews,
        };

        setProfessional(professionalData);
      } catch (err) {
        console.error("Error fetching professional:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessional();
  }, [profileId]);

  return { professional, isLoading, error };
}
