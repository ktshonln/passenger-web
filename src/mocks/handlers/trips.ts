import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { tripsDb, tripsDetailDb } from "../db";

export const tripHandlers = [
  http.get(`${baseUrl}/trips`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const origin_id = url.searchParams.get("origin_id");
    const company_id = url.searchParams.get("company_id");
    const date = url.searchParams.get("date");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    let results = [...tripsDb];

    if (q) {
      results = results.filter(
        (t) =>
          t.origin.name.toLowerCase().includes(q) ||
          t.destination.name.toLowerCase().includes(q) ||
          t.company.name.toLowerCase().includes(q)
      );
    }
    if (origin_id) results = results.filter((t) => t.origin.id === origin_id);
    if (company_id) results = results.filter((t) => t.company.id === company_id);
    if (date) results = results.filter((t) => t.departure_at.startsWith(date.slice(0, 10)));

    // Sort by departure_at ascending
    results.sort(
      (a, b) => new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime()
    );

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    return HttpResponse.json({ data: paginated, total, page, limit }, { status: 200 });
  }),

  http.get(`${baseUrl}/trips/:id`, async ({ params }) => {
    await delay(300);
    const detail = tripsDetailDb[params.id as string];
    if (!detail) {
      return HttpResponse.json({ error: { code: "TRIP_NOT_FOUND" } }, { status: 404 });
    }
    return HttpResponse.json(detail, { status: 200 });
  }),
];
