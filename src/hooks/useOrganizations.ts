import { useQuery } from "@tanstack/react-query";
import organizationService from "../services/organizationService";
import { CACHE_KEY_ORGANIZATIONS } from "../utils/constants";
import type { Organization, PaginatedResponse, GetOrganizationsParams } from "../types";

export const usePublicOrganizations = (params?: GetOrganizationsParams) =>
  useQuery<PaginatedResponse<Organization>, Error>({
    queryKey: [...CACHE_KEY_ORGANIZATIONS, params],
    queryFn: () => organizationService.getPublicOrganizations(params),
    staleTime: 5 * 60 * 1000,
  });
