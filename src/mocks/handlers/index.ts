import { http, HttpResponse } from "msw";
import { handlers as locationHandlers } from "./locations";
import { userHandlers } from "./user";
import { authHandlers } from "./auth";
import { tripHandlers } from "./trips";
import { organizationHandlers } from "./organizations";
import { pricingHandlers } from "./pricing";
import { bookingHandlers } from "./bookings";
import { walletHandlers } from "./wallet";
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
  ...tripHandlers,
  ...organizationHandlers,
  ...pricingHandlers,
  ...bookingHandlers,
  ...walletHandlers,
];
