import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";

const BUS_ROUTES = [
    "Kigali - Muhanga",
    "Kigali - Musanze",
    "Kigali - Rubavu",
    "Kigali - Nyagatare",
    "Kigali - Huye",
    "Kigali - Rusizi",
    "Muhanga - Karongi",
    "Musanze - Rubavu"
];

export const handlers = [
    // Intercept "GET /companies/{companyId}/buses" requests...
    http.get(`${baseUrl}/locations`, () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json(
            BUS_ROUTES,
            { status: 200 }
        );
    }),
];
