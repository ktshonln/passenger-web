import { axiosInstance } from './apiClient';
import type { Location } from '../types';

export default {
  /** GET /locations?q= — returns { data: Location[], total, page, limit } */
  getLocations: (q?: string): Promise<{ data: Location[]; total: number; page: number; limit: number }> =>
    axiosInstance
      .get<{ data: Location[]; total: number; page: number; limit: number }>('/locations', { params: q ? { q } : undefined })
      .then((res) => res.data),
};
