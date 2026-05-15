import { axiosInstance } from './apiClient';
import type { Trip, PaginatedTrips, GetTripsParams } from '../types';

export default {
  /** Passenger search: GET /trips?boarding_stop_id=&alighting_stop_id=&date= */
  getTrips: (params?: GetTripsParams): Promise<PaginatedTrips> =>
    axiosInstance
      .get<PaginatedTrips>('/trips', { params })
      .then((res) => res.data),

  /** GET /trips/:id — returns { trip: Trip } */
  getTripById: (id: string): Promise<Trip> =>
    axiosInstance
      .get<{ trip: Trip }>(`/trips/${id}`)
      .then((res) => res.data.trip),
};
