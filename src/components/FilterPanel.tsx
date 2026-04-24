import { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { Location } from '../types';
import useLocations from '../hooks/useLocations';
import { usePublicOrganizations } from '../hooks/useOrganizations';

interface FilterPanelProps {
  onFilterChange: (filters: { origin_id?: string; company_id?: string; date?: string }) => void;
  initialFilters?: { origin_id?: string; company_id?: string; date?: string };
}

const FilterPanel = ({ onFilterChange, initialFilters }: FilterPanelProps) => {
  const [originQuery, setOriginQuery] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string | undefined>(
    initialFilters?.origin_id
  );
  const [selectedOriginName, setSelectedOriginName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(
    initialFilters?.company_id
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(initialFilters?.date);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);

  const { data: locations } = useLocations(originQuery.length >= 1 ? originQuery : undefined);
  const { data: orgsData } = usePublicOrganizations();
  const organizations = orgsData?.data ?? [];

  // Click-outside to close origin dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters =
    selectedOriginId !== undefined ||
    selectedCompanyId !== undefined ||
    selectedDate !== undefined;

  const handleOriginSelect = (location: Location) => {
    setSelectedOriginId(location.id);
    setSelectedOriginName(location.name);
    setOriginQuery(location.name);
    setShowOriginDropdown(false);
    onFilterChange({
      origin_id: location.id,
      company_id: selectedCompanyId,
      date: selectedDate,
    });
  };

  const handleCompanyChange = (companyId: string) => {
    const value = companyId || undefined;
    setSelectedCompanyId(value);
    onFilterChange({
      origin_id: selectedOriginId,
      company_id: value,
      date: selectedDate,
    });
  };

  const handleDateChange = (raw: string) => {
    const value = raw ? new Date(raw).toISOString() : undefined;
    setSelectedDate(value);
    onFilterChange({
      origin_id: selectedOriginId,
      company_id: selectedCompanyId,
      date: value,
    });
  };

  const handleClear = () => {
    setOriginQuery('');
    setSelectedOriginId(undefined);
    setSelectedOriginName('');
    setSelectedCompanyId(undefined);
    setSelectedDate(undefined);
    onFilterChange({});
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const labelClass = 'text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block';

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Origin combobox */}
        <div className="relative" ref={originRef}>
          <label className={labelClass}>Origin</label>
          <input
            type="text"
            value={originQuery}
            placeholder="Search origin…"
            className={inputClass}
            onChange={(e) => {
              setOriginQuery(e.target.value);
              if (e.target.value !== selectedOriginName) {
                setSelectedOriginId(undefined);
              }
              setShowOriginDropdown(true);
            }}
            onFocus={() => {
              if (originQuery.length >= 1) setShowOriginDropdown(true);
            }}
          />
          {showOriginDropdown && locations && locations.length > 0 && (
            <ul className="absolute z-50 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto w-full">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors"
                    onMouseDown={(e) => {
                      // prevent blur from firing before click
                      e.preventDefault();
                      handleOriginSelect(loc);
                    }}
                  >
                    {loc.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Operator select */}
        <div>
          <label className={labelClass}>Operator</label>
          <select
            value={selectedCompanyId ?? ''}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All operators</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date/time picker */}
        <div>
          <label className={labelClass}>Date &amp; Time</label>
          <input
            type="datetime-local"
            className={inputClass}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors self-start"
          >
            <FiX size={14} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
