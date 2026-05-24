import { axiosInstance } from './apiClient';
import type { TicketConfirmed, TicketInitiated, TicketPayload, TopUpInitiated, TopUpPayload } from '../types';

export default {
  /**
   * POST /tickets
   * Wallet payment → 201 TicketConfirmed
   * MoMo payment  → 202 TicketInitiated { ticket_id }
   */
  createTicket: (payload: TicketPayload): Promise<TicketConfirmed | TicketInitiated> =>
    axiosInstance
      .post<TicketConfirmed | TicketInitiated>('/tickets', payload)
      .then((res) => res.data),

  /**
   * POST /users/me/wallet/topup
   * Returns 202 { topup_id }
   */
  topUpWallet: (payload: TopUpPayload): Promise<TopUpInitiated> =>
    axiosInstance
      .post<TopUpInitiated>('/users/me/wallet/topup', payload)
      .then((res) => res.data),
};
