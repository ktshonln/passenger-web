import { useQuery } from "@tanstack/react-query";
import tripService from "../services/tripService";
import { CACHE_KEY_TRIP_DETAIL } from "../utils/constants";
import type { TripDetail } from "../types";

export const useTripDetail = (id: string) =>
  useQuery<TripDetail, Error>({
    queryKey: [...CACHE_KEY_TRIP_DETAIL, id],
    queryFn: () => tripService.getTripById(id),
    staleTime: 60 * 1000,
    retry: false, // 404 TRIP_NOT_FOUND should not be retried
    enabled: Boolean(id),
  });
