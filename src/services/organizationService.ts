import { axiosInstance } from './apiClient';
import type { Organization, PaginatedResponse, GetOrganizationsParams } from '../types';

export default {
  getPublicOrganizations: (params?: GetOrganizationsParams): Promise<PaginatedResponse<Organization>> =>
    axiosInstance
      .get<PaginatedResponse<Organization>>('/organizations/public', { params })
      .then((res) => res.data),
};
