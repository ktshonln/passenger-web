import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { bookingsDb } from "../db";

const encodeSSE = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

export const bookingHandlers = [
  http.post(`${baseUrl}/bookings`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as any;

    // Simulate no-seats error for a specific trip id (useful for testing)
    if (body.trip_id === "trip-full") {
      return HttpResponse.json({ error: { code: "NO_SEATS_AVAILABLE" } }, { status: 409 });
    }

    // Wallet payment requires authentication
    const cookies = request.headers.get("cookie") ?? "";
    if (body.payment_method === "wallet" && !cookies.includes("mock_jwt")) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const booking_id = `booking-${Date.now()}`;
    bookingsDb[booking_id] = { booking_id, status: "pending" };

    return HttpResponse.json({ booking_id }, { status: 202 });
  }),

  http.get(`${baseUrl}/bookings/:id/stream`, ({ params }) => {
    const booking_id = params.id as string;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Immediately send pending
        controller.enqueue(encoder.encode(encodeSSE({ status: "pending" })));

        // After 3 seconds, send confirmed
        await new Promise<void>((resolve) => setTimeout(resolve, 3000));

        if (bookingsDb[booking_id]) {
          bookingsDb[booking_id].status = "confirmed";
        }
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              status: "confirmed",
              booking_id,
              message: "Your seat is confirmed!",
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
