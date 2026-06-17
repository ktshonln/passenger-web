import { useMutation } from "@tanstack/react-query";
import bookingService from "../services/bookingService";
import { useToastStore } from "../stores/toastStore";
import type { TicketConfirmed, TicketInitiated, TicketPayload } from "../types";

interface CreateTicketArgs {
  payload: TicketPayload;
  sudoToken?: string;
}

export const useCreateTicket = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<TicketConfirmed | TicketInitiated, Error, CreateTicketArgs>({
    mutationFn: ({ payload, sudoToken }) => bookingService.createTicket(payload, sudoToken),
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      const available = err?.response?.data?.error?.available;
      if (code === "NO_SEATS_AVAILABLE") {
        showToast(`Only ${available ?? 0} seat(s) remaining.`, "error");
      } else if (code === "PRICE_NOT_FOUND") {
        showToast("Price not found for this route segment.", "error");
      } else if (code === "INSUFFICIENT_WALLET_BALANCE") {
        // handled inline — no toast
      } else if (code === "STEP_UP_REQUIRED" || code === "STEP_UP_EXPIRED" || code === "STEP_UP_INVALID") {
        showToast("Password verification failed. Please try again.", "error");
      } else {
        showToast("Booking failed. Please try again.", "error");
      }
    },
  });
};

export const useCancelTicket = () => {
  const showToast = useToastStore((s) => s.showToast);
  return useMutation<void, Error, { ticketId: string; reason?: string }>({
    mutationFn: ({ ticketId, reason }) => bookingService.cancelTicket(ticketId, reason),
    onSuccess: () => {
      showToast("Ticket cancelled. A refund has been initiated.", "success");
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (err?.response?.status === 409) {
        showToast("This ticket cannot be cancelled at this time.", "error");
      } else if (err?.response?.status === 403) {
        showToast("Cancellation is not allowed for this trip.", "error");
      } else {
        showToast(code ?? "Failed to cancel ticket. Please try again.", "error");
      }
    },
  });
};
