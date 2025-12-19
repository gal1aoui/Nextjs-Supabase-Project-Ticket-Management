import { randomInt } from "node:crypto";
import { createClient } from "./supabase/client";

const supabaseClient = createClient();

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  const user = data?.user;

  if (error) {
    console.error("Error fetching user:", error.message);
    return;
  }

  if (user) {
    console.log("Authenticated user found:", user);
    return user.user_metadata;
  } else {
    console.log("No authenticated user found.");
    return;
  }
}

const currentUser = await getCurrentUser();

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  return { error };
}

const generateOtpCode = () => {
  return String(randomInt(100000, 999999));
};

export { signOut, generateOtpCode, currentUser, supabaseClient };
