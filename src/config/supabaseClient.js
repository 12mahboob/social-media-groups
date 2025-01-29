import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing environment variables for Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
//     } catch (error) {
//      toast.error(error.message);