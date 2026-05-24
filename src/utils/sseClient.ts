import { baseUrl } from "../services/apiClient";
import type { TicketSSEEvent, TopUpSSEEvent } from "../types";

// ─── Ticket payment stream ────────────────────────────────────────────────────

export interface TicketSSEHandlers {
  onPending?: () => void;
  onConfirmed: (event: TicketSSEEvent) => void;
  onFailed: (event: TicketSSEEvent) => void;
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
                handlers.onPending?.();
                break;
              case "confirmed":
                handlers.onConfirmed(event);
                controller.abort();
                return;
              case "failed":
                handlers.onFailed(event);
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
        handlers.onFailed({ status: "failed", reason: "network_error", retryable: true });
      }
    }
  })();

  return () => controller.abort();
}

// ─── Wallet top-up stream ─────────────────────────────────────────────────────

export interface TopUpSSEHandlers {
  onPending?: () => void;
  onConfirmed: (event: TopUpSSEEvent) => void;
  onFailed: (event: TopUpSSEEvent) => void;
  onTimeout: (event: TopUpSSEEvent) => void;
}

/**
 * Opens GET /users/me/wallet/topup/:id/stream and dispatches events.
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
          // Support both plain data: lines and named event: lines
          const lines = chunk.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));

          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine.slice(5).trim()) as TopUpSSEEvent;
            const eventName = eventLine?.slice(6).trim();

            // Handle named events (completed/failed/timeout) or status field
            const status = data.status ?? (eventName === "completed" ? "confirmed" : eventName as string);

            if (status === "pending") {
              handlers.onPending?.();
            } else if (status === "confirmed") {
              handlers.onConfirmed({ ...data, status: "confirmed" });
              controller.abort();
              return;
            } else if (status === "failed") {
              handlers.onFailed(data);
              controller.abort();
              return;
            } else if (status === "timeout") {
              handlers.onTimeout(data);
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
        handlers.onFailed({ status: "failed", reason: "network_error", retryable: true });
      }
    }
  })();

  return () => controller.abort();
}
