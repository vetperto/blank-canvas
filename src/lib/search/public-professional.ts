/**
 * Type representing a row from the `public_search_professionals` database view.
 *
 * View definition (JOIN profiles + professionals):
 *   - Filters: user_type IN ('profissional','empresa'), account_status = 'active', verification_status = 'verified'
 *
 * ⚠️  Keep in sync with the database view. Do NOT add columns that are not in the view.
 */
export interface PublicSearchProfessional {
  id: string;
  full_name: string;
  social_name: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  is_verified: boolean | null;
  user_type: 'profissional' | 'empresa';
  years_experience: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  payment_methods: string[] | null;
  home_service_radius: number | null;
  is_featured: boolean | null;
  verification_status: string | null;
  location: unknown; // PostGIS geography
  crmv: string | null;
  specialties: string[] | null;
}
