import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { mockSessions } from "../db";

const getUser = (cookies: Record<string, string>) => {
  const token = cookies["access_token"];
  return token ? mockSessions[token] : null;
};

const walletBalances: Record<string, number> = {
  "c8e23f00-34fa-4b8c-8f4b-240751b3a32a": 12999,
};

// Tracks amount between POST /topup and the SSE stream
const pendingTopUps: Record<string, { userId: string; amount: number }> = {};

const encodeSSE = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

export const walletHandlers = [
  http.get(`${baseUrl}/users/me/wallet`, async ({ cookies }) => {
    await delay(200);
    const userId = getUser(cookies);
    if (!userId) return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    const available = walletBalances[userId] ?? 0;
    return HttpResponse.json({ available, currency: "RWF" });
  }),

  http.get(`${baseUrl}/users/me/wallet/transactions`, async ({ cookies, request }) => {
    await delay(300);
    const userId = getUser(cookies);
    if (!userId) return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");

    const all = [
      { id: "tx-001", type: "topup", amount: 5000, currency: "RWF", status: "confirmed", description: "Top up via MTN MoMo", created_at: "2026-05-20T10:00:00Z" },
      { id: "tx-002", type: "payment", amount: 2500, currency: "RWF", status: "confirmed", description: "Ticket · Kigali → Musanze", created_at: "2026-05-18T08:00:00Z" },
      { id: "tx-003", type: "topup", amount: 10000, currency: "RWF", status: "confirmed", description: "Top up via Airtel Money", created_at: "2026-05-15T14:00:00Z" },
      { id: "tx-004", type: "payment", amount: 3000, currency: "RWF", status: "confirmed", description: "Ticket · Kigali → Huye", created_at: "2026-05-10T07:30:00Z" },
      { id: "tx-005", type: "topup", amount: 2000, currency: "RWF", status: "failed", description: "Top up via MTN MoMo", created_at: "2026-05-08T11:00:00Z" },
    ];

    const filtered = type ? all.filter((t) => t.type === type) : all;
    const paginated = filtered.slice((page - 1) * limit, page * limit);
    return HttpResponse.json({ data: paginated, total: filtered.length, page, limit });
  }),

  http.post(`${baseUrl}/users/me/wallet/topup`, async ({ cookies, request }) => {
    await delay(400);
    const userId = getUser(cookies);
    if (!userId) return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    const body = (await request.json()) as any;
    if (!body.amount || body.amount < 500) {
      return HttpResponse.json({ error: { code: "INVALID_AMOUNT", message: "Minimum top up amount is RWF 500" } }, { status: 400 });
    }
    const topup_id = `topup-${Date.now()}`;
    // Store the requested amount so the SSE stream can use it
    pendingTopUps[topup_id] = { userId, amount: body.amount };
    return HttpResponse.json({ topup_id }, { status: 202 });
  }),

  http.get(`${baseUrl}/users/me/wallet/topup/:id/stream`, ({ params, cookies }) => {
    const topup_id = params.id as string;
    const userId = getUser(cookies as Record<string, string>);
    const pending = pendingTopUps[topup_id];
    // Use the actual requested amount; fall back to 5000 if somehow not found
    const amount = pending?.amount ?? 5000;
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(encodeSSE({ status: "pending" })));
        await new Promise<void>((r) => setTimeout(r, 3000));
        if (userId) walletBalances[userId] = (walletBalances[userId] ?? 0) + amount;
        delete pendingTopUps[topup_id];
        controller.enqueue(encoder.encode(encodeSSE({
          status: "confirmed", amount, currency: "RWF",
          new_balance: walletBalances[userId ?? ""] ?? amount,
          message: "Your wallet has been topped up successfully.",
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
