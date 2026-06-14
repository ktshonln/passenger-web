// ─── Location & Organization ────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city?: string | null;
  province?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  logo_path: string | null;
  story: string;
}

// ─── Trip ────────────────────────────────────────────────────────────────────
// Feature spec shape: flat origin/destination/stops/company fields

export interface TripCompany {
  id: string;
  name: string;
  logo_path: string | null;
  story?: string;
}

export interface TripBus {
  id: string;
  plate: string;
  type: string;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

/** Shape returned by GET /trips (list) */
export interface Trip {
  id: string;
  is_express: boolean;
  origin: Location;
  destination: Location;
  departure_at: string;
  arrival_at?: string;
  price?: number | null;
  currency: string;
  available_seats: number;
  total_seats: number;
  company: TripCompany;
  bus: TripBus;
}

/** Shape returned by GET /trips/:id (detail) — includes stops */
export interface TripDetail extends Trip {
  stops: Stop[];
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface Price {
  boarding_stop_id: string;
  alighting_stop_id: string;
  amount: number;
  currency: string;
}

// ─── Ticket ──────────────────────────────────────────────────────────────────

/** POST /tickets wallet — 201 immediately confirmed */
export interface TicketConfirmed {
  id: string;
  status: 'confirmed';
  amount: number;
  currency: string;
  seats_count: number;
  payment_method: 'wallet';
  boarding_stop: { id: string; name: string };
  alighting_stop: { id: string; name: string };
}

/** POST /tickets MoMo — 202 SSE flow initiated */
export interface TicketInitiated {
  ticket_id: string;
}

/** POST /tickets request body */
export interface TicketPayload {
  trip_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  seats_count: number;
  payment_method?: 'mtn' | 'airtel' | 'wallet';
  phone?: string;
  passenger_name?: string;
}

/** Full ticket from SSE confirmed event */
export interface TicketFull {
  id: string;
  amount: number;
  currency: string;
  seats_count: number;
  payment_method: string;
  boarding_stop: { id: string; name: string };
  alighting_stop: { id: string; name: string };
  departure_at?: string;
  company?: { name: string; logo_path: string | null };
  bus?: { plate: string };
  passenger_name?: string;
  passenger_phone?: string;
}

/** SSE event from GET /tickets/:id/stream */
export interface TicketSSEEvent {
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  ticket?: TicketFull;
  message?: string;
  reason?: string;
  retryable?: boolean;
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletBalance {
  available: number;
  currency: string;
}

/** Transaction from GET /users/me/wallet/transactions */
export interface WalletTransaction {
  id: string;
  type: 'topup' | 'payment';
  amount: number;
  currency: string;
  status: 'confirmed' | 'failed' | 'pending';
  description: string;
  created_at: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

/** POST /users/me/wallet/topup request */
export interface TopUpPayload {
  amount: number;
  payment_method: 'mtn' | 'airtel';
  phone?: string;
}

/** POST /users/me/wallet/topup response — 202 */
export interface TopUpInitiated {
  topup_id: string;
}

/** SSE event from GET /users/me/wallet/topup/:id/stream */
export interface TopUpSSEEvent {
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  amount?: number;
  currency?: string;
  new_balance?: number;
  message?: string;
  reason?: string;
  retryable?: boolean;
}

// ─── Generic ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Service param types ──────────────────────────────────────────────────────

export interface GetTripsParams {
  q?: string;
  origin_id?: string;
  company_id?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface GetOrganizationsParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: 'topup' | 'payment';
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  user_type: 'passenger' | 'staff';
  avatar_path: string | null;
  org_id: string | null;
  roles: string[];
  status: 'active' | 'pending_verification' | 'suspended';
  two_factor_enabled: boolean;
  login_channel: 'phone' | 'email' | null;
  locale: 'rw' | 'en' | 'fr';
}

export interface AuthResponse {
  user: AuthUser;
  tokens?: {
    access_token: string;
    refresh_token: string;
  };
}

// ─── Trip list pagination ─────────────────────────────────────────────────────

export interface PaginatedTrips {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}
