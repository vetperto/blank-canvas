import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters, ProfessionalResult } from "@/lib/search/types";
import type { PublicSearchProfessional } from "@/lib/search/public-professional";
import { applyServiceFilter, applyLocationTypeFilter, applyRatingFilter, applyPaymentFilter, applySorting } from "@/lib/search/filter-pipeline";

export type { SearchFilters, ProfessionalResult };

/** Shape returned by the `search_professionals_by_radius` RPC. */
interface RpcProfessionalResult {
  id: string;
  full_name: string;
  social_name: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  profile_picture_url: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  distance_meters: number | null;
  crmv: string | null;
  is_verified: boolean | null;
  payment_methods: string[] | null;
  latitude: number | null;
  longitude: number | null;
  home_service_radius: number | null;
}

/**
 * Geocode a location string to coordinates using Nominatim.
 */
async function geocodeLocation(
  location: string,
  signal?: AbortSignal
): Promise<{ lat: number; lng: number } | null> {
  try {
    const searchTerm = location.trim().split(",")[0]?.trim();
    if (!searchTerm) return null;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=br&limit=1&accept-language=pt-BR`,
      { signal }
    );
    const data = await response.json();
    if (data?.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  } catch {
    // Silently fail geocoding
  }
  return null;
}

/** Service / subscription / availability enrichment data. */
interface EnrichmentData {
  services: Array<{ profile_id: string; name: string; price: number | null; location_type: string; description: string | null }>;
  subs: Array<{ profile_id: string; subscription_id: string; subscriptions: { slug: string } | null }>;
  avail: Array<{ profile_id: string; day_of_week: string }>;
}

/**
 * Enrich profile IDs with services, subscriptions, and availability data.
 */
async function enrichWithServices(profileIds: string[], filters: SearchFilters): Promise<EnrichmentData> {
  if (profileIds.length === 0) return { services: [], subs: [], avail: [] };

  const [servicesResult, subsResult, availResult] = await Promise.all([
    supabase.from("services")
      .select("profile_id, name, price, location_type, description")
      .in("profile_id", profileIds).eq("is_active", true),

    supabase.from("user_subscriptions")
      .select("profile_id, subscription_id, subscriptions (slug)")
      .in("profile_id", profileIds).eq("status", "active"),

    (filters.availableToday || filters.availableThisWeek || filters.urgency)
      ? (() => {
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
          const dayOfWeek = daysOfWeek[new Date().getDay()];
          const daysToCheck = filters.availableToday ? [dayOfWeek] : [...daysOfWeek];
          return supabase.from("availability").select("profile_id, day_of_week")
            .in("profile_id", profileIds).in("day_of_week", daysToCheck);
        })()
      : Promise.resolve({ data: [] as Array<{ profile_id: string; day_of_week: string }> }),
  ]);

  return {
    services: (servicesResult.data || []) as EnrichmentData["services"],
    subs: (subsResult.data || []) as EnrichmentData["subs"],
    avail: (availResult.data || []) as EnrichmentData["avail"],
  };
}

/**
 * Map a profile + enrichment data to ProfessionalResult.
 */
function mapToProfessionalResult(
  profile: RpcProfessionalResult,
  servicesData: EnrichmentData["services"],
  subsData: EnrichmentData["subs"],
): ProfessionalResult {
  const profileServices = servicesData.filter((s) => s.profile_id === profile.id);
  const profileSub = subsData.find((s) => s.profile_id === profile.id);

  const minPrice = profileServices.length > 0
    ? Math.min(...profileServices.filter((s) => s.price != null).map((s) => s.price!))
    : null;

  const locationTypes = [...new Set(profileServices.map((s) => s.location_type).filter(Boolean))];

  let specialty = "Profissional Pet";
  if (profile.crmv) specialty = "Veterinário";
  else if (profileServices.some((s) => s.name?.toLowerCase().includes("banho") || s.name?.toLowerCase().includes("tosa")))
    specialty = "Pet Groomer • Banho e Tosa";
  else if (profileServices.some((s) => s.name?.toLowerCase().includes("passeio") || s.name?.toLowerCase().includes("walker")))
    specialty = "Pet Walker";

  let planType: ProfessionalResult["planType"] = "basic";
  if (profileSub?.subscriptions?.slug) {
    const slug = profileSub.subscriptions.slug;
    if (slug.includes("empresas") || slug.includes("enterprise")) planType = "enterprise";
    else if (slug.includes("completo") || slug.includes("complete")) planType = "complete";
    else if (slug.includes("intermediario") || slug.includes("intermediate")) planType = "intermediate";
  }

  const locationParts = [profile.neighborhood, profile.city, profile.state].filter(Boolean);
  const distanceKm = profile.distance_meters != null ? profile.distance_meters / 1000 : undefined;

  return {
    id: profile.id,
    name: profile.social_name || profile.full_name || "Profissional",
    specialty,
    photo: profile.profile_picture_url,
    rating: Math.round((profile.average_rating || 0) * 10) / 10,
    reviewCount: profile.total_reviews || 0,
    views: Math.floor(Math.random() * 1000) + 100,
    location: locationParts.length > 0 ? locationParts.join(", ") : "Localização não informada",
    distance: distanceKm ? `${distanceKm.toFixed(1)} km` : "",
    distanceKm,
    services: profileServices.map((s) => s.name).slice(0, 4),
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
    locationTypes: locationTypes,
    petTypes: [],
    paymentMethods: profile.payment_methods || [],
  };
}

/**
 * Convert a PublicSearchProfessional row into the RpcProfessionalResult shape
 * so it can be fed into the shared `mapToProfessionalResult` mapper.
 */
function viewRowToRpcShape(row: PublicSearchProfessional): RpcProfessionalResult {
  return {
    id: row.id,
    full_name: row.full_name,
    social_name: row.social_name,
    bio: row.bio,
    city: row.city,
    state: row.state,
    neighborhood: row.neighborhood,
    profile_picture_url: row.profile_picture_url,
    average_rating: row.average_rating,
    total_reviews: row.total_reviews,
    distance_meters: null,
    crmv: row.crmv,
    is_verified: row.is_verified,
    payment_methods: row.payment_methods,
    latitude: null,
    longitude: null,
    home_service_radius: row.home_service_radius,
  };
}

export function useSearchProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProfessionals = useCallback(async (filters: SearchFilters) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // === Resolve coordinates if needed ===
      let coordinates = filters.coordinates;
      if (!coordinates && filters.location && filters.location !== "Minha localização atual" && filters.location.trim() !== "") {
        coordinates = await geocodeLocation(filters.location, controller.signal);
      }
      if (controller.signal.aborted) return;

      let profilesData: RpcProfessionalResult[];

      if (coordinates) {
        // === GEO SEARCH: Use RPC search_professionals_by_radius ===
        const radiusMeters = (filters.radius || 10) * 1000;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = await supabase.rpc(
          'search_professionals_by_radius' as any,
          {
            user_lat: coordinates.lat,
            user_lng: coordinates.lng,
            radius_meters: radiusMeters,
          }
        );

        if (rpcError) {
          console.error("Erro na busca geográfica (RPC):", rpcError);
          throw rpcError;
        }
        if (controller.signal.aborted) return;

        profilesData = ((data || []) as RpcProfessionalResult[]).map((p) => ({
          ...p,
          social_name: p.social_name ?? null,
          neighborhood: p.neighborhood ?? null,
          crmv: p.crmv ?? null,
          is_verified: p.is_verified ?? true,
          payment_methods: p.payment_methods ?? [],
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          home_service_radius: p.home_service_radius ?? null,
        }));
      } else {
        // === TEXT SEARCH: Fallback to public_search_professionals view ===
        let query = supabase
          .from("public_search_professionals")
          .select("*");

        if (filters.location && filters.location !== "Minha localização atual") {
          const searchTerm = filters.location.toLowerCase().trim().split(",")[0]?.trim();
          if (searchTerm) {
            query = query.or(
              `city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,neighborhood.ilike.%${searchTerm}%`
            );
          }
        }

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        if (controller.signal.aborted) return;

        const viewRows = (data ?? []) as PublicSearchProfessional[];
        profilesData = viewRows.map(viewRowToRpcShape);
      }

      // === Enrich with services, subscriptions, availability ===
      const profileIds = profilesData.map((p) => p.id).filter(Boolean);
      const enrichment = await enrichWithServices(profileIds, filters);
      if (controller.signal.aborted) return;

      // === Map to ProfessionalResult ===
      let results: ProfessionalResult[] = profilesData.map((profile) =>
        mapToProfessionalResult(profile, enrichment.services, enrichment.subs)
      );

      // === Apply non-geo filters ===
      if (filters.searchMode === "local_fixo" || filters.searchMode === "domiciliar") {
        results = results.filter(
          (p) => Array.isArray(p.locationTypes) && p.locationTypes.includes(filters.searchMode)
        );
      }
      results = applyServiceFilter(results, filters.service);
      if (Array.isArray(filters.locationType) && filters.locationType.length > 0) {
        results = applyLocationTypeFilter(results, filters.locationType);
      }
      results = applyRatingFilter(results, filters.minRating);
      results = applyPaymentFilter(results, filters.paymentMethods);

      if (filters.availableToday || filters.availableThisWeek) {
        const availableIds = new Set(enrichment.avail.map((a) => a.profile_id));
        results = results.filter((p) => availableIds.has(p.id));
      }

      results = applySorting(results, !!coordinates);

      if (!controller.signal.aborted) {
        setTotalCount(results.length);
        setProfessionals(results);
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
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
