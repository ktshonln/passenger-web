import { http, HttpResponse, delay } from "msw";
import { baseUrl } from "../../services/apiClient";
import { usersDb, mockSessions } from "../db";

export const userHandlers = [
  http.get(`${baseUrl}/users/me`, async ({ cookies }) => {
    await delay(300); // Simulate network latency
    // Strict mock validation: force authentication failure if access_token cookie is absent or invalid
    if (!cookies.access_token || !mockSessions[cookies.access_token]) {
      return new HttpResponse(JSON.stringify({ message: "Unauthorized. Please login." }), { status: 401 });
    }

    const userId = mockSessions[cookies.access_token];
    const user = usersDb.find(u => u.id === userId);

    if (!user) {
      return new HttpResponse(JSON.stringify({ message: "User not found." }), { status: 404 });
    }

    const { password, ...safeUser } = user;
    return HttpResponse.json(safeUser);
  }),

  http.patch(`${baseUrl}/users/me`, async ({ request, cookies }) => {
    await delay(400);
    if (!cookies.access_token || !mockSessions[cookies.access_token]) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const userId = mockSessions[cookies.access_token];
    const userIndex = usersDb.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updates = await request.json() as any;
    usersDb[userIndex] = { ...usersDb[userIndex], ...updates };

    const { password: pw, ...safeUser } = usersDb[userIndex];
    return HttpResponse.json(safeUser);
  }),

  http.put(`${baseUrl}/users/me/password`, async ({ request, cookies }) => {
    await delay(500);
    if (!cookies.access_token || !mockSessions[cookies.access_token]) {
      return new HttpResponse(null, { status: 401 });
    }

    const userId = mockSessions[cookies.access_token];
    const user = usersDb.find(u => u.id === userId);

    if (!user) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as any;
    
    // Simulate current password check
    if (body.current_password !== user.password) {
      return new HttpResponse(
        JSON.stringify({ message: "Incorrect current password" }),
        { status: 400 }
      );
    }
    
    user.password = body.new_password;

    return HttpResponse.json({ message: "Password updated successfully" });
  }),

  http.get(`${baseUrl}/users/me/avatar/presigned-url`, async ({ request, cookies }) => {
    await delay(300);
    if (!cookies.access_token || !mockSessions[cookies.access_token]) {
      return new HttpResponse(null, { status: 401 });
    }

    const url = new URL(request.url);
    const ext = url.searchParams.get("content_type")?.split('/')[1] || "jpg";
    const mockedS3Key = `avatars/mock-user/${Date.now()}.${ext}`;
    
    return HttpResponse.json({
      // We return a mock endpoint mapped directly to our MSW interceptor matching the React app's local port
      upload_url: `http://localhost:5173/mock-s3-upload/${mockedS3Key}`,
      path: `https://i.pravatar.cc/150?u=${Date.now()}`
    });
  }),

  // Add the mock handler for the dummy direct S3 put upload
  http.put(`http://localhost:5173/mock-s3-upload/*`, async () => {
    await delay(600); // Simulate binary upload time
    return new HttpResponse(null, { status: 200 });
  })
];
