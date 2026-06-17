import { axiosInstance } from './apiClient';
import type { TicketConfirmed, TicketInitiated, TicketPayload, TopUpInitiated, TopUpPayload } from '../types';

export default {
  /**
   * POST /tickets
   * Wallet payment → 201 TicketConfirmed (requires x-sudo-token for wallet)
   * MoMo payment  → 202 TicketInitiated { ticket_id }
   */
  createTicket: (payload: TicketPayload, sudoToken?: string): Promise<TicketConfirmed | TicketInitiated> =>
    axiosInstance
      .post<TicketConfirmed | TicketInitiated>('/tickets', payload, {
        headers: sudoToken ? { 'x-sudo-token': sudoToken } : undefined,
      })
      .then((res) => res.data),

  /**
   * POST /tickets/:id/cancel
   * Cancels a confirmed ticket and initiates a refund.
   */
  cancelTicket: (ticketId: string, reason?: string): Promise<void> =>
    axiosInstance
      .post(`/tickets/${ticketId}/cancel`, reason ? { reason } : {})
      .then(() => undefined),

  /**
   * POST /users/me/wallet/topup
   * Returns 202 { topup_id }
   */
  topUpWallet: (payload: TopUpPayload): Promise<TopUpInitiated> =>
    axiosInstance
      .post<TopUpInitiated>('/users/me/wallet/topup', payload)
      .then((res) => res.data),
};
