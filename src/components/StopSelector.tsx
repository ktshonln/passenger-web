import type { Stop } from '../types';

interface StopSelectorProps {
  stops: Stop[];
  value: string;
  onChange: (stopId: string) => void;
  label: string;
  disabled?: boolean;
}

const StopSelector = ({ stops, value, onChange, label, disabled }: StopSelectorProps) => {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {stops.map((stop) => (
          <option key={stop.id} value={stop.id}>
            {stop.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StopSelector;
