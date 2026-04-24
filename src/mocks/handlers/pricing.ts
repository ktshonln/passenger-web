import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { pricesDb } from "../db";

export const pricingHandlers = [
  http.get(`${baseUrl}/prices`, async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const boarding = url.searchParams.get("boarding_stop_id");
    const alighting = url.searchParams.get("alighting_stop_id");

    if (!boarding || !alighting) {
      return HttpResponse.json({ error: { code: "MISSING_PARAMS" } }, { status: 400 });
    }

    const key = `${boarding}:${alighting}`;
    const price = pricesDb[key];
    if (!price) {
      return HttpResponse.json({ error: { code: "PRICE_NOT_FOUND" } }, { status: 404 });
    }

    return HttpResponse.json(price, { status: 200 });
  }),
];
