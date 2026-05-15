import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { TicketInitiated, TicketPayload } from "../types";

export const useCreateBooking = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<TicketInitiated, Error, TicketPayload>({
    mutationFn: (payload: TicketPayload) => bookingService.createTicket(payload),
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) {
        showToast("No seats available for this trip.", "error");
      } else if (status === 402) {
        showToast("Insufficient wallet balance.", "error");
      } else {
        showToast(
          err?.response?.data?.error?.message || "Booking failed. Please try again.",
          "error"
        );
      }
    },
  });
};
