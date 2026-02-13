import type { Database } from "@/integrations/supabase/types";

/**
 * Type representing a row from the `public_search_professionals` database view.
 * Derived directly from the auto-generated Supabase types.
 */
export type PublicSearchProfessional =
  Database["public"]["Views"]["public_search_professionals"]["Row"];

/**
 * Shape returned by the `search_professionals_by_radius` RPC.
 * Aligned with the actual DB function return columns.
 * No latitude/longitude — distance comes from PostGIS as distance_meters.
 */
export interface RpcProfessionalResult {
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
  home_service_radius: number | null;
  /** Extracted from PostGIS geography via ST_Y — for map display only */
  latitude: number | null;
  /** Extracted from PostGIS geography via ST_X — for map display only */
  longitude: number | null;
}
