import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { tripsDb, tripsDetailDb } from "../db";

export const tripHandlers = [
  // Detail route MUST be before the list route
  http.get(`${baseUrl}/trips/:id`, async ({ params }) => {
    await delay(300);
    const detail = tripsDetailDb[params.id as string];
    if (!detail) {
      return HttpResponse.json({ error: { code: "TRIP_NOT_FOUND", message: "Trip not found" } }, { status: 404 });
    }
    // Spec: GET /trips/:id returns { trip: Trip }
    return HttpResponse.json({ trip: detail }, { status: 200 });
  }),

  http.get(`${baseUrl}/trips`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);

    // Passenger search params (spec-aligned)
    const boarding_stop_id = url.searchParams.get("boarding_stop_id");
    const alighting_stop_id = url.searchParams.get("alighting_stop_id");
    const date = url.searchParams.get("date");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");

    let results = [...tripsDb];

    // Filter by boarding/alighting stop if provided
    if (boarding_stop_id) {
      results = results.filter((t) =>
        t.route.route_stops.some((rs) => rs.stop.id === boarding_stop_id)
      );
    }
    if (alighting_stop_id) {
      results = results.filter((t) =>
        t.route.route_stops.some((rs) => rs.stop.id === alighting_stop_id)
      );
    }
    if (date) {
      results = results.filter((t) => t.departure_at.startsWith(date));
    }

    // Only show scheduled/active trips for passenger search
    results = results.filter((t) => t.status === "scheduled" || t.status === "active");

    // Sort by departure_at ascending
    results.sort(
      (a, b) => new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime()
    );

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    // Spec: PaginatedTrips = { trips: [...], total, page, limit }
    return HttpResponse.json({ trips: paginated, total, page, limit }, { status: 200 });
  }),
];
