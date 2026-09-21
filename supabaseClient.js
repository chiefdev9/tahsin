// ==========================================
// SUPABASE CLIENT CONFIGURATION
// ==========================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bwvtwcfsklcdbwizbsxe.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dnR3Y2Zza2xjZGJ3aXpic3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDMyNzUsImV4cCI6MjEwNTU3OTI3NX0.R5CnPWIkFkQ80y4LVxASKeMN7cKAAKsZ4Xu-37h0XBs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
