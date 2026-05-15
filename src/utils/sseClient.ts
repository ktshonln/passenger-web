import { baseUrl } from "../services/apiClient";
import type { TicketSSEEvent, TopUpSSEEvent } from "../types";

// ─── Ticket payment stream ────────────────────────────────────────────────────

export interface TicketSSEHandlers {
  onPending?: (event: TicketSSEEvent) => void;
  onConfirmed: (event: TicketSSEEvent) => void;
  onFailed: (event: TicketSSEEvent) => void;
  onExpired?: (event: TicketSSEEvent) => void;
  onTimeout: (event: TicketSSEEvent) => void;
}

/**
 * Opens GET /tickets/:id/stream and dispatches events to handlers.
 * Returns a cleanup function that aborts the stream.
 */
export function openTicketStream(ticketId: string, handlers: TicketSSEHandlers): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${baseUrl}/tickets/${ticketId}/stream`, {
        credentials: "include",
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          try {
            const event: TicketSSEEvent = JSON.parse(dataLine.slice(5).trim());

            switch (event.status) {
              case "pending":
                handlers.onPending?.(event);
                break;
              case "confirmed":
                handlers.onConfirmed(event);
                controller.abort();
                return;
              case "failed":
                handlers.onFailed(event);
                controller.abort();
                return;
              case "expired":
                handlers.onExpired?.(event);
                controller.abort();
                return;
              case "timeout":
                handlers.onTimeout(event);
                controller.abort();
                return;
            }
          } catch {
            // malformed JSON — ignore
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        handlers.onFailed({ status: "failed" });
      }
    }
  })();

  return () => controller.abort();
}

// ─── Wallet top-up stream ─────────────────────────────────────────────────────

export interface TopUpSSEHandlers {
  onCompleted: (event: TopUpSSEEvent) => void;
  onFailed: (event: TopUpSSEEvent) => void;
  onTimeout: () => void;
}

/**
 * Opens GET /users/me/wallet/topup/:id/stream and dispatches named SSE events.
 * Returns a cleanup function that aborts the stream.
 */
export function openTopUpStream(topupId: string, handlers: TopUpSSEHandlers): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${baseUrl}/users/me/wallet/topup/${topupId}/stream`, {
        credentials: "include",
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          // Named SSE events: "event: completed\ndata: {...}"
          const lines = chunk.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));

          const eventName = eventLine?.slice(6).trim();
          const data = dataLine ? (() => {
            try { return JSON.parse(dataLine.slice(5).trim()); } catch { return {}; }
          })() : {};

          if (eventName === "completed") {
            handlers.onCompleted(data as TopUpSSEEvent);
            controller.abort();
            return;
          } else if (eventName === "failed") {
            handlers.onFailed(data as TopUpSSEEvent);
            controller.abort();
            return;
          } else if (eventName === "timeout") {
            handlers.onTimeout();
            controller.abort();
            return;
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        handlers.onFailed({ type: "topup.failed", topup_id: topupId, user_id: "", amount: 0 });
      }
    }
  })();

  return () => controller.abort();
}

// ─── Legacy alias (kept for backward compat) ─────────────────────────────────
/** @deprecated Use openTicketStream instead */
export const openBookingStream = openTicketStream as any;
