import { axiosInstance } from './apiClient';
import type { Trip, TripDetail, PaginatedResponse, GetTripsParams } from '../types';

export default {
  getTrips: (params?: GetTripsParams): Promise<PaginatedResponse<Trip>> =>
    axiosInstance
      .get<PaginatedResponse<Trip>>('/trips', { params })
      .then((res) => res.data),

  getTripById: (id: string): Promise<TripDetail> =>
    axiosInstance
      .get<TripDetail>(`/trips/${id}`)
      .then((res) => res.data),
};
