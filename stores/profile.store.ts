import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import type { ProfileUpdate } from "@/types/profile";

export const profileKeys = {
  current: ["profile", "current"] as const,
  byId: (id: string) => ["profile", id] as const,
};

export function useCurrentProfile() {
  return useQuery({
    queryKey: profileKeys.current,
    queryFn: () => profileService.getCurrent(),
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.byId(id),
    queryFn: () => profileService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdate) => profileService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.current });
    },
  });
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["profiles", "search", query],
    queryFn: () => profileService.search(query),
    enabled: query.length >= 2,
  });
}
