import { axiosInstance } from './apiClient';
import type { WalletBalance } from '../types';

export default {
  getWalletBalance: (): Promise<WalletBalance> =>
    axiosInstance
      .get<WalletBalance>('/users/me/wallet')
      .then((res) => res.data),
};
