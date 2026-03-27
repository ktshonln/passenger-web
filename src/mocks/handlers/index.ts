import { http, HttpResponse } from "msw";
import { handlers as locationHandlers } from "./locations";
import { userHandlers } from "./user";
import { authHandlers } from "./auth";
import { corsHeaders } from "./utils";

export const handlers = [
    http.options("*", () => {
        return new HttpResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }),
    ...locationHandlers,
    ...userHandlers,
    ...authHandlers,
];
