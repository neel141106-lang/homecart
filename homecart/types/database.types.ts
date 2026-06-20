export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: "customer" | "shopkeeper" | "admin";
          tower: string | null;
          floor: number | null;
          flat_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: "customer" | "shopkeeper" | "admin";
          tower?: string | null;
          floor?: number | null;
          flat_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: "customer" | "shopkeeper" | "admin";
          tower?: string | null;
          floor?: number | null;
          flat_number?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedSource: "auth";
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          category_id: string | null;
          image_url: string | null;
          image_source: "uploaded" | "demo" | "placeholder";
          product_type: "organic" | "essential" | "standard";
          unit: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          category_id?: string | null;
          image_url?: string | null;
          image_source?: "uploaded" | "demo" | "placeholder";
          product_type?: "organic" | "essential" | "standard";
          unit: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          category_id?: string | null;
          image_url?: string | null;
          image_source?: "uploaded" | "demo" | "placeholder";
          product_type?: "organic" | "essential" | "standard";
          unit?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedSource: "public";
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          total_amount: number;
          delivery_fee: number;
          payment_method: "upi" | "cod" | "credits" | "card";
          status: "pending" | "accepted" | "preparing" | "dispatched" | "delivered" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          total_amount: number;
          delivery_fee?: number;
          payment_method: "upi" | "cod" | "credits" | "card";
          status?: "pending" | "accepted" | "preparing" | "dispatched" | "delivered" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          total_amount?: number;
          delivery_fee?: number;
          payment_method?: "upi" | "cod" | "credits" | "card";
          status?: "pending" | "accepted" | "preparing" | "dispatched" | "delivered" | "cancelled";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "profiles";
            referencedSource: "public";
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedSource: "public";
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedSource: "public";
          }
        ];
      };
      custom_requests: {
        Row: {
          id: string;
          customer_id: string;
          request_text: string;
          estimated_price: number | null;
          status: "pending" | "reviewed" | "procuring" | "delivered" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          request_text: string;
          estimated_price?: number | null;
          status?: "pending" | "reviewed" | "procuring" | "delivered" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          request_text?: string;
          estimated_price?: number | null;
          status?: "pending" | "reviewed" | "procuring" | "delivered" | "cancelled";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_requests_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "profiles";
            referencedSource: "public";
          }
        ];
      };
      delivery_settings: {
        Row: {
          id: number;
          delivery_fee: number;
          free_delivery_above: number;
          minimum_order_amount: number;
          delivery_time: string;
          is_delivery_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          delivery_fee?: number;
          free_delivery_above?: number;
          minimum_order_amount?: number;
          delivery_time?: string;
          is_delivery_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          delivery_fee?: number;
          free_delivery_above?: number;
          minimum_order_amount?: number;
          delivery_time?: string;
          is_delivery_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
