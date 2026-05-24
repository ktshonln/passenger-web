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

export const mockSessions: Record<string, string> = {
  "mock_jwt": "c8e23f00-34fa-4b8c-8f4b-240751b3a32a"
};

export const otps: Record<string, string> = {};

// ─── Locations ────────────────────────────────────────────────────────────────

export const locationsDb = [
  { id: 'loc-kgl', name: 'Kigali', lat: -1.9441, lng: 30.0619 },
  { id: 'loc-muh', name: 'Muhanga', lat: -2.0833, lng: 29.7500 },
  { id: 'loc-mus', name: 'Musanze', lat: -1.4990, lng: 29.6340 },
  { id: 'loc-rub', name: 'Rubavu', lat: -1.6800, lng: 29.3600 },
  { id: 'loc-nya', name: 'Nyagatare', lat: -1.2990, lng: 30.3280 },
  { id: 'loc-huy', name: 'Huye', lat: -2.5960, lng: 29.7390 },
  { id: 'loc-rus', name: 'Rusizi', lat: -2.4800, lng: 28.9000 },
];

// ─── Organizations ────────────────────────────────────────────────────────────

export const organizationsDb = [
  { id: 'org-volcano', name: 'Volcano Express', slug: 'volcano-express', org_type: 'company', logo_path: null, story: 'Connecting Rwanda since 2005.', status: 'active' },
  { id: 'org-ritco', name: 'RITCO', slug: 'ritco', org_type: 'company', logo_path: null, story: 'Rwanda Integrated Transport Company.', status: 'active' },
];

// ─── Prices ───────────────────────────────────────────────────────────────────

export const pricesDb: Record<string, { boarding_stop_id: string; alighting_stop_id: string; amount: number; currency: string }> = {
  'loc-kgl:loc-muh': { boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-muh', amount: 1000, currency: 'RWF' },
  'loc-kgl:loc-mus': { boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-mus', amount: 2500, currency: 'RWF' },
  'loc-muh:loc-mus': { boarding_stop_id: 'loc-muh', alighting_stop_id: 'loc-mus', amount: 1500, currency: 'RWF' },
  'loc-kgl:loc-huy': { boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-huy', amount: 3000, currency: 'RWF' },
  'loc-kgl:loc-rub': { boarding_stop_id: 'loc-kgl', alighting_stop_id: 'loc-rub', amount: 3500, currency: 'RWF' },
  'loc-muh:loc-rub': { boarding_stop_id: 'loc-muh', alighting_stop_id: 'loc-rub', amount: 2500, currency: 'RWF' },
  'loc-mus:loc-rub': { boarding_stop_id: 'loc-mus', alighting_stop_id: 'loc-rub', amount: 1000, currency: 'RWF' },
};
