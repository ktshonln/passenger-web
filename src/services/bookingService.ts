import { axiosInstance } from './apiClient';
import type { TicketInitiated, TicketPayload, TopUpInitiated, TopUpPayload } from '../types';

export default {
  /** POST /tickets — returns 202 { ticket_id } */
  createTicket: (payload: TicketPayload): Promise<TicketInitiated> =>
    axiosInstance
      .post<TicketInitiated>('/tickets', payload)
      .then((res) => res.data),

  /** POST /users/me/wallet/topup — returns 202 { topup_id } */
  topUpWallet: (payload: TopUpPayload): Promise<TopUpInitiated> =>
    axiosInstance
      .post<TopUpInitiated>('/users/me/wallet/topup', payload)
      .then((res) => res.data),
};
