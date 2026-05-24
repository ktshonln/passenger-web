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

    // Wallet payment — returns 201 with full ticket (auth enforced by real gateway, not mock)
    if (!body.payment_method || body.payment_method === "wallet") {
      const amount = 2500 * (body.seats_count || 1);
      return HttpResponse.json({
        id: `ticket-wallet-${Date.now()}`,
        status: "confirmed",
        amount,
        currency: "RWF",
        seats_count: body.seats_count || 1,
        payment_method: "wallet",
        boarding_stop: { id: body.boarding_stop_id, name: "Kigali" },
        alighting_stop: { id: body.alighting_stop_id, name: "Musanze" },
      }, { status: 201 });
    }

    // MoMo — returns 202 with ticket_id
    const ticket_id = `ticket-momo-${Date.now()}`;
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
