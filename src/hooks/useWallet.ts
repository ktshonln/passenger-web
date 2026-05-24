import { useQuery } from "@tanstack/react-query";
import walletService from "../services/walletService";
import { CACHE_KEY_WALLET } from "../utils/constants";
import type { WalletBalance, WalletTransactionsResponse, GetTransactionsParams } from "../types";

export const useWalletBalance = (enabled = false) =>
  useQuery<WalletBalance, Error>({
    queryKey: CACHE_KEY_WALLET,
    queryFn: walletService.getWalletBalance,
    staleTime: 30 * 1000,
    retry: false,
    enabled,
  });

export const CACHE_KEY_TRANSACTIONS = ["wallet", "transactions"];

export const useWalletTransactions = (params?: GetTransactionsParams, enabled = true) =>
  useQuery<WalletTransactionsResponse, Error>({
    queryKey: [...CACHE_KEY_TRANSACTIONS, params],
    queryFn: () => walletService.getTransactions(params),
    staleTime: 30 * 1000,
    enabled,
  });
