import { axiosInstance } from "./apiClient";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  phone_verified_at: string | null;
  email: string | null;
  email_verified_at: string | null;
  avatar_path: string | null;
  user_type: string;
  status: string;
  two_factor_enabled: boolean;
  notif_channel: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  avatar_path?: string;
  notif_channel?: string[];
  two_factor_enabled?: boolean;
}

const endpoint = "/users/me";

export default {
  getCurrentUser: () =>
    axiosInstance.get<User>(endpoint).then((res) => res.data),

  updateCurrentUser: (data: UpdateUserPayload) =>
    axiosInstance.patch<User>(endpoint, data).then((res) => res.data),

  updatePassword: (data: any) =>
    axiosInstance.put<{ message: string }>(`${endpoint}/password`, data).then((res) => res.data),

  getAvatarPresignedUrl: (contentType: string) =>
    axiosInstance.get<{ upload_url: string; path: string }>(`${endpoint}/avatar/presigned-url`, { params: { content_type: contentType } }).then((res) => res.data),
};
