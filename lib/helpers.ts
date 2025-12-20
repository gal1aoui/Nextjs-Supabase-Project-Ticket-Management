import { randomInt } from "node:crypto";
import { createClient } from "./supabase/client";

const supabaseClient = createClient();

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  return { error };
}

const generateOtpCode = () => {
  return String(randomInt(100000, 999999));
};

export { signOut, generateOtpCode, supabaseClient };
