import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { Booking, BookingPayload } from "../types";

export const useCreateBooking = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<Booking, Error, BookingPayload>({
    mutationFn: (payload: BookingPayload) => bookingService.createBooking(payload),
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "NO_SEATS_AVAILABLE") {
        showToast("No seats available for this trip.", "error");
      } else {
        showToast(
          err?.response?.data?.message || "Booking failed. Please try again.",
          "error"
        );
      }
    },
  });
};
