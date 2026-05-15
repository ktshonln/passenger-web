import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { pricesDb } from "../db";

export const pricingHandlers = [
  // GET /prices?route_id=uuid — returns all prices for a route
  http.get(`${baseUrl}/prices`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const route_id = url.searchParams.get("route_id");

    if (!route_id) {
      return HttpResponse.json({ error: { code: "MISSING_PARAMS", message: "route_id is required" } }, { status: 400 });
    }

    const prices = pricesDb[route_id] ?? [];
    return HttpResponse.json({ prices }, { status: 200 });
  }),
];
