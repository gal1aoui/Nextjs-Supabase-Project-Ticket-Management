import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = async () => {
  const supabase = createClient();

  const { data } = await (await supabase).auth.getUser();

  return { user: data.user?.user_metadata };
};

export const updateUserVerification = async (status: string) => {
  const supabase = createClient();
  const { data, error } = await (await supabase).auth.updateUser({
    data: { verified_code: status },
  });

  if (error) {
    return { error };
  }

  // refreshing the session, to ensure the user's browser immediately
  // receives a JWT that contains the updated status
  await (await supabase).auth.refreshSession();

  return { user: data.user?.user_metadata };
};
