// ─── Location & Organization ────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  logo_path: string | null;
  story: string;
}

// ─── Trip (spec-aligned) ─────────────────────────────────────────────────────
// The trip-service returns trips with a `route` object (containing `route_stops`)
// rather than flat origin/destination/stops fields.

export interface RouteStop {
  order: number;
  stop: Location;
}

export interface Route {
  id: string;
  org_id: string | null;
  name: string | null;
  is_active: boolean;
  route_stops: RouteStop[];
}

export interface TripBus {
  id: string;
  plate: string;
  type: string;
  total_seats: number;
  is_active: boolean;
}

/** Shape returned by GET /trips and GET /trips/:id */
export interface Trip {
  id: string;
  series_id: string;
  route_id: string;
  org_id: string;
  bus_id: string | null;
  driver_id: string | null;
  departure_at: string;   // ISO 8601
  available_seats: number;
  total_seats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  is_express: boolean;
  cancellation_allowed: boolean;
  route: Route;
  bus: TripBus | null;
}

// ─── Derived helpers (computed from Trip.route) ───────────────────────────────

/** A stop as used in the UI — flattened from RouteStop */
export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface Price {
  id: string;
  route_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  amount: number;           // RWF
  boarding_stop: Location;
  alighting_stop: Location;
}

// ─── Ticket (replaces Booking) ────────────────────────────────────────────────

/** Response from POST /tickets — 202 Accepted */
export interface TicketInitiated {
  ticket_id: string;
}

/** Full ticket object returned by GET /tickets/:id and SSE confirmed event */
export interface Ticket {
  id: string;
  trip_id: string;
  org_id: string;
  user_id: string | null;
  status: 'initiated' | 'payment_pending' | 'confirmed' | 'failed' | 'expired' | 'cancelled';
  payment_method: 'cash' | 'wallet' | 'mtn' | 'airtel';
  ticket_price: number;
  seats_count: number;
  passenger_name: string;
  boarding_stop: Location;
  alighting_stop: Location;
  confirmed_at: string | null;
  validated_at: string | null;
}

/** POST /tickets request body */
export interface TicketPayload {
  trip_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  seats_count?: number;
  /** Required for guest (MoMo/Airtel) bookings. Omit for wallet payments. */
  payment_method?: 'mtn' | 'airtel';
  /** Required for guest bookings */
  phone?: string;
  /** Required for guest bookings */
  passenger_name?: string;
}

// ─── SSE (ticket stream) ──────────────────────────────────────────────────────

export interface TicketSSEEvent {
  status: 'pending' | 'confirmed' | 'failed' | 'expired' | 'timeout';
  ticket?: Ticket;
  message?: string;
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletBalance {
  balance: number;
  currency: string;
}

/** POST /users/me/wallet/topup request body */
export interface TopUpPayload {
  amount: number;
  phone_number: string;
  provider: 'mtn_momo' | 'airtel_money';
}

/** POST /users/me/wallet/topup response — 202 Accepted */
export interface TopUpInitiated {
  topup_id: string;
}

/** SSE event from GET /users/me/wallet/topup/:id/stream */
export interface TopUpSSEEvent {
  type: 'topup.completed' | 'topup.failed';
  topup_id: string;
  user_id: string;
  amount: number;
  new_balance?: number;
  reason?: string;
  retryable?: boolean;
}

// ─── Generic ─────────────────────────────────────────────────────────────────

export interface PaginatedTrips {
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Service param types ──────────────────────────────────────────────────────

/** Passenger search params for GET /trips */
export interface GetTripsParams {
  boarding_stop_id?: string;
  alighting_stop_id?: string;
  date?: string;           // YYYY-MM-DD
  seats?: number;
  page?: number;
  limit?: number;
}

export interface GetOrganizationsParams {
  q?: string;
  page?: number;
  limit?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
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

// ─── Legacy aliases (kept for backward compat with existing components) ───────
// These map old field names to the new spec shapes.

/** @deprecated Use TicketInitiated instead */
export interface Booking {
  booking_id: string;
}

/** @deprecated Use TicketPayload instead */
export interface BookingPayload {
  trip_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  payment_method: 'mtn' | 'airtel' | 'wallet';
  phone?: string;
}

/** @deprecated Use TicketSSEEvent instead */
export interface SSEEvent {
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  booking_id?: string;
  message?: string;
  reason?: string;
}
