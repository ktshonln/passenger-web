import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";

let mockUser = {
  id: "c8e23f00-34fa-4b8c-8f4b-240751b3a32a",
  first_name: "Patrick",
  last_name: "Ishimwe",
  phone_number: "+250788888888",
  phone_verified_at: "2024-01-01T12:00:00Z",
  email: "patrick@example.com",
  email_verified_at: null,
  avatar_url: null,
  user_type: "passenger",
  status: "active",
  created_at: "2024-01-01T12:00:00Z",
  updated_at: "2024-01-01T12:00:00Z",
};

export const userHandlers = [
  http.get(`${baseUrl}/users/me`, async () => {
    await delay(300); // Simulate network latency
    return HttpResponse.json(mockUser);
  }),

  http.patch(`${baseUrl}/users/me`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    mockUser = { ...mockUser, ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(mockUser);
  }),

  http.put(`${baseUrl}/users/me/password`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    
    // Simulate current password validation
    if (body.current_password === "wrong") {
      return new HttpResponse(
        JSON.stringify({ message: "Invalid current password" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return HttpResponse.json({ message: "Password updated successfully" });
  }),
];
