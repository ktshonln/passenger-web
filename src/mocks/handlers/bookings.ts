import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { bookingsDb } from "../db";

const encodeSSE = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

export const bookingHandlers = [
  // POST /tickets — initiate a ticket booking
  http.post(`${baseUrl}/tickets`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as any;

    // Simulate no-seats error for a specific trip id
    if (body.trip_id === "trip-full") {
      return HttpResponse.json({ error: { code: "NO_SEATS_AVAILABLE", message: "No seats available" } }, { status: 409 });
    }

    // Wallet payment (no payment_method field) requires authentication
    const cookies = request.headers.get("cookie") ?? "";
    if (!body.payment_method && !cookies.includes("mock_jwt")) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const ticket_id = `ticket-${Date.now()}`;
    bookingsDb[ticket_id] = { booking_id: ticket_id, status: "payment_pending" };

    // Spec: 202 { ticket_id }
    return HttpResponse.json({ ticket_id }, { status: 202 });
  }),

  // GET /tickets/:id/stream — SSE payment status stream
  http.get(`${baseUrl}/tickets/:id/stream`, ({ params }) => {
    const ticket_id = params.id as string;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Immediately send pending
        controller.enqueue(encoder.encode(encodeSSE({ status: "pending" })));

        // After 3 seconds, send confirmed
        await new Promise<void>((resolve) => setTimeout(resolve, 3000));

        if (bookingsDb[ticket_id]) {
          bookingsDb[ticket_id].status = "confirmed";
        }
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              status: "confirmed",
              ticket: {
                id: ticket_id,
                status: "confirmed",
              },
            })
          )
        );

        controller.close();
      },
    });

    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
];
