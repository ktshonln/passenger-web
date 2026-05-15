import { axiosInstance } from './apiClient';
import type { Location } from '../types';

export default {
  /** GET /locations?q= — returns { locations: Location[] } */
  getLocations: (q?: string): Promise<{ locations: Location[] }> =>
    axiosInstance
      .get<{ locations: Location[] }>('/locations', { params: q ? { q } : undefined })
      .then((res) => res.data),
};
