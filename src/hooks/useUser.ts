import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService, { UpdateUserPayload } from "../services/userService";
import { useToastStore } from "../stores/toastStore";

export const CACHE_KEY_USER = ["users", "me"];

export const useUser = () => {
  return useQuery({
    queryKey: CACHE_KEY_USER,
    queryFn: userService.getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
      showToast(error?.response?.data?.message || "Failed to update profile", "error");
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
      showToast(error?.response?.data?.message || "Failed to update password", "error");
    },
  });
};
