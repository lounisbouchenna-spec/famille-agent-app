import { createClient } from "@supabase/supabase-js";
import type { FamilyMember } from "../types/family";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export interface InvokeFamilyAgentParams {
  prompt: string;
  householdMembers: Pick<FamilyMember, "id" | "display_name" | "role">[];
  timezone: string;
}

export async function invokeFamilyAgent(params: InvokeFamilyAgentParams) {
  const { data, error } = await supabase.functions.invoke("family-agent", {
    body: params
  });

  if (error) {
    throw error;
  }

  return data as {
    reply: string;
    tool_calls: unknown[];
  };
}
