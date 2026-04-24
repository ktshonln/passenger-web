import type { Price } from '../types';

interface PriceDisplayProps {
  isLoading: boolean;
  price: Price | null;
  error: string | null; // 'PRICE_NOT_FOUND' or null
}

const PriceDisplay = ({ isLoading, price, error }: PriceDisplayProps) => {
  if (isLoading) {
    return (
      <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (price) {
    return (
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {price.amount.toLocaleString()} {price.currency}
      </span>
    );
  }

  if (error === 'PRICE_NOT_FOUND') {
    return (
      <span className="text-sm text-red-500 dark:text-red-400">
        Price unavailable for this combination
      </span>
    );
  }

  return null;
};

export default PriceDisplay;
