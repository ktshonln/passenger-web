import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService, { LoginPayload, RegisterPayload, VerifyPhonePayload, ForgotPasswordPayload, ResetPasswordPayload } from "../services/authService";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_USER } from "./useUser";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (user) => {
      queryClient.setQueryData(CACHE_KEY_USER, user);
      showToast("Successfully logged in!", "success");
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Login failed", "error")
  });
};

export const useRegister = () => {
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: () => showToast("Account mapped. Please verify phone.", "success"),
    onError: (err: any) => showToast(err?.response?.data?.message || "Registration failed", "error")
  });
};

export const useVerifyPhone = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: (data: VerifyPhonePayload) => authService.verifyPhone(data),
    onSuccess: (user) => {
      queryClient.setQueryData(CACHE_KEY_USER, user);
      showToast("Phone verified! You are now logged in.", "success");
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Verification failed", "error")
  });
};

export const useForgotPassword = () => {
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => authService.forgotPassword(data),
    onSuccess: () => showToast("If an account exists, a recovery link has been sent.", "success"),
    onError: () => showToast("Failed to request password reset.", "error")
  });
};

export const useResetPassword = () => {
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
    onSuccess: () => showToast("Password updated. Please log in again.", "success"),
    onError: (err: any) => showToast(err?.response?.data?.message || "Reset failed", "error")
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore(s => s.showToast);
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(CACHE_KEY_USER, null);
      showToast("Successfully logged out.", "success");
    }
  });
};
