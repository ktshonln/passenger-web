import { axiosInstance } from './apiClient';
import type { Price } from '../types';

export default {
  /**
   * GET /prices?route_id=uuid
   * Returns all stop-pair prices for a route.
   * The caller filters client-side for the specific boarding/alighting pair.
   */
  getPricesForRoute: (route_id: string): Promise<{ prices: Price[] }> =>
    axiosInstance
      .get<{ prices: Price[] }>('/prices', { params: { route_id } })
      .then((res) => res.data),
};
