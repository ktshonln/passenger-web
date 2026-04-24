import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { walletDb, mockSessions } from "../db";

const getUserIdFromCookies = (cookies: Record<string, string>): string | null => {
  const token = cookies["access_token"];
  if (!token) return null;
  return mockSessions[token] ?? null;
};

export const walletHandlers = [
  http.get(`${baseUrl}/users/me/wallet`, async ({ cookies }) => {
    await delay(200);
    const userId = getUserIdFromCookies(cookies);
    if (!userId) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const wallet = walletDb[userId] ?? { balance: 0, currency: "RWF" };
    return HttpResponse.json(wallet, { status: 200 });
  }),

  http.post(`${baseUrl}/wallet/topup`, async ({ cookies }) => {
    await delay(400);
    const userId = getUserIdFromCookies(cookies);
    if (!userId) {
      return HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const booking_id = `topup-${Date.now()}`;
    return HttpResponse.json({ booking_id }, { status: 202 });
  }),
];
