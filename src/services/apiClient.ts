import axios from "axios";
import i18n from "../i18n";

export const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';

export const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

// Dynamically attach X-Locale header based on current i18n language.
// Maps i18next language codes → API locale values (rw | en | fr).
const localeMap: Record<string, string> = {
  kiny: 'rw',
  en: 'en',
  fr: 'fr',
};

axiosInstance.interceptors.request.use((config) => {
  const lang = i18n.language ?? 'kiny';
  config.headers['X-Locale'] = localeMap[lang] ?? 'rw';
  return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            const status = error.response.status;
            const url = originalRequest.url || '';
            const isAuthReq = url.includes('/auth/');

            // Catch explicit 401 Unauthorized token expiries and attempt to auto-refresh silently.
            // Exclude:
            //   - /auth/refresh itself (infinite loop)
            //   - /auth/login (deliberate wrong credentials)
            //   - /users/me (optional auth probe — 401 just means not logged in, not a redirect trigger)
            //   - wallet SSE endpoints (401 = not authenticated, not expired token)
            const isAuthProbe =
                url.includes('/wallet/topup') ||    // SSE — 401 = not logged in
                url.includes('/wallet/transactions'); // paginated — 401 = not logged in

            if (
                status === 401 &&
                !originalRequest._retry &&
                !url.includes('/auth/login') &&
                !url.includes('/auth/refresh') &&
                !isAuthProbe
            ) {
                originalRequest._retry = true;
                try {
                    await axiosInstance.post('/auth/refresh');
                    // Cookie tokens securely rotated — resume the paused request:
                    return axiosInstance(originalRequest);
                } catch (err) {
                    // Refresh failed — only redirect if on a protected page
                    // /users/me is used as an auth probe — failure just means guest, not a redirect
                    const isUserProbe = url.includes('/users/me');
                    const publicPaths = ['/', '/login', '/signup', '/trips', '/forgot-password', '/reset-password', '/privacy', '/cookies'];
                    const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/trips/'));
                    if (!isUserProbe && !isPublicPath && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(err);
                }
            }

            // Intercept catastrophic system faults (500)
            // Exclude public passenger-facing endpoints — a 500 on locations/trips/prices
            // should degrade gracefully (empty results) rather than crash the whole page.
            const isPublicEndpoint =
                url.includes('/trips') ||
                url.includes('/locations') ||
                url.includes('/prices') ||
                url.includes('/organizations');

            if (status === 500 && !isPublicEndpoint) {
                window.location.href = '/500';
            }
            // Intercept permission zone violations (403), except for:
            // - Auth requests (handled inline by forms)
            // - Public passenger-facing endpoints
            else if (status === 403 && !isAuthReq && !isPublicEndpoint) {
                window.location.href = '/403';
            }
        }
        return Promise.reject(error);
    }
);

class APIClient<TResponse> {
    endpoint: string;
    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }
    getAll = () => {
        return axiosInstance
            .get<TResponse>(this.endpoint)
            .then((res) => res.data);
    };

    get = (id: string | number) => {
        return axiosInstance
            .get<TResponse>(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    };

    post = <TRequest>(input: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, input)
            .then((res) => res.data);
    };
    put = <TRequest>(input: TRequest, id: string | number) => {
        return axiosInstance
            .put<TResponse>(`${this.endpoint}/${id}`, input)
            .then((res) => res.data);
    };

    patch = <TRequest>(input: TRequest, id?: string | number) => {
        const url = id ? `${this.endpoint}/${id}` : this.endpoint;
        return axiosInstance
            .patch<TResponse>(url, input)
            .then((res) => res.data);
    };

    registerUser = <TRequest>(userData: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, userData)
            .then((res) => res.data);
    };
    searchDest = async <TRequest>(userData: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, userData)
            .then((res) => res.data)
            .catch((error) => {
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {
                    // Server responded with a message
                    throw new Error(error.response.data.message);
                } else {
                    throw new Error(error.message);
                }
            });
    };
}

export default APIClient;
