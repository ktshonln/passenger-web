import { http, HttpResponse } from "msw";
import { handlers as locationHandlers } from "./locations";
import { corsHeaders } from "./utils";

export const handlers = [
    http.options("*", () => {
        return new HttpResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }),
    ...locationHandlers,
];
