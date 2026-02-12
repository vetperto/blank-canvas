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
          review_id: string | null
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
          review_id?: string | null
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
          review_id?: string | null
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
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
          remaining_credits: number | null
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
          remaining_credits?: number | null
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
          remaining_credits?: number | null
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          bio: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          crmv: string | null
          email: string
          full_name: string | null
          home_service_radius: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          lgpd_accepted: boolean
          lgpd_accepted_at: string | null
          longitude: number | null
          neighborhood: string | null
          number: string | null
          payment_methods: string[] | null
          phone: string | null
          profile_picture_url: string | null
          social_name: string | null
          state: string | null
          street: string | null
          terms_accepted: boolean
          terms_accepted_at: string | null
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
          bio?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          crmv?: string | null
          email: string
          full_name?: string | null
          home_service_radius?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          lgpd_accepted?: boolean
          lgpd_accepted_at?: string | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          street?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
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
          bio?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          crmv?: string | null
          email?: string
          full_name?: string | null
          home_service_radius?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          lgpd_accepted?: boolean
          lgpd_accepted_at?: string | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          street?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
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
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string | null
          crmv: string | null
          full_name: string | null
          home_service_radius: number | null
          id: string | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          payment_methods: string[] | null
          profile_picture_url: string | null
          social_name: string | null
          state: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          crmv?: string | null
          full_name?: string | null
          home_service_radius?: number | null
          id?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          payment_methods?: string[] | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          crmv?: string | null
          full_name?: string | null
          home_service_radius?: number | null
          id?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          payment_methods?: string[] | null
          profile_picture_url?: string | null
          social_name?: string | null
          state?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_professional_credits: {
        Args: { p_credits_to_add: number; p_professional_profile_id: string }
        Returns: boolean
      }
      auto_approve_reviews: { Args: never; Returns: number }
      auto_cancel_expired_appointments: { Args: never; Returns: number }
      calculate_distance: {
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
      record_lost_appointment: {
        Args: {
          p_professional_profile_id: string
          p_service_id?: string
          p_tutor_profile_id: string
        }
        Returns: string
      }
      search_professionals_by_location: {
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
      user_type: "tutor" | "profissional" | "empresa"
      verification_status:
        | "not_verified"
        | "under_review"
        | "verified"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
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
      user_type: ["tutor", "profissional", "empresa"],
      verification_status: [
        "not_verified",
        "under_review",
        "verified",
        "rejected",
      ],
    },
  },
} as const
