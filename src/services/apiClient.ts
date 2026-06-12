import axios from "axios";

export const baseUrl = import.meta.env.VITE_API_URL || '/api/v1'; // Dynamically use import.meta.env.VITE_API_URL || '/api/v1'. By falling back to /api/v1 locally, we are now making "same-origin" requests that completely bypass all CORS restrictions. 

export const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
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
            // Only exclude the refresh endpoint itself (would cause infinite loop) and
            // auth login endpoint (user deliberately sent wrong credentials).
            // /users/me IS included so an expired token on page load triggers a refresh
            // rather than immediately kicking the user out.
            const isAuthProbe =
                url.includes('/wallet/topup') || // topup SSE stream — 401 = not logged in, don't loop
                url.includes('/wallet/transactions'); // same

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
                    // Refresh failed (token revoked or hard-expired) — go to login
                    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
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
