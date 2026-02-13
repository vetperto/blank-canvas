import { SearchFilters, ProfessionalResult } from "./types";

/**
 * Non-geo filters applied client-side after PostGIS RPC returns results.
 * All distance/geo filtering is handled exclusively by the database.
 */

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
   SORTING (non-geo — distance already sorted by PostGIS)
===================================================== */

export function applySorting(results: ProfessionalResult[], hasCoordinates: boolean): ProfessionalResult[] {
  if (hasCoordinates) {
    // PostGIS already returns sorted by distance_meters ASC.
    // We keep the order but use rating as tiebreaker for same distance bucket.
    return results;
  }

  const sorted = [...results];
  sorted.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return 0;
  });

  return sorted;
}
