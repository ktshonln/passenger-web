import type { Location, Organization, Trip, TripDetail, Price, WalletBalance } from '../types';

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
  { id: 'loc-kgl', name: 'Kigali',     lat: -1.9441, lng: 30.0619 },
  { id: 'loc-muh', name: 'Muhanga',    lat: -2.0833, lng: 29.7500 },
  { id: 'loc-mus', name: 'Musanze',    lat: -1.4990, lng: 29.6340 },
  { id: 'loc-rub', name: 'Rubavu',     lat: -1.6800, lng: 29.3600 },
  { id: 'loc-nya', name: 'Nyagatare',  lat: -1.2990, lng: 30.3280 },
  { id: 'loc-huy', name: 'Huye',       lat: -2.5960, lng: 29.7390 },
  { id: 'loc-rus', name: 'Rusizi',     lat: -2.4800, lng: 28.9000 },
];

// ─── Organizations ────────────────────────────────────────────────────────────

export interface MockOrganization extends Organization {
  status: string;
}

export const organizationsDb: MockOrganization[] = [
  {
    id: 'org-volcano',
    name: 'Volcano Express',
    slug: 'volcano-express',
    org_type: 'bus_company',
    logo_path: null,
    story: 'Connecting Rwanda since 2005 with safe, reliable intercity bus services.',
    status: 'active',
  },
  {
    id: 'org-ritco',
    name: 'RITCO',
    slug: 'ritco',
    org_type: 'bus_company',
    logo_path: null,
    story: 'Rwanda Integrated Transport Company — serving the nation with affordable fares.',
    status: 'active',
  },
  {
    id: 'org-kbs',
    name: 'Kigali Bus Services',
    slug: 'kigali-bus-services',
    org_type: 'bus_company',
    logo_path: null,
    story: 'Urban and intercity routes across Rwanda.',
    status: 'inactive', // intentionally inactive to test filtering
  },
];

// ─── Trips ────────────────────────────────────────────────────────────────────

