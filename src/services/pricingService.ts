import { axiosInstance } from './apiClient';
import type { Price } from '../types';

export default {
  getPrice: (boarding_stop_id: string, alighting_stop_id: string): Promise<Price> =>
    axiosInstance
      .get<Price>('/prices', { params: { boarding_stop_id, alighting_stop_id } })
      .then((res) => res.data),
};
