export interface MockUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password?: string;
  user_type: string;
  status: string;
  avatar_url?: string;
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
  "mock_jwt": "c8e23f00-34fa-4b8c-8f4b-240751b3a32a" // seed default login mapping if user decides to use 'mock_jwt' explicitly
};

// user_id -> otp code
export const otps: Record<string, string> = {};