export const tripsDb: Trip[] = [
  {
    id: 'trip-001',
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-mus', name: 'Musanze',   lat: -1.4990, lng: 29.6340 },
    departure_at: '2026-04-25T07:00:00Z',
    arrival_at:   '2026-04-25T09:30:00Z',
    price: 2500,
    currency: 'RWF',
    available_seats: 14,
    total_seats: 30,
    company: { id: 'org-volcano', name: 'Volcano Express', logo_path: null },
    bus: { id: 'bus-001', plate: 'RAA 001 A', type: 'Coach' },
  },
  {
    id: 'trip-002',
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-rub', name: 'Rubavu',   lat: -1.6800, lng: 29.3600 },
    departure_at: '2026-04-25T08:00:00Z',
    arrival_at:   '2026-04-25T11:00:00Z',
    price: 3500,
    currency: 'RWF',
    available_seats: 8,
    total_seats: 30,
    company: { id: 'org-volcano', name: 'Volcano Express', logo_path: null },
    bus: { id: 'bus-002', plate: 'RAA 002 B', type: 'Coach' },
  },
  {
    id: 'trip-003',
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-huy', name: 'Huye',     lat: -2.5960, lng: 29.7390 },
    departure_at: '2026-04-25T09:00:00Z',
    arrival_at:   '2026-04-25T12:00:00Z',
    price: 3000,
    currency: 'RWF',
    available_seats: 20,
    total_seats: 45,
    company: { id: 'org-ritco', name: 'RITCO', logo_path: null },
    bus: { id: 'bus-003', plate: 'RAB 010 C', type: 'Minibus' },
  },
  {
    id: 'trip-004',
    origin:      { id: 'loc-kgl', name: 'Kigali',     lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-nya', name: 'Nyagatare',  lat: -1.2990, lng: 30.3280 },
    departure_at: '2026-04-25T06:30:00Z',
    arrival_at:   '2026-04-25T09:00:00Z',
    price: 2000,
    currency: 'RWF',
    available_seats: 0,
    total_seats: 30,
    company: { id: 'org-ritco', name: 'RITCO', logo_path: null },
    bus: { id: 'bus-004', plate: 'RAB 020 D', type: 'Coach' },
  },
  {
    id: 'trip-005',
    origin:      { id: 'loc-muh', name: 'Muhanga',  lat: -2.0833, lng: 29.7500 },
    destination: { id: 'loc-rus', name: 'Rusizi',   lat: -2.4800, lng: 28.9000 },
    departure_at: '2026-04-25T10:00:00Z',
    arrival_at:   '2026-04-25T13:30:00Z',
    price: 2800,
    currency: 'RWF',
    available_seats: 5,
    total_seats: 20,
    company: { id: 'org-volcano', name: 'Volcano Express', logo_path: null },
    bus: { id: 'bus-005', plate: 'RAA 030 E', type: 'Minibus' },
  },
];

// ─── Trip Details ─────────────────────────────────────────────────────────────

export const tripsDetailDb: Record<string, TripDetail> = {
  'trip-001': {
    id: 'trip-001',
    is_express: false,
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-mus', name: 'Musanze',   lat: -1.4990, lng: 29.6340 },
    departure_at: '2026-04-25T07:00:00Z',
    arrival_at:   '2026-04-25T09:30:00Z',
    price: 2500,
    currency: 'RWF',
    available_seats: 14,
    total_seats: 30,
    company: {
      id: 'org-volcano',
      name: 'Volcano Express',
      logo_path: null,
      story: 'Connecting Rwanda since 2005 with safe, reliable intercity bus services.',
    },
    bus: { id: 'bus-001', plate: 'RAA 001 A', type: 'Coach' },
    stops: [
      { id: 'stop-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619, order: 1 },
      { id: 'stop-muh', name: 'Muhanga',  lat: -2.0833, lng: 29.7500, order: 2 },
      { id: 'stop-mus', name: 'Musanze',  lat: -1.4990, lng: 29.6340, order: 3 },
    ],
  },
  'trip-002': {
    id: 'trip-002',
    is_express: false,
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-rub', name: 'Rubavu',   lat: -1.6800, lng: 29.3600 },
    departure_at: '2026-04-25T08:00:00Z',
    arrival_at:   '2026-04-25T11:00:00Z',
    price: 3500,
    currency: 'RWF',
    available_seats: 8,
    total_seats: 30,
    company: {
      id: 'org-volcano',
      name: 'Volcano Express',
      logo_path: null,
      story: 'Connecting Rwanda since 2005 with safe, reliable intercity bus services.',
    },
    bus: { id: 'bus-002', plate: 'RAA 002 B', type: 'Coach' },
    stops: [
      { id: 'stop-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619, order: 1 },
      { id: 'stop-muh', name: 'Muhanga',  lat: -2.0833, lng: 29.7500, order: 2 },
      { id: 'stop-mus', name: 'Musanze',  lat: -1.4990, lng: 29.6340, order: 3 },
      { id: 'stop-rub', name: 'Rubavu',   lat: -1.6800, lng: 29.3600, order: 4 },
    ],
  },
  'trip-003': {
    id: 'trip-003',
    is_express: true, // express trip — no stops section rendered
    origin:      { id: 'loc-kgl', name: 'Kigali',   lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-huy', name: 'Huye',     lat: -2.5960, lng: 29.7390 },
    departure_at: '2026-04-25T09:00:00Z',
    arrival_at:   '2026-04-25T12:00:00Z',
    price: 3000,
    currency: 'RWF',
    available_seats: 20,
    total_seats: 45,
    company: {
      id: 'org-ritco',
      name: 'RITCO',
      logo_path: null,
      story: 'Rwanda Integrated Transport Company — serving the nation with affordable fares.',
    },
    bus: { id: 'bus-003', plate: 'RAB 010 C', type: 'Minibus' },
    stops: [
      { id: 'stop-kgl2', name: 'Kigali', lat: -1.9441, lng: 30.0619, order: 1 },
      { id: 'stop-huy',  name: 'Huye',   lat: -2.5960, lng: 29.7390, order: 2 },
    ],
  },
  'trip-004': {
    id: 'trip-004',
    is_express: false,
    origin:      { id: 'loc-kgl', name: 'Kigali',     lat: -1.9441, lng: 30.0619 },
    destination: { id: 'loc-nya', name: 'Nyagatare',  lat: -1.2990, lng: 30.3280 },
    departure_at: '2026-04-25T06:30:00Z',
    arrival_at:   '2026-04-25T09:00:00Z',
    price: 2000,
    currency: 'RWF',
    available_seats: 0,
    total_seats: 30,
    company: {
      id: 'org-ritco',
      name: 'RITCO',
      logo_path: null,
      story: 'Rwanda Integrated Transport Company — serving the nation with affordable fares.',
    },
    bus: { id: 'bus-004', plate: 'RAB 020 D', type: 'Coach' },
    stops: [
      { id: 'stop-kgl3', name: 'Kigali',    lat: -1.9441, lng: 30.0619, order: 1 },
      { id: 'stop-nya',  name: 'Nyagatare', lat: -1.2990, lng: 30.3280, order: 2 },
    ],
  },
  'trip-005': {
    id: 'trip-005',
    is_express: false,
    origin:      { id: 'loc-muh', name: 'Muhanga',  lat: -2.0833, lng: 29.7500 },
    destination: { id: 'loc-rus', name: 'Rusizi',   lat: -2.4800, lng: 28.9000 },
    departure_at: '2026-04-25T10:00:00Z',
    arrival_at:   '2026-04-25T13:30:00Z',
    price: 2800,
    currency: 'RWF',
    available_seats: 5,
    total_seats: 20,
    company: {
      id: 'org-volcano',
      name: 'Volcano Express',
      logo_path: null,
      story: 'Connecting Rwanda since 2005 with safe, reliable intercity bus services.',
    },
    bus: { id: 'bus-005', plate: 'RAA 030 E', type: 'Minibus' },
    stops: [
      { id: 'stop-muh2', name: 'Muhanga', lat: -2.0833, lng: 29.7500, order: 1 },
      { id: 'stop-rus',  name: 'Rusizi',  lat: -2.4800, lng: 28.9000, order: 2 },
    ],
  },
};

// ─── Prices ───────────────────────────────────────────────────────────────────
// Keyed by "boardingStopId:alightingStopId"

export const pricesDb: Record<string, Price> = {
  // trip-001 / trip-002 shared stops
  'stop-kgl:stop-muh':  { boarding_stop_id: 'stop-kgl', alighting_stop_id: 'stop-muh',  amount: 1000, currency: 'RWF' },
  'stop-kgl:stop-mus':  { boarding_stop_id: 'stop-kgl', alighting_stop_id: 'stop-mus',  amount: 2500, currency: 'RWF' },
  'stop-muh:stop-mus':  { boarding_stop_id: 'stop-muh', alighting_stop_id: 'stop-mus',  amount: 1500, currency: 'RWF' },
  // trip-002 extra stop
  'stop-kgl:stop-rub':  { boarding_stop_id: 'stop-kgl', alighting_stop_id: 'stop-rub',  amount: 3500, currency: 'RWF' },
  'stop-muh:stop-rub':  { boarding_stop_id: 'stop-muh', alighting_stop_id: 'stop-rub',  amount: 2500, currency: 'RWF' },
  'stop-mus:stop-rub':  { boarding_stop_id: 'stop-mus', alighting_stop_id: 'stop-rub',  amount: 1000, currency: 'RWF' },
  // trip-003 (express)
  'stop-kgl2:stop-huy': { boarding_stop_id: 'stop-kgl2', alighting_stop_id: 'stop-huy', amount: 3000, currency: 'RWF' },
  // trip-004
  'stop-kgl3:stop-nya': { boarding_stop_id: 'stop-kgl3', alighting_stop_id: 'stop-nya', amount: 2000, currency: 'RWF' },
  // trip-005
  'stop-muh2:stop-rus': { boarding_stop_id: 'stop-muh2', alighting_stop_id: 'stop-rus', amount: 2800, currency: 'RWF' },
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingsDb: Record<string, { booking_id: string; status: string }> = {};

// ─── Wallet ───────────────────────────────────────────────────────────────────
// Keyed by user_id

export const walletDb: Record<string, WalletBalance> = {
  'c8e23f00-34fa-4b8c-8f4b-240751b3a32a': { balance: 12999.20, currency: 'RWF' },
};
