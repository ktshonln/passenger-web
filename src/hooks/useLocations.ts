import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { CACHE_KEY_LOCATIONS } from "../utils/constants";

const apiClient = new APIClient<string[]>("/locations");


const useLocations = () =>
    useInfiniteQuery<string[], Error, InfiniteData<string[], number>>({
        queryKey: [CACHE_KEY_LOCATIONS],
        queryFn: ({ pageParam = 1 }) =>
            apiClient.getAll(),
        initialPageParam: 1,
        staleTime: 10 * 1000,
        placeholderData: (previousData, previousQuery) =>
            previousData || { pages: [], pageParams: [] },
        getNextPageParam: (lastPage, allPages) => {
            return allPages.length + 1;
        },
    });

export default useLocations;
