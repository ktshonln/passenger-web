import { axiosInstance } from './apiClient';
import type { Booking, BookingPayload, TopUpPayload } from '../types';

export default {
  createBooking: (payload: BookingPayload): Promise<Booking> =>
    axiosInstance
      .post<Booking>('/bookings', payload)
      .then((res) => res.data),

  topUpWallet: (payload: TopUpPayload): Promise<Booking> =>
    axiosInstance
      .post<Booking>('/wallet/topup', payload)
      .then((res) => res.data),
};
