import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { usersDb, mockSessions, otps } from "../db";

const generateToken = () => Math.random().toString(36).substr(2);
const generateId = () => crypto.randomUUID();

export const authHandlers = [
  // Login
  http.post(`${baseUrl}/auth/login`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    
    // Check against real database
    const user = usersDb.find(u => u.email === body.identifier || u.phone_number === body.identifier);
    
    if (!user || user.password !== body.password) {
      return new HttpResponse(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    const token = generateToken();
    mockSessions[token] = user.id;

    // We do not send password back
    const { password, ...safeUser } = user;

    return HttpResponse.json(safeUser, {
      headers: {
        "Set-Cookie": `access_token=${token}; HttpOnly; Path=/; Max-Age=3600`
      }
    });
  }),
  
  // Register (Step 1)
  http.post(`${baseUrl}/auth/register`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    
    const existing = usersDb.find(u => u.phone_number === body.phone_number);
    if (existing) {
      return new HttpResponse(JSON.stringify({ message: "Phone number already mapped" }), { status: 409 });
    }

    const newId = generateId();
    usersDb.push({
      id: newId,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      email: body.email || "",
      password: body.password,
      user_type: "passenger",
      status: "pending_verification"
    });

    // Generate strict OTP
    otps[newId] = "123456";

    return HttpResponse.json({ 
      message: `OTP sent to ${body.phone_number}`, 
      user_id: newId, 
      otp_expires_in: 300 
    });
  }),

  // Resend OTP
  http.post(`${baseUrl}/auth/resend-otp`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    const user = usersDb.find(u => u.phone_number === body.phone_number);
    if (!user) return new HttpResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
    otps[user.id] = "123456";
    return HttpResponse.json({ message: "OTP resent successfully" });
  }),

  // Verify Phone (Step 2)
  http.post(`${baseUrl}/auth/verify-phone`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    
    const user = usersDb.find(u => u.id === body.user_id);
    const validOtp = otps[body.user_id];

    if (!user || !validOtp || validOtp !== body.otp) {
      return new HttpResponse(JSON.stringify({ message: "Invalid OTP! Using '123456'." }), { status: 400 });
    }

    // Mark active
    user.status = "active";
    delete otps[body.user_id];

    const token = generateToken();
    mockSessions[token] = user.id;

    const { password, ...safeUser } = user;

    return HttpResponse.json(safeUser, {
      headers: {
        "Set-Cookie": `access_token=${token}; HttpOnly; Path=/; Max-Age=3600`
      }
    });
  }),

  // Forgot Password
  http.post(`${baseUrl}/auth/forgot-password`, async () => {
    await delay(600);
    return HttpResponse.json({ message: "If an account with that identifier exists, a recovery link has been sent." });
  }),

  // Reset Password
  http.post(`${baseUrl}/auth/reset-password`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as any;
    if (!body.token || !body.new_password) {
      return new HttpResponse(JSON.stringify({ message: "Token and new password required" }), { status: 400 });
    }
    // Simulation logic handles successfully updating password across DB if implemented, omitted for basic mock.
    return HttpResponse.json({ message: "Password updated. Please log in again." });
  }),

  // Logout
  http.post(`${baseUrl}/auth/logout`, async ({ cookies }) => {
    await delay(400);
    if (cookies.access_token && mockSessions[cookies.access_token]) {
      delete mockSessions[cookies.access_token];
    }
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": "access_token=; HttpOnly; Path=/; Max-Age=0"
      }
    });
  })
];
