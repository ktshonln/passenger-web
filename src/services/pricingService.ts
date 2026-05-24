import { axiosInstance } from './apiClient';
import type { Price } from '../types';

export default {
  /**
   * GET /prices?boarding_stop_id=&alighting_stop_id=
   * Returns a single price for the stop pair.
   * 404 → { error: { code: "PRICE_NOT_FOUND" } }
   */
  getPrice: (boarding_stop_id: string, alighting_stop_id: string): Promise<Price> =>
    axiosInstance
      .get<Price>('/prices', { params: { boarding_stop_id, alighting_stop_id } })
      .then((res) => res.data),
};
