import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { TopUpInitiated, TopUpPayload } from "../types";

// Maps known server error codes to friendly messages
const topUpErrorMessages: Record<string, string> = {
  INVALID_AMOUNT: "Minimum top up amount is RWF 500",
  INVALID_PHONE: "Please enter a valid phone number",
  VALIDATION_ERROR: "Please check your phone number and amount",
  PHONE_NOT_FOUND: "No phone number on your account. Please enter one manually",
  UNAUTHORIZED: "Please log in to top up your wallet",
  FORBIDDEN: "You don't have permission to perform this action",
};

export const useTopUp = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<TopUpInitiated, Error, TopUpPayload>({
    mutationFn: (payload) => bookingService.topUpWallet(payload),
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "INVALID_AMOUNT" || code === "INVALID_PHONE") {
        // handled inline in the component
      } else {
        const friendly = topUpErrorMessages[code] ?? "Top-up failed. Please try again.";
        showToast(friendly, "error");
      }
    },
  });
};
