import { axiosInstance } from './apiClient';
import type { WalletBalance, WalletTransactionsResponse, GetTransactionsParams } from '../types';

export default {
  /** GET /users/me/wallet → { available, currency } */
  getWalletBalance: (): Promise<WalletBalance> =>
    axiosInstance
      .get<WalletBalance>('/users/me/wallet')
      .then((res) => res.data),

  /** GET /users/me/wallet/transactions */
  getTransactions: (params?: GetTransactionsParams): Promise<WalletTransactionsResponse> =>
    axiosInstance
      .get<WalletTransactionsResponse>('/users/me/wallet/transactions', { params })
      .then((res) => res.data),
};
