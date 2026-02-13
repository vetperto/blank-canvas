/**
 * Strict union types derived from Supabase Database enums.
 *
 * These MUST be used instead of generic `string` for any field that
 * maps to a Postgres enum column.
 *
 * Source of truth: Database["public"]["Enums"] in types.ts
 */
import type { Database } from "@/integrations/supabase/types";

// ── Core enums ──────────────────────────────────────────────────────
export type UserType = Database["public"]["Enums"]["user_type"];
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
export type ServiceLocationType = Database["public"]["Enums"]["service_location_type"];
export type PetSpecies = Database["public"]["Enums"]["pet_species"];
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type DayOfWeek = Database["public"]["Enums"]["day_of_week"];
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];
