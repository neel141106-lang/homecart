import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Export a flag indicating if real Supabase keys are configured
export const isSupabaseConfigured = 
  supabaseUrl !== "" && 
  supabaseAnonKey !== "";

// Safe client initializer. If keys are missing, we create a dummy client to avoid crashes,
// but our repositories will intercept and use mock implementations instead.
const dummyUrl = "https://placeholder-project-id.supabase.co";
const dummyKey = "placeholder-anon-key";

export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : dummyUrl,
  isSupabaseConfigured ? supabaseAnonKey : dummyKey
);
