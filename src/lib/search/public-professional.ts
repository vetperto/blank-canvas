import type { Database } from "@/integrations/supabase/types";

/**
 * Type representing a row from the `public_search_professionals` database view.
 *
 * Derived directly from the auto-generated Supabase types — always in sync.
 *
 * View definition (JOIN profiles + professionals):
 *   - Filters: user_type IN ('profissional','empresa'), account_status = 'active', verification_status = 'verified'
 */
export type PublicSearchProfessional =
  Database["public"]["Views"]["public_search_professionals"]["Row"];

/**
 * Shape returned by the `search_professionals_by_radius` RPC.
 *
 * The auto-generated types may be incomplete for overloaded RPCs,
 * so we define the full expected shape here, aligned with the actual
 * DB function return columns.
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
  latitude: number | null;
  longitude: number | null;
  home_service_radius: number | null;
}
