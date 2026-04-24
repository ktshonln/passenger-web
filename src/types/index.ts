// ─── Location & Organization ────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
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

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface TripCompany {
  id: string;
  name: string;
  logo_path: string | null;
}

export interface TripBus {
  id: string;
  plate: string;
  type: string;
}

/** Shape returned by GET /trips (list) */
export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  departure_at: string; // ISO 8601
  arrival_at: string;   // ISO 8601
  price: number;
  currency: string;
  available_seats: number;
  total_seats: number;
  company: TripCompany;
  bus: TripBus;
}

/** Shape returned by GET /trips/:id (detail) — extends Trip */
export interface TripDetail extends Trip {
  is_express: boolean;
  stops: Stop[];
  company: TripCompany & { story: string };
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface Price {
  boarding_stop_id: string;
  alighting_stop_id: string;
  amount: number;
  currency: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
  booking_id: string;
}

export interface BookingPayload {
  trip_id: string;
  boarding_stop_id: string;
  alighting_stop_id: string;
  payment_method: 'mtn' | 'airtel' | 'wallet';
  phone?: string;
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface TopUpPayload {
  amount: number;
  provider: 'mtn' | 'airtel';
  phone: string;
}

// ─── SSE ─────────────────────────────────────────────────────────────────────

export interface SSEEvent {
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  booking_id?: string;
  message?: string;
  reason?: string;
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
