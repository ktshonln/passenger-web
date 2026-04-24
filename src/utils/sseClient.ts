import { baseUrl } from "../services/apiClient";
import type { SSEEvent } from "../types";

export interface SSEHandlers {
  onPending?: (event: SSEEvent) => void;
  onConfirmed: (event: SSEEvent) => void;
  onFailed: (event: SSEEvent) => void;
  onTimeout: (event: SSEEvent) => void;
}

/**
 * Opens a Server-Sent Events stream for a booking (or top-up) and dispatches
 * events to the provided handlers.
 *
 * Uses fetch + ReadableStream rather than EventSource so that:
 *  - Cookies are sent automatically (credentials: 'include')
 *  - Custom headers can be added in future (e.g. Authorization)
 *  - Works consistently with MSW's ReadableStream-based SSE mock
 *
 * Returns a cleanup function that aborts the stream. Call it on component unmount.
 */
export function openBookingStream(bookingId: string, handlers: SSEHandlers): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${baseUrl}/bookings/${bookingId}/stream`, {
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

        // SSE events are separated by double newlines
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          try {
            const event: SSEEvent = JSON.parse(dataLine.slice(5).trim());

            switch (event.status) {
              case "pending":
                handlers.onPending?.(event);
                break;
              case "confirmed":
                handlers.onConfirmed(event);
                controller.abort(); // terminal — close stream
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
            // Malformed JSON — ignore and continue
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        // Unexpected network error — treat as payment failure
        handlers.onFailed({ status: "failed", reason: "network_error" });
      }
    }
  })();

  return () => controller.abort();
}
