import { useQuery } from "@tanstack/react-query";
import pricingService from "../services/pricingService";
import { CACHE_KEY_PRICE } from "../utils/constants";
import type { Price } from "../types";

export const usePrice = (boarding_stop_id: string, alighting_stop_id: string) =>
  useQuery<Price, Error>({
    queryKey: [...CACHE_KEY_PRICE, boarding_stop_id, alighting_stop_id],
    queryFn: () => pricingService.getPrice(boarding_stop_id, alighting_stop_id),
    enabled: Boolean(boarding_stop_id) && Boolean(alighting_stop_id),
    retry: false, // 404 PRICE_NOT_FOUND should not be retried
    staleTime: 60 * 1000,
  });
