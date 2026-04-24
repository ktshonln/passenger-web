import { useQuery } from "@tanstack/react-query";
import tripService from "../services/tripService";
import { CACHE_KEY_TRIPS } from "../utils/constants";
import type { Trip, PaginatedResponse, GetTripsParams } from "../types";

export const useTrips = (params?: GetTripsParams) =>
  useQuery<PaginatedResponse<Trip>, Error>({
    queryKey: [...CACHE_KEY_TRIPS, params],
    queryFn: () => tripService.getTrips(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
