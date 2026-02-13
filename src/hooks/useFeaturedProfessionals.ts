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
        // Fetch professionals from profiles_public view
        // Criteria: professionals or companies with complete profiles
        const { data: profiles, error: profilesError } = await (supabase
          .from("profiles_public" as any)
          .select("*") as any)
          .in("user_type", ["profissional", "empresa"])
          .not("full_name", "is", null)
          .not("city", "is", null)
          .limit(20); // Fetch more to filter and sort

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
          setProfessionals([]);
          return;
        }

        // Fetch ratings for each professional
        const professionalsWithRatings = await Promise.all(
          profiles.map(async (profile) => {
            // Get rating using database function
            const { data: ratingData } = await supabase
              .rpc("get_professional_rating", {
                _professional_profile_id: profile.id,
              });

            const rating = ratingData?.[0] as RatingResult | undefined;

            // Fetch services to determine specialty
            const { data: services } = await supabase
              .from("services")
              .select("name")
              .eq("profile_id", profile.id!)
              .eq("is_active", true)
              .limit(5);

            // Determine specialty based on CRMV or services
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

            // Build location string
            const locationParts = [profile.city, profile.state].filter(Boolean);
            const location = locationParts.length > 0 
              ? locationParts.join(", ") 
              : "Brasil";

            return {
              id: profile.id!,
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

        // Sort by: verified first, then by rating, then by review count
        const sorted = professionalsWithRatings.sort((a, b) => {
          // Verified professionals first
          if (a.isVerified && !b.isVerified) return -1;
          if (!a.isVerified && b.isVerified) return 1;
          
          // Then by rating (higher first)
          if (b.rating !== a.rating) return b.rating - a.rating;
          
          // Then by review count (more reviews first)
          return b.reviewCount - a.reviewCount;
        });

        // Take only the top N professionals
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
