import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters, ProfessionalResult } from "@/lib/search/types";
import { executeFilterPipeline } from "@/lib/search/filter-pipeline";

export type { SearchFilters, ProfessionalResult };

export function useSearchProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProfessionals = useCallback(async (filters: SearchFilters) => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // === STEP 1: Base query from profiles_public ===
      let query = supabase
        .from("profiles_public")
        .select(`
          id, full_name, social_name, bio, profile_picture_url,
          city, state, neighborhood, is_verified, crmv, user_type,
          latitude, longitude, home_service_radius, payment_methods
        `)
        .in("user_type", ["profissional", "empresa"]);

      // Text-based location filter (city/state/neighborhood)
      if (filters.location && filters.location !== "Minha localização atual") {
        const searchTerm = filters.location.toLowerCase().trim().split(",")[0]?.trim();
        if (searchTerm) {
          query = query.or(
            `city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,neighborhood.ilike.%${searchTerm}%`
          );
        }
      }

      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) throw profilesError;
      if (controller.signal.aborted) return;

      const profileIds = (profilesData || [])
        .map(p => p.id)
        .filter((id): id is string => Boolean(id));

      console.log("PROFILE IDS FOR SERVICES QUERY:", profileIds);

      // === STEP 2: Parallel data fetching ===
      const [servicesResult, ratingsResult, subsResult, availResult] = await Promise.all([
        profileIds.length > 0
          ? supabase.from("services").select("profile_id, name, price, location_type, description")
              .in("profile_id", profileIds).eq("is_active", true)
          : Promise.resolve({ data: [] }),

        profileIds.length > 0
          ? supabase.from("reviews").select("professional_profile_id, rating")
              .in("professional_profile_id", profileIds).eq("is_approved", true)
          : Promise.resolve({ data: [] }),

        profileIds.length > 0
          ? supabase.from("user_subscriptions").select("profile_id, subscription_id, subscriptions (slug)")
              .in("profile_id", profileIds).eq("status", "active")
          : Promise.resolve({ data: [] }),

        (filters.availableToday || filters.availableThisWeek || filters.urgency) && profileIds.length > 0
          ? (() => {
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
              const dayOfWeek = daysOfWeek[new Date().getDay()];
              const daysToCheck = filters.availableToday ? [dayOfWeek] : [...daysOfWeek];
              return supabase.from("availability").select("profile_id, day_of_week")
                .in("profile_id", profileIds).in("day_of_week", daysToCheck);
            })()
          : Promise.resolve({ data: [] }),
      ]);

      if (controller.signal.aborted) return;

      console.log("SERVICES QUERY RESULT:", servicesResult);

      const servicesData = servicesResult.data || [];
      if (servicesData.length === 0) {
        console.warn("Nenhum serviço encontrado para os profiles:", profileIds);
      }
      const ratingsData = ratingsResult.data || [];
      const subsData = subsResult.data || [];
      const availData = availResult.data || [];

      // === STEP 3: Map to ProfessionalResult ===
      const rawResults: ProfessionalResult[] = (profilesData || []).map(profile => {
        const profileServices = servicesData.filter((s: any) => s.profile_id === profile.id);
        const profileRatings = ratingsData.filter((r: any) => r.professional_profile_id === profile.id);
        const profileSub = subsData.find((s: any) => s.profile_id === profile.id) as any;

        const avgRating = profileRatings.length > 0
          ? profileRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / profileRatings.length
          : 0;

        const minPrice = profileServices.length > 0
          ? Math.min(...profileServices.filter((s: any) => s.price).map((s: any) => s.price))
          : null;

        const locationTypes = [
          ...new Set(
            profileServices
              .map((s: any) => s.location_type)
              .filter(Boolean)
          )
        ];

        let specialty = "Profissional Pet";
        if (profile.crmv) specialty = "Veterinário";
        else if (profileServices.some((s: any) => s.name?.toLowerCase().includes("banho") || s.name?.toLowerCase().includes("tosa")))
          specialty = "Pet Groomer • Banho e Tosa";
        else if (profileServices.some((s: any) => s.name?.toLowerCase().includes("passeio") || s.name?.toLowerCase().includes("walker")))
          specialty = "Pet Walker";

        let planType: ProfessionalResult["planType"] = "basic";
        if (profileSub?.subscriptions?.slug) {
          const slug = profileSub.subscriptions.slug;
          if (slug.includes("empresas") || slug.includes("enterprise")) planType = "enterprise";
          else if (slug.includes("completo") || slug.includes("complete")) planType = "complete";
          else if (slug.includes("intermediario") || slug.includes("intermediate")) planType = "intermediate";
        }

        const locationParts = [profile.neighborhood, profile.city, profile.state].filter(Boolean);

        return {
          id: profile.id!,
          name: profile.social_name || profile.full_name || "Profissional",
          specialty,
          photo: profile.profile_picture_url,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: profileRatings.length,
          views: Math.floor(Math.random() * 1000) + 100,
          location: locationParts.length > 0 ? locationParts.join(", ") : "Localização não informada",
          distance: "",
          services: profileServices.map((s: any) => s.name).slice(0, 4),
          isVerified: profile.is_verified || false,
          planType,
          nextAvailable: "Consultar agenda",
          priceRange: minPrice ? `A partir de R$ ${minPrice}` : "Consulte valores",
          city: profile.city ?? undefined,
          state: profile.state ?? undefined,
          neighborhood: profile.neighborhood ?? undefined,
          latitude: profile.latitude ?? undefined,
          longitude: profile.longitude ?? undefined,
          homeServiceRadius: profile.home_service_radius ?? undefined,
          locationTypes: locationTypes as string[],
          petTypes: [],
          paymentMethods: (profile as any).payment_methods || [],
        };
      });

      // === STEP 4: Auto-geocode if location exists but coordinates are missing ===
      let resolvedFilters = { ...filters };
      if (filters.location && filters.location.trim() !== "" && filters.location !== "Minha localização atual" && !filters.coordinates) {
        try {
          console.log("=== AUTO GEOCODING ===", filters.location);
          const searchTerm = filters.location.trim().split(",")[0]?.trim();
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=br&limit=1&accept-language=pt-BR`
          );
          if (controller.signal.aborted) return;
          const geoData = await geoResponse.json();
          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              resolvedFilters.coordinates = { lat, lng };
              console.log("Auto-geocoded coordinates:", { lat, lng });
            }
          } else {
            console.log("Auto-geocoding: nenhum resultado encontrado");
          }
        } catch (geoErr) {
          console.warn("Auto-geocoding falhou, continuando sem coordenadas:", geoErr);
        }
      }

      // === STEP 5: Filter Pipeline (geo + non-geo filters applied here) ===
      const availableIds = (filters.availableToday || filters.availableThisWeek)
        ? [...new Set(availData.map((a: any) => a.profile_id))]
        : undefined;

      const finalResults = executeFilterPipeline(rawResults, resolvedFilters, availableIds);
      
      if (!controller.signal.aborted) {
        setTotalCount(finalResults.length);
        setProfessionals(finalResults);
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError' || error.message?.includes('AbortError') || error.message?.includes('aborted')) return;
      if (!abortControllerRef.current?.signal.aborted) {
        setError(error);
        console.error("Error searching professionals:", err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const clearFilters = useCallback(() => {
    setProfessionals([]);
    setTotalCount(0);
    setError(null);
  }, []);

  return { professionals, isLoading, error, totalCount, searchProfessionals, getCurrentLocation, clearFilters };
}
