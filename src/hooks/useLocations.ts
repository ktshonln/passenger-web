import { useQuery } from "@tanstack/react-query";
import locationService from "../services/locationService";
import { CACHE_KEY_LOCATIONS } from "../utils/constants";
import type { Location } from "../types";

const useLocations = (q?: string) =>
  useQuery<{ data: Location[] }, Error, Location[]>({
    queryKey: [...CACHE_KEY_LOCATIONS, q ?? ""],
    queryFn: () => locationService.getLocations(q),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export default useLocations;
