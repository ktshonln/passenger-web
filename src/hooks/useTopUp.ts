import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { Booking, TopUpPayload } from "../types";

export const useTopUp = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<Booking, Error, TopUpPayload>({
    mutationFn: (payload: TopUpPayload) => bookingService.topUpWallet(payload),
    onError: (err: any) => {
      showToast(
        err?.response?.data?.message || "Top-up initiation failed. Please try again.",
        "error"
      );
    },
  });
};
