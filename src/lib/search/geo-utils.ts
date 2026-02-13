/**
 * Geo utilities — all distance calculations are done server-side via PostGIS.
 * This file only contains coordinate validation helpers used before calling the RPC.
 */

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
