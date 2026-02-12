/**
 * Haversine formula to calculate distance between two points in km.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate coordinates are valid lat/lng values.
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Validate radius is a positive number.
 */
export function isValidRadius(radius: number): boolean {
  return typeof radius === 'number' && !isNaN(radius) && radius > 0;
}

/**
 * Normalize and validate search parameters.
 * Ensures lat, lng, radius are valid numbers with safe fallbacks.
 */
export interface NormalizedSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  searchMode: 'local_fixo' | 'domiciliar' | 'all';
  isValid: boolean;
}

const DEFAULT_RADIUS_KM = 10;
const VALID_MODES = ['local_fixo', 'domiciliar', 'all'] as const;

export function normalizeSearchParams(
  lat: any,
  lng: any,
  radiusKm: any,
  searchMode: any
): NormalizedSearchParams {
  const parsedLat = typeof lat === 'number' ? lat : parseFloat(String(lat));
  const parsedLng = typeof lng === 'number' ? lng : parseFloat(String(lng));

  const coordsValid = isValidCoordinates(parsedLat, parsedLng);

  let finalRadius = DEFAULT_RADIUS_KM;
  if (radiusKm !== null && radiusKm !== undefined) {
    const parsed = typeof radiusKm === 'number' ? radiusKm : parseFloat(String(radiusKm));
    if (!isNaN(parsed) && parsed > 0) {
      finalRadius = parsed;
    }
  }

  const finalMode = (typeof searchMode === 'string' && VALID_MODES.includes(searchMode as any))
    ? (searchMode as NormalizedSearchParams['searchMode'])
    : 'all';

  return {
    lat: coordsValid ? parsedLat : 0,
    lng: coordsValid ? parsedLng : 0,
    radiusKm: finalRadius,
    searchMode: finalMode,
    isValid: coordsValid,
  };
}
