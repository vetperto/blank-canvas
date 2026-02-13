// Search mode types
export type SearchMode = 'local_fixo' | 'domiciliar' | 'all';

export interface SearchFilters {
  service?: string;
  location?: string;
  petType?: string[];
  radius?: number;
  searchMode?: SearchMode;
  specialty?: string[];
  locationType?: string[];
  priceRange?: { min?: number; max?: number };
  coordinates?: { lat: number; lng: number } | null;
  minRating?: number;
  availableToday?: boolean;
  availableThisWeek?: boolean;
  urgency?: boolean;
  services?: string[];
  paymentMethods?: string[];
}

export interface ProfessionalResult {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  views: number;
  location: string;
  distance: string;
  distanceKm?: number;
  services: string[];
  isVerified: boolean;
  planType: "basic" | "intermediate" | "complete" | "enterprise";
  nextAvailable: string;
  priceRange: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  homeServiceRadius?: number;
  /** From PostGIS ST_Y — for map display only, never for distance calc */
  latitude?: number;
  /** From PostGIS ST_X — for map display only, never for distance calc */
  longitude?: number;
  locationTypes?: string[];
  petTypes?: string[];
  paymentMethods?: string[];
}
