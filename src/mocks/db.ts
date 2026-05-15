import type { Location, Trip, Price, WalletBalance } from '../types';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password?: string;
  user_type: string;
  status: string;
  avatar_path?: string;
  two_factor_enabled?: boolean;
}

export const usersDb: MockUser[] = [
  {
    id: "c8e23f00-34fa-4b8c-8f4b-240751b3a32a",
    first_name: "Patrick",
    last_name: "Ishimwe",
    phone_number: "+250788888888",
    email: "patrick@example.com",
    password: "1234",
    user_type: "passenger",
    status: "active"
  }
];

// access_token -> user_id
export const mockSessions: Record<string, string> = {
  "mock_jwt": "c8e23f00-34fa-4b8c-8f4b-240751b3a32a"
};

// user_id -> otp code
export const otps: Record<string, string> = {};

// ─── Locations ────────────────────────────────────────────────────────────────

export const locationsDb: Location[] = [
  { id: 'loc-kgl',  name: 'Kigali',    lat: -1.9441, lng: 30.0619 },
  { id: 'loc-muh',  name: 'Muhanga',   lat: -2.0833, lng: 29.7500 },
  { id: 'loc-mus',  name: 'Musanze',   lat: -1.4990, lng: 29.6340 },
  { id: 'loc-rub',  name: 'Rubavu',    lat: -1.6800, lng: 29.3600 },
  { id: 'loc-nya',  name: 'Nyagatare', lat: -1.2990, lng: 30.3280 },
  { id: 'loc-huy',  name: 'Huye',      lat: -2.5960, lng: 29.7390 },
  { id: 'loc-rus',  name: 'Rusizi',    lat: -2.4800, lng: 28.9000 },
];

// ─── Organizations ────────────────────────────────────────────────────────────

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  logo_path: string | null;
  story: string;
  status: string;
}

export const organizationsDb: MockOrganization[] = [
  {
    id: 'org-volcano',
    name: 'Volcano Express',
    slug: 'volcano-express',
    org_type: 'company',
    logo_path: null,
    story: 'Connecting Rwanda since 2005 with safe, reliable intercity bus services.',
    status: 'active',
  },
  {
    id: 'org-ritco',
    name: 'RITCO',
    slug: 'ritco',
    org_type: 'company',
    logo_path: null,
    story: 'Rwanda Integrated Transport Company — serving the nation with affordable fares.',
    status: 'active',
  },
];

// ─── Trips (spec-aligned: Trip has route with route_stops) ────────────────────

export const tripsDb: Trip[] = [
  {
    id: 'trip-001',
    series_id: 'series-001',
    route_id: 'route-kgl-mus',
    org_id: 'org-volcano',
    bus_id: 'bus-001',
    driver_id: null,
    departure_at: '2026-06-01T07:00:00Z',
    available_seats: 14,
    total_seats: 30,
    status: 'scheduled',
    is_express: false,
    cancellation_allowed: true,
    route: {
      id: 'route-kgl-mus',
      org_id: 'org-volcano',
      name: 'Kigali – Musanze',
      is_active: true,
      route_stops: [
        { order: 1, stop: { id: 'loc-kgl', name: 'Kigali',  lat: -1.9441, lng: 30.0619 } },
        { order: 2, stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 } },
        { order: 3, stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 } },
      ],
    },
    bus: { id: 'bus-001', plate: 'RAA 001 A', type: 'Coach', total_seats: 30, is_active: true },
  },
  {
    id: 'trip-002',
    series_id: 'series-002',
    route_id: 'route-kgl-rub',
    org_id: 'org-volcano',
    bus_id: 'bus-002',
    driver_id: null,
    departure_at: '2026-06-01T08:00:00Z',
    available_seats: 8,
    total_seats: 30,
    status: 'scheduled',
    is_express: false,
    cancellation_allowed: true,
    route: {
      id: 'route-kgl-rub',
      org_id: 'org-volcano',
      name: 'Kigali – Rubavu',
      is_active: true,
      route_stops: [
        { order: 1, stop: { id: 'loc-kgl', name: 'Kigali',  lat: -1.9441, lng: 30.0619 } },
        { order: 2, stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 } },
        { order: 3, stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 } },
        { order: 4, stop: { id: 'loc-rub', name: 'Rubavu',  lat: -1.6800, lng: 29.3600 } },
      ],
    },
    bus: { id: 'bus-002', plate: 'RAA 002 B', type: 'Coach', total_seats: 30, is_active: true },
  },
  {
    id: 'trip-003',
    series_id: 'series-003',
    route_id: 'route-kgl-huy',
    org_id: 'org-ritco',
    bus_id: 'bus-003',
    driver_id: null,
    departure_at: '2026-06-01T09:00:00Z',
    available_seats: 20,
    total_seats: 45,
    status: 'scheduled',
    is_express: true,
    cancellation_allowed: true,
    route: {
      id: 'route-kgl-huy',
      org_id: 'org-ritco',
      name: 'Kigali – Huye Express',
      is_active: true,
      route_stops: [
        { order: 1, stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 } },
        { order: 2, stop: { id: 'loc-huy', name: 'Huye',   lat: -2.5960, lng: 29.7390 } },
      ],
    },
    bus: { id: 'bus-003', plate: 'RAB 010 C', type: 'Minibus', total_seats: 45, is_active: true },
  },
  {
    id: 'trip-004',
    series_id: 'series-004',
    route_id: 'route-kgl-nya',
    org_id: 'org-ritco',
    bus_id: 'bus-004',
    driver_id: null,
    departure_at: '2026-06-01T06:30:00Z',
    available_seats: 0,
    total_seats: 30,
    status: 'scheduled',
    is_express: false,
    cancellation_allowed: true,
    route: {
      id: 'route-kgl-nya',
      org_id: 'org-ritco',
      name: 'Kigali – Nyagatare',
      is_active: true,
      route_stops: [
        { order: 1, stop: { id: 'loc-kgl', name: 'Kigali',    lat: -1.9441, lng: 30.0619 } },
        { order: 2, stop: { id: 'loc-nya', name: 'Nyagatare', lat: -1.2990, lng: 30.3280 } },
      ],
    },
    bus: { id: 'bus-004', plate: 'RAB 020 D', type: 'Coach', total_seats: 30, is_active: true },
  },
  {
    id: 'trip-005',
    series_id: 'series-005',
    route_id: 'route-muh-rus',
    org_id: 'org-volcano',
    bus_id: 'bus-005',
    driver_id: null,
    departure_at: '2026-06-01T10:00:00Z',
    available_seats: 5,
    total_seats: 20,
    status: 'scheduled',
    is_express: false,
    cancellation_allowed: true,
    route: {
      id: 'route-muh-rus',
      org_id: 'org-volcano',
      name: 'Muhanga – Rusizi',
      is_active: true,
      route_stops: [
        { order: 1, stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 } },
        { order: 2, stop: { id: 'loc-rus', name: 'Rusizi',  lat: -2.4800, lng: 28.9000 } },
      ],
    },
    bus: { id: 'bus-005', plate: 'RAA 030 E', type: 'Minibus', total_seats: 20, is_active: true },
  },
];

