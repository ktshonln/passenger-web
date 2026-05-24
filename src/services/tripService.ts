import { axiosInstance } from './apiClient';
import type { TripDetail, PaginatedTrips, GetTripsParams } from '../types';

export default {
  /** GET /trips — passenger search */
  getTrips: (params?: GetTripsParams): Promise<PaginatedTrips> =>
    axiosInstance
      .get<PaginatedTrips>('/trips', { params })
      .then((res) => res.data),

  /** GET /trips/:id — returns TripDetail with stops, company.story */
  getTripById: (id: string): Promise<TripDetail> =>
    axiosInstance
      .get<TripDetail>(`/trips/${id}`)
      .then((res) => res.data),
};
