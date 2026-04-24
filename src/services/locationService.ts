import { axiosInstance } from './apiClient';
import type { Location } from '../types';

export default {
  getLocations: (q?: string): Promise<{ data: Location[] }> =>
    axiosInstance
      .get<{ data: Location[] }>('/locations', { params: q ? { q } : undefined })
      .then((res) => res.data),
};
