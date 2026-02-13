import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedProfessional {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  location: string;
  isVerified: boolean;
}

interface RatingResult {
  average_rating: number;
  total_reviews: number;
}

export function useFeaturedProfessionals(limit: number = 4) {
  const [professionals, setProfessionals] = useState<FeaturedProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedProfessionals() {
      setIsLoading(true);
      setError(null);

      try {
        // Query public_search_professionals view (already filters verified + active)
        const { data: profiles, error: profilesError } = await supabase
          .from("public_search_professionals")
          .select("*")
          .not("full_name", "is", null)
          .not("city", "is", null)
          .limit(20);

        if (profilesError) throw profilesError;

        const validProfiles = (profiles ?? []).filter(
          (p): p is typeof p & { id: string } => p.id != null
        );

        if (validProfiles.length === 0) {
          setProfessionals([]);
          return;
        }

        const professionalsWithRatings = await Promise.all(
          validProfiles.map(async (profile) => {
            const { data: ratingData } = await supabase
              .rpc("get_professional_rating", {
                _professional_profile_id: profile.id,
              });

            const rating = (ratingData as RatingResult[] | null)?.[0];

            const { data: services } = await supabase
              .from("services")
              .select("name")
              .eq("profile_id", profile.id)
              .eq("is_active", true)
              .limit(5);

            let specialty = "Profissional Pet";
            if (profile.crmv) {
              specialty = "Veterinário";
            } else if (services?.some((s) =>
              s.name?.toLowerCase().includes("banho") ||
              s.name?.toLowerCase().includes("tosa")
            )) {
              specialty = "Pet Groomer • Banho e Tosa";
            } else if (services?.some((s) =>
              s.name?.toLowerCase().includes("passeio") ||
              s.name?.toLowerCase().includes("walker")
            )) {
              specialty = "Pet Walker";
            } else if (services && services.length > 0) {
              specialty = services[0].name;
            }

            const locationParts = [profile.city, profile.state].filter(Boolean);
            const location = locationParts.length > 0
              ? locationParts.join(", ")
              : "Brasil";

            return {
              id: profile.id,
              name: profile.social_name || profile.full_name || "Profissional",
              specialty,
              photo: profile.profile_picture_url,
              rating: rating?.average_rating || 0,
              reviewCount: rating?.total_reviews || 0,
              location,
              isVerified: profile.is_verified || false,
            };
          })
        );

        const sorted = professionalsWithRatings.sort((a, b) => {
          if (a.isVerified && !b.isVerified) return -1;
          if (!a.isVerified && b.isVerified) return 1;
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        });

        setProfessionals(sorted.slice(0, limit));
      } catch (err) {
        console.error("Error fetching featured professionals:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedProfessionals();
  }, [limit]);

  return { professionals, isLoading, error };
}
