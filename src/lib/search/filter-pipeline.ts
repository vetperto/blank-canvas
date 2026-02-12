import { SearchFilters, ProfessionalResult, SearchMode } from "./types";
import { calculateDistance, isValidCoordinates, normalizeSearchParams } from "./geo-utils";

/* =====================================================
   GEO FILTER
===================================================== */

export function applyGeoFilter(
  results: ProfessionalResult[],
  filters: SearchFilters
): ProfessionalResult[] {
  if (!filters.coordinates) {
    return results;
  }

  const normalized = normalizeSearchParams(
    filters.coordinates.lat,
    filters.coordinates.lng,
    filters.radius,
    filters.searchMode
  );
  console.log("STEP 2 - PARAMS NORMALIZADOS:", normalized);

  if (!normalized || !isValidCoordinates(normalized.lat, normalized.lng)) {
    return results;
  }

  const userRadius =
    typeof normalized.radiusKm === "number" && normalized.radiusKm > 0
      ? normalized.radiusKm
      : 50;

  const withDistance = results.map((p) => {
    const profLat = Number(p.latitude);
    const profLng = Number(p.longitude);

    if (!isValidCoordinates(profLat, profLng)) {
      return { ...p, distanceKm: undefined };
    }

    const distanceKm = calculateDistance(
      normalized.lat,
      normalized.lng,
      profLat,
      profLng
    );

    return { ...p, distanceKm };
  });

  const filtered = withDistance.filter((p) => {
    if (p.distanceKm === undefined) return true;

    const withinUserRadius = p.distanceKm <= userRadius;

    const withinProfessionalCoverage =
      p.homeServiceRadius != null &&
      p.homeServiceRadius > 0 &&
      p.distanceKm <= p.homeServiceRadius;

    return withinUserRadius || withinProfessionalCoverage;
  });

  return filtered;
}

/* =====================================================
   SERVICE FILTER
===================================================== */

export function applyServiceFilter(results: ProfessionalResult[], service?: string): ProfessionalResult[] {
  if (!service || service.trim() === "") return results;

  const lower = service.toLowerCase();

  return results.filter(
    (p) => p.specialty.toLowerCase().includes(lower) || p.services.some((s) => s.toLowerCase().includes(lower)),
  );
}

/* =====================================================
   LOCATION TYPE FILTER
===================================================== */

const locationTypeMapping: Record<string, string[]> = {
  domiciliar: ["home_visit", "both"],
  clinica: ["clinic", "both"],
  hospital: ["clinic", "both"],
  petshop: ["clinic", "both"],
};

export function applyLocationTypeFilter(results: ProfessionalResult[], locationType?: string[]): ProfessionalResult[] {
  if (!locationType || locationType.length === 0) return results;

  const validTypes: string[] = [];

  locationType.forEach((lt) => {
    const mapped = locationTypeMapping[lt];
    if (mapped) validTypes.push(...mapped);
  });

  if (validTypes.length === 0) {
    return results;
  }

  return results.filter((p) =>
    p.locationTypes?.some((lt) => validTypes.includes(lt)) ?? false
  );
}

/* =====================================================
   RATING FILTER
===================================================== */

export function applyRatingFilter(results: ProfessionalResult[], minRating?: number): ProfessionalResult[] {
  if (!minRating || minRating <= 0) return results;

  return results.filter((p) => p.rating >= minRating);
}

/* =====================================================
   PAYMENT FILTER
===================================================== */

export function applyPaymentFilter(results: ProfessionalResult[], paymentMethods?: string[]): ProfessionalResult[] {
  if (!paymentMethods || paymentMethods.length === 0) return results;

  return results.filter((p) => {
    if (!p.paymentMethods || p.paymentMethods.length === 0) return false;
    return paymentMethods.some((pm) => p.paymentMethods!.includes(pm));
  });
}

/* =====================================================
   SORTING
===================================================== */

export function applySorting(results: ProfessionalResult[], hasCoordinates: boolean): ProfessionalResult[] {
  const sorted = [...results];

  if (hasCoordinates) {
    sorted.sort((a, b) => {
      if (a.distanceKm === undefined && b.distanceKm === undefined) return b.rating - a.rating;

      if (a.distanceKm === undefined) return 1;
      if (b.distanceKm === undefined) return -1;

      const distDiff = a.distanceKm - b.distanceKm;

      if (Math.abs(distDiff) < 0.5) {
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        return 0;
      }

      return distDiff;
    });
  } else {
    sorted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return 0;
    });
  }

  return sorted;
}

/* =====================================================
   PIPELINE EXECUTOR
===================================================== */

export function executeFilterPipeline(
  results: ProfessionalResult[],
  filters: SearchFilters,
  availableProfileIds?: string[],
): ProfessionalResult[] {
  console.log("STEP 1 - INPUT ORIGINAL:", results);
  console.log("STEP 1 - INPUT LENGTH:", results?.length);
  console.log("STEP 1 - PARAMS RECEBIDOS:", filters);
  console.log("RESULTS ANTES DO GEO:", results.length);

  let filtered = applyGeoFilter(results, filters);
  console.log("STEP 5 - APÓS GEO:", filtered?.length);

  console.log(
    "DEBUG - LOCATION TYPES BEFORE SEARCH MODE FILTER:",
    filtered.map((p) => p.locationTypes)
  );

  if (
    filters.searchMode === "local_fixo" ||
    filters.searchMode === "domiciliar"
  ) {
    filtered = filtered.filter(
      (p) =>
        Array.isArray(p.locationTypes) &&
        p.locationTypes.includes(filters.searchMode)
    );

    console.log(
      "STEP X - APÓS SEARCH MODE FILTER:",
      filters.searchMode,
      filtered?.length
    );
  }

  console.log("STEP 4 - ANTES DOS FILTROS SECUNDÁRIOS:", filtered?.length);
  filtered = applyServiceFilter(filtered, filters.service);
  console.log("STEP 3 - APÓS SERVICE FILTER:", filtered?.length);
  if (
    Array.isArray(filters.locationType) &&
    filters.locationType.length > 0
  ) {
    filtered = applyLocationTypeFilter(filtered, filters.locationType);
    console.log("STEP 3 - APÓS LOCATION TYPE FILTER:", filtered?.length);
  } else {
    console.log("STEP 3 - LOCATION TYPE FILTER SKIPPED");
  }
  filtered = applyRatingFilter(filtered, filters.minRating);
  console.log("STEP 3 - APÓS RATING FILTER:", filtered?.length);
  filtered = applyPaymentFilter(filtered, filters.paymentMethods);
  console.log("STEP 3 - APÓS PAYMENT FILTER:", filtered?.length);

  filtered = applySorting(filtered, !!filters.coordinates);

  return filtered;
}
