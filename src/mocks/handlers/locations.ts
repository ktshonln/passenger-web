import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import { locationsDb } from "../db";

export const handlers = [
  http.get(`${baseUrl}/locations`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const filtered = q
      ? locationsDb.filter((loc) => loc.name.toLowerCase().includes(q))
      : locationsDb;
    return HttpResponse.json({ data: filtered }, { status: 200 });
  }),
];
