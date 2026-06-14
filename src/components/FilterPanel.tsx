import { useState, useRef, useEffect } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import type { Location, Organization } from '../types';
import useLocations from '../hooks/useLocations';
import { usePublicOrganizations } from '../hooks/useOrganizations';

export interface TripFilters {
  q?: string;
  origin_id?: string;
  company_id?: string;
  date?: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: TripFilters) => void;
  initialQ?: string;
}

const FilterPanel = ({ onFilterChange, initialQ }: FilterPanelProps) => {
  // ── Search query (free-text destination) ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(initialQ ?? '');

  // ── Origin picker ─────────────────────────────────────────────────────────
  const [originQuery, setOriginQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);

  // ── Company picker ────────────────────────────────────────────────────────
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Organization | null>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  // ── Date ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState('');

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: originLocations } = useLocations(originQuery.length >= 1 ? originQuery : undefined);
  const { data: orgsData } = usePublicOrganizations({ limit: 100 });
  const companies = orgsData?.data ?? [];

  // ── Click-outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedOrigin !== null ||
    selectedCompany !== null ||
    selectedDate !== '';

  // ── Emit helpers ──────────────────────────────────────────────────────────
  const emit = (overrides: Partial<TripFilters> & {
    q?: string; origin_id?: string | null; company_id?: string | null; date?: string;
  }) => {
    onFilterChange({
      q: ('q' in overrides ? overrides.q : searchQuery) || undefined,
      origin_id: ('origin_id' in overrides ? overrides.origin_id : selectedOrigin?.id) ?? undefined,
      company_id: ('company_id' in overrides ? overrides.company_id : selectedCompany?.id) ?? undefined,
      date: ('date' in overrides ? overrides.date : selectedDate) || undefined,
    });
  };

  const handleOriginSelect = (loc: Location) => {
    setSelectedOrigin(loc);
    setOriginQuery(loc.name);
    setShowOriginDropdown(false);
    emit({ origin_id: loc.id });
  };

  const handleCompanySelect = (org: Organization) => {
    setSelectedCompany(org);
    setShowCompanyDropdown(false);
    emit({ company_id: org.id });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    emit({ q: val });
  };

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    emit({ date: val });
  };

  const handleClear = () => {
    setSearchQuery('');
    setOriginQuery('');
    setSelectedOrigin(null);
    setSelectedCompany(null);
    setSelectedDate('');
    onFilterChange({});
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all';
  const labelClass = 'text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block';

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Free-text destination search */}
        <div>
          <label className={labelClass}>Where to?</label>
          <input
            type="text"
            value={searchQuery}
            placeholder="e.g. Musanze, Huye…"
            className={inputClass}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Origin location picker */}
        <div className="relative" ref={originRef}>
          <label className={labelClass}>Origin (from)</label>
          <input
            type="text"
            value={originQuery}
            placeholder="Search origin stop…"
            className={inputClass}
            onChange={(e) => {
              setOriginQuery(e.target.value);
              if (e.target.value !== selectedOrigin?.name) setSelectedOrigin(null);
              setShowOriginDropdown(true);
            }}
            onFocus={() => { if (originQuery.length >= 1) setShowOriginDropdown(true); }}
          />
          {showOriginDropdown && originLocations && originLocations.length > 0 && (
            <ul className="absolute z-50 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto w-full">
              {originLocations.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors"
                    onMouseDown={(e) => { e.preventDefault(); handleOriginSelect(loc); }}
                  >
                    {loc.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Company picker */}
        <div className="relative" ref={companyRef}>
          <label className={labelClass}>Operator</label>
          <button
            type="button"
            className={`${inputClass} flex items-center justify-between`}
            onClick={() => setShowCompanyDropdown((v) => !v)}
          >
            <span className={selectedCompany ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
              {selectedCompany?.name ?? 'All operators'}
            </span>
            <FiChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`}
            />
          </button>
          {showCompanyDropdown && (
            <ul className="absolute z-50 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto w-full">
              {selectedCompany && (
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-brand/5 hover:text-brand transition-colors italic"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelectedCompany(null);
                      setShowCompanyDropdown(false);
                      emit({ company_id: null });
                    }}
                  >
                    All operators
                  </button>
                </li>
              )}
              {companies.map((org) => (
                <li key={org.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors"
                    onMouseDown={(e) => { e.preventDefault(); handleCompanySelect(org); }}
                  >
                    {org.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date picker */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <FiX size={14} />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
