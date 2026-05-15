import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { walletDb, mockSessions } from "../db";

const getUserIdFromCookies = (cookies: Record<string, string>): string | null => {
  const token = cookies["access_token"];
  if (!token) return null;
  return mockSessions[token] ?? null;
};

const encodeSSE = (eventName: string, data: object) =>
  `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

export const walletHandlers = [
  // GET /users/me/wallet
  http.get(`${baseUrl}/users/me/wallet`, async ({ cookies }) => {
    await delay(200);
    const userId = getUserIdFromCookies(cookies);
    if (!userId) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const wallet = walletDb[userId] ?? { balance: 0, currency: "RWF" };
    return HttpResponse.json(wallet, { status: 200 });
  }),

  // POST /users/me/wallet/topup — returns { topup_id }
  http.post(`${baseUrl}/users/me/wallet/topup`, async ({ cookies }) => {
    await delay(400);
    const userId = getUserIdFromCookies(cookies);
    if (!userId) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const topup_id = `topup-${Date.now()}`;
    return HttpResponse.json({ topup_id }, { status: 202 });
  }),

  // GET /users/me/wallet/topup/:id/stream — named SSE events
  http.get(`${baseUrl}/users/me/wallet/topup/:id/stream`, ({ params, cookies }) => {
    const topup_id = params.id as string;
    const userId = getUserIdFromCookies(cookies as Record<string, string>);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // After 3 seconds, emit completed
        await new Promise<void>((resolve) => setTimeout(resolve, 3000));

        const newBalance = userId && walletDb[userId]
          ? walletDb[userId].balance + 5000
          : 5000;

        if (userId && walletDb[userId]) {
          walletDb[userId].balance = newBalance;
        }

        controller.enqueue(
          encoder.encode(
            encodeSSE("completed", {
              type: "topup.completed",
              topup_id,
              user_id: userId ?? "",
              amount: 5000,
              new_balance: newBalance,
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
