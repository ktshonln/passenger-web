import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";

const encodeSSE = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

export const bookingHandlers = [
  http.post(`${baseUrl}/tickets`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as any;

    if (body.trip_id === "trip-003") {
      return HttpResponse.json({ error: { code: "NO_SEATS_AVAILABLE", available: 0 } }, { status: 400 });
    }

    // All payments now return 202 with ticket_id, client must use SSE to confirm
    const ticket_id = `ticket-${body.payment_method || "wallet"}-${Date.now()}`;
    return HttpResponse.json({ ticket_id }, { status: 202 });
  }),

  http.get(`${baseUrl}/tickets/:id/stream`, ({ params }) => {
    const ticket_id = params.id as string;
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(encodeSSE({ status: "pending" })));
        await new Promise<void>((r) => setTimeout(r, 3000));
        controller.enqueue(encoder.encode(encodeSSE({
          status: "confirmed",
          ticket: {
            id: ticket_id, amount: 2500, currency: "RWF", seats_count: 1,
            payment_method: "mtn",
            boarding_stop: { id: "loc-kgl", name: "Kigali" },
            alighting_stop: { id: "loc-mus", name: "Musanze" },
            departure_at: "2026-06-01T07:00:00Z",
            company: { name: "Volcano Express", logo_path: null },
            bus: { plate: "RAA 001 A" },
            passenger_name: "Test Passenger",
            passenger_phone: "+250788***888",
          },
        })));
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }),
];
