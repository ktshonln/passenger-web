import { useQuery } from "@tanstack/react-query";
import tripService from "../services/tripService";
import { CACHE_KEY_TRIP_DETAIL } from "../utils/constants";
import type { TripDetail } from "../types";

export const useTripDetail = (id: string) =>
  useQuery<TripDetail, Error>({
    queryKey: [...CACHE_KEY_TRIP_DETAIL, id],
    queryFn: () => tripService.getTripById(id),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(id),
  });
