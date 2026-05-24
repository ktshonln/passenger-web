import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { TopUpInitiated, TopUpPayload } from "../types";

export const useTopUp = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<TopUpInitiated, Error, TopUpPayload>({
    mutationFn: (payload) => bookingService.topUpWallet(payload),
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "INVALID_AMOUNT" || code === "INVALID_PHONE") {
        // handled inline
      } else {
        showToast(err?.response?.data?.error?.message || "Top-up failed. Please try again.", "error");
      }
    },
  });
};
