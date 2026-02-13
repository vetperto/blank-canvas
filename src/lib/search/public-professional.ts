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
