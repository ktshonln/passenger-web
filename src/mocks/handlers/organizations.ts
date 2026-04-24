import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { organizationsDb } from "../db";

export const organizationHandlers = [
  http.get(`${baseUrl}/organizations/public`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");

    let results = organizationsDb.filter((o) => o.status === "active");
    if (q) results = results.filter((o) => o.name.toLowerCase().includes(q));

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    // Strip internal `status` field before returning
    const data = paginated.map(({ status: _status, ...org }) => org);

    return HttpResponse.json({ data, total, page, limit }, { status: 200 });
  }),
];
