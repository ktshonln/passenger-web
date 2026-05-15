import { useQuery } from "@tanstack/react-query";
import pricingService from "../services/pricingService";
import { CACHE_KEY_PRICE } from "../utils/constants";
import type { Price } from "../types";

/**
 * Fetches all prices for a route, then finds the one matching the
 * boarding/alighting stop pair. Returns null if no match found.
 */
export const usePrice = (
  route_id: string,
  boarding_stop_id: string,
  alighting_stop_id: string
) =>
  useQuery<{ prices: Price[] }, Error, Price | null>({
    queryKey: [...CACHE_KEY_PRICE, route_id, boarding_stop_id, alighting_stop_id],
    queryFn: () => pricingService.getPricesForRoute(route_id),
    enabled: Boolean(route_id) && Boolean(boarding_stop_id) && Boolean(alighting_stop_id),
    retry: false,
    staleTime: 60 * 1000,
    select: (res) =>
      res.prices.find(
        (p) =>
          p.boarding_stop_id === boarding_stop_id &&
          p.alighting_stop_id === alighting_stop_id
      ) ?? null,
  });
