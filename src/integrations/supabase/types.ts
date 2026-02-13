export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      appointment_confirmations: {
        Row: {
          appointment_id: string
          confirmation_token: string
          confirmation_type: string
          confirmed_at: string | null
          created_at: string
          email_sent_at: string | null
          id: string
          push_sent_at: string | null
          reschedule_requested_at: string | null
        }
        Insert: {
          appointment_id: string
          confirmation_token?: string
          confirmation_type: string
          confirmed_at?: string | null
          created_at?: string
          email_sent_at?: string | null
          id?: string
          push_sent_at?: string | null
          reschedule_requested_at?: string | null
        }
        Update: {
          appointment_id?: string
          confirmation_token?: string
          confirmation_type?: string
          confirmed_at?: string | null
          created_at?: string
          email_sent_at?: string | null
          id?: string
          push_sent_at?: string | null
          reschedule_requested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          reminder_type: string
          sent_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          reminder_type: string
          sent_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          created_at: string
          end_time: string
          id: string
          location_address: string | null
          location_type: Database["public"]["Enums"]["service_location_type"]
          pet_id: string | null
          price: number | null
          professional_notes: string | null
          professional_profile_id: string
          service_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          tutor_notes: string | null
          tutor_profile_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          end_time: string
          id?: string
          location_address?: string | null
          location_type: Database["public"]["Enums"]["service_location_type"]
          pet_id?: string | null
          price?: number | null
          professional_notes?: string | null
          professional_profile_id: string
          service_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tutor_notes?: string | null
          tutor_profile_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          end_time?: string
          id?: string
          location_address?: string | null
          location_type?: Database["public"]["Enums"]["service_location_type"]
          pet_id?: string | null
          price?: number | null
          professional_notes?: string | null
          professional_profile_id?: string
          service_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tutor_notes?: string | null
          tutor_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id: string
          is_available_for_shift: boolean | null
          location_type: Database["public"]["Enums"]["service_location_type"]
          profile_id: string
          slot_duration_minutes: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id?: string
          is_available_for_shift?: boolean | null
          location_type?: Database["public"]["Enums"]["service_location_type"]
          profile_id: string
          slot_duration_minutes?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          end_time?: string
          id?: string
          is_available_for_shift?: boolean | null
          location_type?: Database["public"]["Enums"]["service_location_type"]
          profile_id?: string
          slot_duration_minutes?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          profile_id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          profile_id: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_dates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_dates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          cnpj: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: unknown
          trade_name: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: unknown
          trade_name?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: unknown
          trade_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          professional_profile_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          professional_profile_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          professional_profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_url: string
          id: string
          is_verified: boolean | null
          profile_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_url: string
          id?: string
          is_verified?: boolean | null
          profile_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_url?: string
          id?: string
          is_verified?: boolean | null
          profile_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_professionals: {
        Row: {
          created_at: string
          id: string
          professional_profile_id: string
          tutor_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_profile_id: string
          tutor_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_profile_id?: string
          tutor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_professionals_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_professionals_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_professionals_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_professionals_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_professionals_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_professionals_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_agreements: {
        Row: {
          accepted_at: string
          agreement_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          agreement_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          agreement_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lost_appointments: {
        Row: {
          attempted_date: string
          created_at: string
          id: string
          professional_profile_id: string
          reason: string
          service_id: string | null
          tutor_profile_id: string
        }
        Insert: {
          attempted_date?: string
          created_at?: string
          id?: string
          professional_profile_id: string
          reason?: string
          service_id?: string | null
          tutor_profile_id: string
        }
        Update: {
          attempted_date?: string
          created_at?: string
          id?: string
          professional_profile_id?: string
          reason?: string
          service_id?: string | null
          tutor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lost_appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_appointments_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_appointments: boolean
          email_marketing: boolean
          email_reminders: boolean
          id: string
          profile_id: string
          push_appointments: boolean
          push_reminders: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_appointments?: boolean
          email_marketing?: boolean
          email_reminders?: boolean
          id?: string
          profile_id: string
          push_appointments?: boolean
          push_reminders?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_appointments?: boolean
          email_marketing?: boolean
          email_reminders?: boolean
          id?: string
          profile_id?: string
          push_appointments?: boolean
          push_reminders?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_medical_records: {
        Row: {
          appointment_id: string | null
          attachments: Json | null
          clinic_name: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          pet_id: string
          record_type: string
          title: string
          updated_at: string
          veterinarian_name: string | null
        }
        Insert: {
          appointment_id?: string | null
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          pet_id: string
          record_type: string
          title: string
          updated_at?: string
          veterinarian_name?: string | null
        }
        Update: {
          appointment_id?: string | null
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          pet_id?: string
          record_type?: string
          title?: string
          updated_at?: string
          veterinarian_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_medical_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_vaccines: {
        Row: {
          batch_number: string | null
          clinic_name: string | null
          created_at: string
          date_administered: string
          id: string
          name: string
          next_dose_date: string | null
          notes: string | null
          pet_id: string
          updated_at: string
          veterinarian_name: string | null
        }
        Insert: {
          batch_number?: string | null
          clinic_name?: string | null
          created_at?: string
          date_administered: string
          id?: string
          name: string
          next_dose_date?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string
          veterinarian_name?: string | null
        }
        Update: {
          batch_number?: string | null
          clinic_name?: string | null
          created_at?: string
          date_administered?: string
          id?: string
          name?: string
          next_dose_date?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string
          veterinarian_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_vaccines_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          gender: string | null
          health_history: string | null
          id: string
          name: string
          photo_url: string | null
          preferences: string | null
          profile_id: string
          species: Database["public"]["Enums"]["pet_species"]
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          gender?: string | null
          health_history?: string | null
          id?: string
          name: string
          photo_url?: string | null
          preferences?: string | null
          profile_id: string
          species: Database["public"]["Enums"]["pet_species"]
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          gender?: string | null
          health_history?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          preferences?: string | null
          profile_id?: string
          species?: Database["public"]["Enums"]["pet_species"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_credits: {
        Row: {
          created_at: string
          id: string
          last_credit_update: string | null
          professional_profile_id: string
          status: string
          total_credits: number
          updated_at: string
          used_credits: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_credit_update?: string | null
          professional_profile_id: string
          status?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_credit_update?: string | null
          professional_profile_id?: string
          status?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_credits_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_credits_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: true
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_credits_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: true
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_education: {
        Row: {
          created_at: string
          description: string | null
          id: string
          institution: string
          profile_id: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          institution: string
          profile_id: string
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          institution?: string
          profile_id?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          bio: string | null
          crmv: string | null
          id: string
          is_active: boolean | null
          location: unknown
          specialties: string[] | null
        }
        Insert: {
          bio?: string | null
          crmv?: string | null
          id: string
          is_active?: boolean | null
          location?: unknown
          specialties?: string[] | null
        }
        Update: {
          bio?: string | null
          crmv?: string | null
          id?: string
          is_active?: boolean | null
          location?: unknown
          specialties?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          average_rating: number | null
          bio: string | null
          boost_until: string | null
          cancelled_appointments: number | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          completed_appointments: number | null
          cpf: string | null
          created_at: string
          full_name: string
          home_service_radius: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          lgpd_accepted: boolean
          lgpd_accepted_at: string | null
          location: unknown
          neighborhood: string | null
          number: string | null
          payment_methods: string[] | null
          phone: string | null
          plan_type: string | null
          profile_picture_url: string | null
          social_name: string | null
          state: string | null
          street: string | null
          terms_accepted: boolean
          terms_accepted_at: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          account_status?: string | null
          average_rating?: number | null
          bio?: string | null
          boost_until?: string | null
          cancelled_appointments?: number | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          completed_appointments?: number | null
          cpf?: string | null
          created_at?: string
          full_name: string
          home_service_radius?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          lgpd_accepted?: boolean
          lgpd_accepted_at?: string | null
          location?: unknown
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          plan_type?: string | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          street?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          account_status?: string | null
          average_rating?: number | null
          bio?: string | null
          boost_until?: string | null
          cancelled_appointments?: number | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          completed_appointments?: number | null
          cpf?: string | null
          created_at?: string
          full_name?: string
          home_service_radius?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          lgpd_accepted?: boolean
          lgpd_accepted_at?: string | null
          location?: unknown
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          plan_type?: string | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          street?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_moderated: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          professional_profile_id: string
          rating: number
          tutor_profile_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          professional_profile_id: string
          rating: number
          tutor_profile_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          professional_profile_id?: string
          rating?: number
          tutor_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tutor_profile_id_fkey"
            columns: ["tutor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          location_type: Database["public"]["Enums"]["service_location_type"]
          name: string
          price: number | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_type?: Database["public"]["Enums"]["service_location_type"]
          name: string
          price?: number | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_type?: Database["public"]["Enums"]["service_location_type"]
          name?: string
          price?: number | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          has_portfolio: boolean | null
          has_price_table: boolean | null
          has_verified_badge: boolean | null
          id: string
          is_active: boolean | null
          monthly_appointments_limit: number | null
          name: string
          portfolio_limit: number | null
          price: number
          slug: string
          target_user_type: Database["public"]["Enums"]["user_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          has_portfolio?: boolean | null
          has_price_table?: boolean | null
          has_verified_badge?: boolean | null
          id?: string
          is_active?: boolean | null
          monthly_appointments_limit?: number | null
          name: string
          portfolio_limit?: number | null
          price: number
          slug: string
          target_user_type: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          has_portfolio?: boolean | null
          has_price_table?: boolean | null
          has_verified_badge?: boolean | null
          id?: string
          is_active?: boolean | null
          monthly_appointments_limit?: number | null
          name?: string
          portfolio_limit?: number | null
          price?: number
          slug?: string
          target_user_type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Relationships: []
      }
      tutors: {
        Row: {
          city: string | null
          cpf: string | null
          id: string
          pets_count: number | null
          state: string | null
        }
        Insert: {
          city?: string | null
          cpf?: string | null
          id: string
          pets_count?: number | null
          state?: string | null
        }
        Update: {
          city?: string | null
          cpf?: string | null
          id?: string
          pets_count?: number | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          profile_id: string
          read_at: string | null
          related_appointment_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          profile_id: string
          read_at?: string | null
          related_appointment_id?: string | null
          title: string
          type?: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          profile_id?: string
          read_at?: string | null
          related_appointment_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_related_appointment_id_fkey"
            columns: ["related_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          profile_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          profile_id: string
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          profile_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_status: Database["public"]["Enums"]["verification_status"] | null
          notes: string | null
          old_status: Database["public"]["Enums"]["verification_status"] | null
          performed_by: string
          profile_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["verification_status"] | null
          notes?: string | null
          old_status?: Database["public"]["Enums"]["verification_status"] | null
          performed_by: string
          profile_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["verification_status"] | null
          notes?: string | null
          old_status?: Database["public"]["Enums"]["verification_status"] | null
          performed_by?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_search_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      public_professionals: {
        Row: {
          average_rating: number | null
          city: string | null
          full_name: string | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          state: string | null
          total_reviews: number | null
        }
        Insert: {
          average_rating?: number | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          state?: string | null
          total_reviews?: number | null
        }
        Update: {
          average_rating?: number | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          state?: string | null
          total_reviews?: number | null
        }
        Relationships: []
      }
      public_search_professionals: {
        Row: {
          average_rating: number | null
          bio: string | null
          city: string | null
          crmv: string | null
          full_name: string | null
          home_service_radius: number | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          location: unknown
          neighborhood: string | null
          payment_methods: string[] | null
          profile_picture_url: string | null
          social_name: string | null
          specialties: string[] | null
          state: string | null
          total_reviews: number | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      add_professional_credits: {
        Args: { p_credits_to_add: number; p_professional_profile_id: string }
        Returns: boolean
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      auto_approve_reviews: { Args: never; Returns: number }
      auto_cancel_expired_appointments: { Args: never; Returns: number }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      can_accept_appointment: {
        Args: { _professional_profile_id: string }
        Returns: {
          can_accept: boolean
          current_count: number
          monthly_limit: number
          plan_name: string
          remaining: number
        }[]
      }
      can_review_appointment: {
        Args: { _appointment_id: string; _tutor_profile_id: string }
        Returns: boolean
      }
      can_verify_profile: {
        Args: { _profile_id: string }
        Returns: {
          can_verify: boolean
          has_crmv_document: boolean
          has_id_document: boolean
          missing_documents: string[]
        }[]
      }
      change_verification_status: {
        Args: {
          _new_status: Database["public"]["Enums"]["verification_status"]
          _notes?: string
          _profile_id: string
        }
        Returns: boolean
      }
      check_cpf_exists_for_type: {
        Args: {
          _cpf: string
          _user_type: Database["public"]["Enums"]["user_type"]
        }
        Returns: {
          existing_email: string
          existing_user_id: string
          exists_for_type: boolean
        }[]
      }
      check_professional_credits: {
        Args: { p_professional_profile_id: string }
        Returns: {
          has_credits: boolean
          remaining: number
          status: string
        }[]
      }
      consume_professional_credit: {
        Args: { p_professional_profile_id: string }
        Returns: boolean
      }
      count_monthly_appointments: {
        Args: { _month?: string; _professional_profile_id: string }
        Returns: number
      }
      create_appointment_secure: {
        Args: { p_date: string; p_professional_id: string; p_tutor_id: string }
        Returns: undefined
      }
      create_appointment_with_credit:
        | {
            Args: {
              p_date: string
              p_end_time: string
              p_pet_id: string
              p_professional_profile_id: string
              p_service_id: string
              p_start_time: string
            }
            Returns: string
          }
        | {
            Args: {
              p_date: string
              p_end_time: string
              p_pet_id: string
              p_professional_profile_id: string
              p_service_id: string
              p_start_time: string
              p_tutor_profile_id: string
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_appointments_needing_confirmation: {
        Args: never
        Returns: {
          appointment_date: string
          appointment_id: string
          end_time: string
          location_type: string
          pet_name: string
          professional_name: string
          service_name: string
          start_time: string
          tutor_email: string
          tutor_name: string
        }[]
      }
      get_appointments_needing_reminder: {
        Args: never
        Returns: {
          appointment_date: string
          appointment_id: string
          end_time: string
          location_type: string
          pet_name: string
          professional_name: string
          service_name: string
          start_time: string
          tutor_email: string
          tutor_name: string
        }[]
      }
      get_available_slots: {
        Args: {
          _date: string
          _duration_minutes?: number
          _professional_profile_id: string
        }
        Returns: {
          location_type: Database["public"]["Enums"]["service_location_type"]
          slot_end: string
          slot_start: string
        }[]
      }
      get_professional_credit_stats: {
        Args: { p_professional_profile_id: string }
        Returns: {
          confirmed_appointments: number
          lost_clients: number
          remaining_credits: number
          status: string
          total_credits: number
          used_credits: number
        }[]
      }
      get_professional_plan_limits: {
        Args: { _profile_id: string }
        Returns: {
          has_portfolio: boolean
          has_price_table: boolean
          has_verified_badge: boolean
          is_subscribed: boolean
          monthly_appointments_limit: number
          plan_name: string
          portfolio_limit: number
        }[]
      }
      get_professional_rating: {
        Args: { _professional_profile_id: string }
        Returns: {
          average_rating: number
          total_reviews: number
        }[]
      }
      get_profile_by_type: {
        Args: {
          _user_id: string
          _user_type: Database["public"]["Enums"]["user_type"]
        }
        Returns: {
          bio: string
          city: string
          cnpj: string
          cpf: string
          crmv: string
          email: string
          full_name: string
          id: string
          is_verified: boolean
          phone: string
          profile_picture_url: string
          social_name: string
          state: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      get_profile_id_by_type: {
        Args: {
          _user_id: string
          _user_type: Database["public"]["Enums"]["user_type"]
        }
        Returns: string
      }
      get_user_profile_types: {
        Args: { _user_id: string }
        Returns: {
          full_name: string
          is_verified: boolean
          profile_id: string
          profile_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      get_verification_stats: {
        Args: never
        Returns: {
          not_verified: number
          rejected: number
          total_professionals: number
          under_review: number
          verified: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_slot_available: {
        Args: {
          _date: string
          _end_time: string
          _professional_profile_id: string
          _start_time: string
        }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      record_lost_appointment: {
        Args: {
          p_professional_profile_id: string
          p_service_id?: string
          p_tutor_profile_id: string
        }
        Returns: string
      }
      search_professionals: {
        Args: { user_latitude: number; user_longitude: number }
        Returns: {
          city: string
          distance_meters: number
          full_name: string
          id: string
          state: string
        }[]
      }
      search_professionals_by_location:
        | {
            Args: { search_radius?: number; user_lat: number; user_lng: number }
            Returns: {
              covers_user_location: boolean
              distance_km: number
              profile_id: string
            }[]
          }
        | {
            Args: {
              search_mode?: string
              search_radius?: number
              user_lat: number
              user_lng: number
            }
            Returns: {
              covers_user_location: boolean
              distance_km: number
              profile_id: string
            }[]
          }
      search_professionals_by_radius:
        | {
            Args: {
              search_radius_km?: number
              user_lat: number
              user_lng: number
            }
            Returns: {
              average_rating: number
              bio: string
              city: string
              crmv: string
              distance_meters: number
              full_name: string
              home_service_radius: number
              id: string
              is_verified: boolean
              latitude: number
              longitude: number
              neighborhood: string
              payment_methods: string[]
              profile_picture_url: string
              social_name: string
              state: string
              total_reviews: number
            }[]
          }
        | {
            Args: { radius_km: number; user_lat: number; user_lng: number }
            Returns: {
              distance_meters: number
              full_name: string
              id: string
            }[]
          }
      search_professionals_ranked: {
        Args: { radius_km: number; user_lat: number; user_lon: number }
        Returns: {
          distance_km: number
          full_name: string
          id: string
          ranking_score: number
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      day_of_week:
        | "sunday"
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
      document_type: "rg" | "cnh" | "crmv" | "cnpj_card"
      pet_species:
        | "cao"
        | "gato"
        | "pequeno_porte"
        | "grande_porte"
        | "producao"
        | "silvestre_exotico"
      service_location_type: "clinic" | "home_visit" | "both"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      user_type: "tutor" | "profissional" | "empresa" | "professional"
      verification_status:
        | "not_verified"
        | "under_review"
        | "verified"
        | "rejected"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      appointment_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      day_of_week: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      document_type: ["rg", "cnh", "crmv", "cnpj_card"],
      pet_species: [
        "cao",
        "gato",
        "pequeno_porte",
        "grande_porte",
        "producao",
        "silvestre_exotico",
      ],
      service_location_type: ["clinic", "home_visit", "both"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      user_type: ["tutor", "profissional", "empresa", "professional"],
      verification_status: [
        "not_verified",
        "under_review",
        "verified",
        "rejected",
      ],
    },
  },
} as const
