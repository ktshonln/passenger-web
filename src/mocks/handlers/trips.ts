import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";

const TRIPS: any[] = [
  {
    id: "trip-001", is_express: false,
    origin: { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619 },
    destination: { id: "loc-mus", name: "Musanze", lat: -1.4990, lng: 29.6340 },
    departure_at: "2026-06-01T07:00:00Z", arrival_at: "2026-06-01T09:30:00Z",
    currency: "RWF", available_seats: 14, total_seats: 30, price: 2500,
    company: { id: "org-volcano", name: "Volcano Express", logo_path: null, story: "Connecting Rwanda since 2005 with safe, reliable intercity bus services." },
    bus: { id: "bus-001", plate: "RAA 001 A", type: "Coach" },
    stops: [
      { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619, order: 1 },
      { id: "loc-muh", name: "Muhanga", lat: -2.0833, lng: 29.7500, order: 2 },
      { id: "loc-mus", name: "Musanze", lat: -1.4990, lng: 29.6340, order: 3 },
    ],
  },
  {
    id: "trip-002", is_express: true,
    origin: { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619 },
    destination: { id: "loc-huy", name: "Huye", lat: -2.5960, lng: 29.7390 },
    departure_at: "2026-06-01T09:00:00Z", arrival_at: "2026-06-01T12:00:00Z",
    currency: "RWF", available_seats: 20, total_seats: 45, price: 3000,
    company: { id: "org-ritco", name: "RITCO", logo_path: null, story: "Rwanda Integrated Transport Company — serving the nation." },
    bus: { id: "bus-003", plate: "RAB 010 C", type: "Minibus" },
    stops: [
      { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619, order: 1 },
      { id: "loc-huy", name: "Huye", lat: -2.5960, lng: 29.7390, order: 2 },
    ],
  },
  {
    id: "trip-003", is_express: false,
    origin: { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619 },
    destination: { id: "loc-rub", name: "Rubavu", lat: -1.6800, lng: 29.3600 },
    departure_at: "2026-06-01T08:00:00Z", arrival_at: "2026-06-01T11:00:00Z",
    currency: "RWF", available_seats: 0, total_seats: 30, price: 3500,
    company: { id: "org-volcano", name: "Volcano Express", logo_path: null, story: "Connecting Rwanda since 2005." },
    bus: { id: "bus-002", plate: "RAA 002 B", type: "Coach" },
    stops: [
      { id: "loc-kgl", name: "Kigali", lat: -1.9441, lng: 30.0619, order: 1 },
      { id: "loc-muh", name: "Muhanga", lat: -2.0833, lng: 29.7500, order: 2 },
      { id: "loc-mus", name: "Musanze", lat: -1.4990, lng: 29.6340, order: 3 },
      { id: "loc-rub", name: "Rubavu", lat: -1.6800, lng: 29.3600, order: 4 },
    ],
  },
];

const PRICES: Record<string, any> = {
  "loc-kgl:loc-muh": { boarding_stop_id: "loc-kgl", alighting_stop_id: "loc-muh", amount: 1000, currency: "RWF" },
  "loc-kgl:loc-mus": { boarding_stop_id: "loc-kgl", alighting_stop_id: "loc-mus", amount: 2500, currency: "RWF" },
  "loc-muh:loc-mus": { boarding_stop_id: "loc-muh", alighting_stop_id: "loc-mus", amount: 1500, currency: "RWF" },
  "loc-kgl:loc-huy": { boarding_stop_id: "loc-kgl", alighting_stop_id: "loc-huy", amount: 3000, currency: "RWF" },
  "loc-kgl:loc-rub": { boarding_stop_id: "loc-kgl", alighting_stop_id: "loc-rub", amount: 3500, currency: "RWF" },
  "loc-kgl:loc-muh:loc-mus:loc-rub": { boarding_stop_id: "loc-muh", alighting_stop_id: "loc-rub", amount: 2500, currency: "RWF" },
  "loc-muh:loc-rub": { boarding_stop_id: "loc-muh", alighting_stop_id: "loc-rub", amount: 2500, currency: "RWF" },
  "loc-mus:loc-rub": { boarding_stop_id: "loc-mus", alighting_stop_id: "loc-rub", amount: 1000, currency: "RWF" },
};

export const tripHandlers = [
  http.get(`${baseUrl}/trips/:id`, async ({ params }) => {
    await delay(300);
    const trip = TRIPS.find((t) => t.id === params.id);
    if (!trip) return HttpResponse.json({ error: { code: "TRIP_NOT_FOUND" } }, { status: 404 });
    return HttpResponse.json(trip);
  }),

  http.get(`${baseUrl}/trips`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const origin_id = url.searchParams.get("origin_id");
    const company_id = url.searchParams.get("company_id");
    const date = url.searchParams.get("date");

    let results = [...TRIPS];

    // Free-text: match against origin or destination name
    if (q) {
      results = results.filter(
        (t) =>
          t.origin.name.toLowerCase().includes(q) ||
          t.destination.name.toLowerCase().includes(q)
      );
    }
    if (origin_id) results = results.filter((t) => t.origin.id === origin_id);
    if (company_id) results = results.filter((t) => t.company.id === company_id);
    if (date) {
      results = results.filter((t) => t.departure_at.startsWith(date));
    }

    results.sort((a, b) => new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime());
    return HttpResponse.json({ data: results, total: results.length, page: 1, limit: 20 });
  }),

  http.get(`${baseUrl}/prices`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const boarding = url.searchParams.get("boarding_stop_id");
    const alighting = url.searchParams.get("alighting_stop_id");
    if (!boarding || !alighting) return HttpResponse.json({ error: { code: "MISSING_PARAMS" } }, { status: 400 });
    const key = `${boarding}:${alighting}`;
    const price = PRICES[key];
    if (!price) return HttpResponse.json({ error: { code: "PRICE_NOT_FOUND" } }, { status: 404 });
    return HttpResponse.json(price);
  }),
];