// Detail DB — same as tripsDb for mock purposes (GET /trips/:id returns { trip })
export const tripsDetailDb: Record<string, Trip> = Object.fromEntries(
  tripsDb.map((t) => [t.id, t])
);

// ─── Prices (keyed by route_id, array of Price objects) ──────────────────────

export const pricesDb: Record<string, Price[]> = {
  'route-kgl-mus': [
    { id: 'p-001', route_id: 'route-kgl-mus', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-muh', amount: 1000, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 } },
    { id: 'p-002', route_id: 'route-kgl-mus', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-mus', amount: 2500, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 } },
    { id: 'p-003', route_id: 'route-kgl-mus', boarding_stop_id: 'loc-muh', alighting_stop_id: 'loc-mus', amount: 1500, boarding_stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 }, alighting_stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 } },
  ],
  'route-kgl-rub': [
    { id: 'p-004', route_id: 'route-kgl-rub', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-muh', amount: 1000, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 } },
    { id: 'p-005', route_id: 'route-kgl-rub', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-mus', amount: 2500, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 } },
    { id: 'p-006', route_id: 'route-kgl-rub', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-rub', amount: 3500, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-rub', name: 'Rubavu', lat: -1.6800, lng: 29.3600 } },
    { id: 'p-007', route_id: 'route-kgl-rub', boarding_stop_id: 'loc-muh', alighting_stop_id: 'loc-rub', amount: 2500, boarding_stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 }, alighting_stop: { id: 'loc-rub', name: 'Rubavu', lat: -1.6800, lng: 29.3600 } },
    { id: 'p-008', route_id: 'route-kgl-rub', boarding_stop_id: 'loc-mus', alighting_stop_id: 'loc-rub', amount: 1000, boarding_stop: { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 }, alighting_stop: { id: 'loc-rub', name: 'Rubavu', lat: -1.6800, lng: 29.3600 } },
  ],
  'route-kgl-huy': [
    { id: 'p-009', route_id: 'route-kgl-huy', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-huy', amount: 3000, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-huy', name: 'Huye', lat: -2.5960, lng: 29.7390 } },
  ],
  'route-kgl-nya': [
    { id: 'p-010', route_id: 'route-kgl-nya', boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-nya', amount: 2000, boarding_stop: { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 }, alighting_stop: { id: 'loc-nya', name: 'Nyagatare', lat: -1.2990, lng: 30.3280 } },
  ],
  'route-muh-rus': [
    { id: 'p-011', route_id: 'route-muh-rus', boarding_stop_id: 'loc-muh', alighting_stop_id: 'loc-rus', amount: 2800, boarding_stop: { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 }, alighting_stop: { id: 'loc-rus', name: 'Rusizi', lat: -2.4800, lng: 28.9000 } },
  ],
};

// ─── Bookings / Tickets ───────────────────────────────────────────────────────

export const bookingsDb: Record<string, { booking_id: string; status: string }> = {};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletDb: Record<string, WalletBalance> = {
  'c8e23f00-34fa-4b8c-8f4b-240751b3a32a': { balance: 12999, currency: 'RWF' },
};
