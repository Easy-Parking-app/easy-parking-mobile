/**
 * Tipos generados desde el esquema de Supabase. NO editar a mano.
 *
 * Regenerar despues de cada migracion:
 *
 *   npm run types:supabase
 *
 * (necesita SUPABASE_ACCESS_TOKEN; ver docs/04-supabase.md)
 *
 * El modelo que usa la UI vive en `src/types/index.ts` y NO es este. Estos son
 * los tipos de las filas tal como salen de Postgres —snake_case, ids planos,
 * relaciones sin resolver—; la capa de `services/` traduce entre ambos. Esa
 * separacion es la que permite que cambiar el esquema no toque las pantallas.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          code: string;
          created_at: string;
          ends_at: string;
          hours: number;
          id: string;
          parking_id: string;
          payment_method_id: string | null;
          service_fee: number;
          starts_at: string;
          status: Database['public']['Enums']['booking_status'];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          code?: string;
          created_at?: string;
          ends_at: string;
          hours: number;
          id?: string;
          parking_id: string;
          payment_method_id?: string | null;
          service_fee: number;
          starts_at: string;
          status?: Database['public']['Enums']['booking_status'];
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          ends_at?: string;
          hours?: number;
          id?: string;
          parking_id?: string;
          payment_method_id?: string | null;
          service_fee?: number;
          starts_at?: string;
          status?: Database['public']['Enums']['booking_status'];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string;
          parking_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          parking_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          parking_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      parking_features: {
        Row: {
          feature: Database['public']['Enums']['feature_key'];
          parking_id: string;
        };
        Insert: {
          feature: Database['public']['Enums']['feature_key'];
          parking_id: string;
        };
        Update: {
          feature?: Database['public']['Enums']['feature_key'];
          parking_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parking_features_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
        ];
      };
      parking_hours: {
        Row: {
          closes_at: number;
          id: string;
          opens_at: number;
          parking_id: string;
          weekday: number;
        };
        Insert: {
          closes_at: number;
          id?: string;
          opens_at: number;
          parking_id: string;
          weekday: number;
        };
        Update: {
          closes_at?: number;
          id?: string;
          opens_at?: number;
          parking_id?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'parking_hours_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
        ];
      };
      parking_photos: {
        Row: {
          created_at: string;
          id: string;
          parking_id: string;
          position: number;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          parking_id: string;
          position?: number;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          parking_id?: string;
          position?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parking_photos_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
        ];
      };
      parkings: {
        Row: {
          address: string;
          created_at: string;
          description: string;
          id: string;
          kind: Database['public']['Enums']['parking_kind'];
          latitude: number;
          location: unknown;
          longitude: number;
          name: string;
          owner_id: string;
          price_per_day: number | null;
          price_per_hour: number;
          rating: number;
          review_count: number;
          rules: string[];
          spots_available: number;
          spots_total: number;
          status: Database['public']['Enums']['listing_status'];
          updated_at: string;
          verified: boolean;
          zone: string;
        };
        Insert: {
          address: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind: Database['public']['Enums']['parking_kind'];
          latitude: number;
          location?: unknown;
          longitude: number;
          name: string;
          owner_id: string;
          price_per_day?: number | null;
          price_per_hour: number;
          rating?: number;
          review_count?: number;
          rules?: string[];
          spots_available: number;
          spots_total: number;
          status?: Database['public']['Enums']['listing_status'];
          updated_at?: string;
          verified?: boolean;
          zone: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: Database['public']['Enums']['parking_kind'];
          latitude?: number;
          location?: unknown;
          longitude?: number;
          name?: string;
          owner_id?: string;
          price_per_day?: number | null;
          price_per_hour?: number;
          rating?: number;
          review_count?: number;
          rules?: string[];
          spots_available?: number;
          spots_total?: number;
          status?: Database['public']['Enums']['listing_status'];
          updated_at?: string;
          verified?: boolean;
          zone?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parkings_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_methods: {
        Row: {
          created_at: string;
          detail: string;
          id: string;
          is_default: boolean;
          kind: Database['public']['Enums']['payment_kind'];
          label: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          detail: string;
          id?: string;
          is_default?: boolean;
          kind: Database['public']['Enums']['payment_kind'];
          label: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          detail?: string;
          id?: string;
          is_default?: boolean;
          kind?: Database['public']['Enums']['payment_kind'];
          label?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          is_owner: boolean;
          member_since: string;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          is_owner?: boolean;
          member_since?: string;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          is_owner?: boolean;
          member_since?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author_id: string;
          comment: string;
          created_at: string;
          id: string;
          parking_id: string;
          rating: number;
        };
        Insert: {
          author_id: string;
          comment?: string;
          created_at?: string;
          id?: string;
          parking_id: string;
          rating: number;
        };
        Update: {
          author_id?: string;
          comment?: string;
          created_at?: string;
          id?: string;
          parking_id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_parking_id_fkey';
            columns: ['parking_id'];
            isOneToOne: false;
            referencedRelation: 'parkings';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_booking: {
        Args: { p_booking_id: string };
        Returns: Database['public']['Tables']['bookings']['Row'];
      };
      create_booking: {
        Args: {
          p_ends_at: string;
          p_parking_id: string;
          p_payment_method_id?: string;
          p_starts_at: string;
        };
        Returns: Database['public']['Tables']['bookings']['Row'];
      };
      parkings_nearby: {
        Args: {
          p_lat: number;
          p_limit?: number;
          p_lng: number;
          p_radius_m?: number;
        };
        Returns: {
          distance_meters: number;
          id: string;
        }[];
      };
    };
    Enums: {
      booking_status: 'proxima' | 'activa' | 'completada' | 'cancelada';
      feature_key:
        | 'cubierto'
        | 'vigilancia'
        | 'carga-electrica'
        | 'moto'
        | 'camioneta'
        | 'accesibilidad'
        | 'lavado'
        | 'acceso-24h';
      listing_status: 'publicado' | 'borrador' | 'pausado';
      parking_kind: 'garaje' | 'edificio' | 'lote' | 'centro-comercial';
      payment_kind: 'nequi' | 'daviplata' | 'pse' | 'tarjeta';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database['public'];

/** Fila tal como sale de la tabla. `Tables<'parkings'>` */
export type Tables<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Row'];

/** Payload de insercion, con los campos que tienen default marcados opcionales. */
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Insert'];

/** Payload de actualizacion: todo opcional. */
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Update'];

/** Un enum del esquema. `Enums<'booking_status'>` */
export type Enums<T extends keyof DefaultSchema['Enums']> = DefaultSchema['Enums'][T];
