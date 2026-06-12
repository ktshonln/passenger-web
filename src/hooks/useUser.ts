import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService, { UpdateUserPayload } from "../services/userService";
import { useToastStore } from "../stores/toastStore";

export const CACHE_KEY_USER = ["users", "me"];

export const useUser = () => {
  return useQuery({
    queryKey: CACHE_KEY_USER,
    queryFn: userService.getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Do not retry on 401 to ensure immediate redirect
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: UpdateUserPayload) => userService.updateCurrentUser(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(CACHE_KEY_USER, updatedUser);
      showToast("Profile updated successfully!", "success");
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.error?.message || "Failed to update profile. Please try again.", "error");
    },
  });
};

export const useChangePassword = () => {
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: any) => userService.updatePassword(data),
    onSuccess: () => {
      showToast("Password securely updated!", "success");
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === 'INCORRECT_PASSWORD') {
        showToast("Current password is incorrect.", "error");
      } else {
        showToast("Failed to update password. Please try again.", "error");
      }
    },
  });
};
