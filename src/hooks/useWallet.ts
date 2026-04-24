import { useQuery } from "@tanstack/react-query";
import walletService from "../services/walletService";
import { CACHE_KEY_WALLET } from "../utils/constants";
import type { WalletBalance } from "../types";

/**
 * Fetches the authenticated user's wallet balance.
 * Pass `enabled: false` (or omit when unauthenticated) to prevent firing for guests.
 * The query is disabled by default — callers must explicitly pass `enabled: true`
 * only when they know the user is logged in.
 */
export const useWalletBalance = (enabled = false) =>
  useQuery<WalletBalance, Error>({
    queryKey: CACHE_KEY_WALLET,
    queryFn: walletService.getWalletBalance,
    staleTime: 30 * 1000,
    retry: false,
    enabled, // never fires unless caller explicitly enables it
  });
