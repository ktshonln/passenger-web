import { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { Location } from '../types';
import useLocations from '../hooks/useLocations';

interface FilterPanelProps {
  onFilterChange: (filters: { boarding_stop_id?: string; alighting_stop_id?: string; date?: string }) => void;
  initialFilters?: { boarding_stop_id?: string; alighting_stop_id?: string; date?: string };
}

const FilterPanel = ({ onFilterChange, initialFilters }: FilterPanelProps) => {
  const [boardingQuery, setBoardingQuery] = useState('');
  const [selectedBoardingId, setSelectedBoardingId] = useState<string | undefined>(
    initialFilters?.boarding_stop_id
  );
  const [selectedBoardingName, setSelectedBoardingName] = useState('');

  const [alightingQuery, setAlightingQuery] = useState('');
  const [selectedAlightingId, setSelectedAlightingId] = useState<string | undefined>(
    initialFilters?.alighting_stop_id
  );
  const [selectedAlightingName, setSelectedAlightingName] = useState('');

  const [selectedDate, setSelectedDate] = useState<string | undefined>(initialFilters?.date);
  const [showBoardingDropdown, setShowBoardingDropdown] = useState(false);
  const [showAlightingDropdown, setShowAlightingDropdown] = useState(false);

  const boardingRef = useRef<HTMLDivElement>(null);
  const alightingRef = useRef<HTMLDivElement>(null);

  const { data: boardingLocations } = useLocations(boardingQuery.length >= 1 ? boardingQuery : undefined);
  const { data: alightingLocations } = useLocations(alightingQuery.length >= 1 ? alightingQuery : undefined);

  // Click-outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boardingRef.current && !boardingRef.current.contains(e.target as Node)) {
        setShowBoardingDropdown(false);
      }
      if (alightingRef.current && !alightingRef.current.contains(e.target as Node)) {
        setShowAlightingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters =
    selectedBoardingId !== undefined ||
    selectedAlightingId !== undefined ||
    selectedDate !== undefined;

  const handleBoardingSelect = (location: Location) => {
    setSelectedBoardingId(location.id);
    setSelectedBoardingName(location.name);
    setBoardingQuery(location.name);
    setShowBoardingDropdown(false);
    onFilterChange({
      boarding_stop_id: location.id,
      alighting_stop_id: selectedAlightingId,
      date: selectedDate,
    });
  };

  const handleAlightingSelect = (location: Location) => {
    setSelectedAlightingId(location.id);
    setSelectedAlightingName(location.name);
    setAlightingQuery(location.name);
    setShowAlightingDropdown(false);
    onFilterChange({
      boarding_stop_id: selectedBoardingId,
      alighting_stop_id: location.id,
      date: selectedDate,
    });
  };

  const handleDateChange = (raw: string) => {
    const value = raw || undefined;
    setSelectedDate(value);
    onFilterChange({
      boarding_stop_id: selectedBoardingId,
      alighting_stop_id: selectedAlightingId,
      date: value,
    });
  };

  const handleClear = () => {
    setBoardingQuery('');
    setSelectedBoardingId(undefined);
    setSelectedBoardingName('');
    setAlightingQuery('');
    setSelectedAlightingId(undefined);
    setSelectedAlightingName('');
    setSelectedDate(undefined);
    onFilterChange({});
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm focus:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const labelClass = 'text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block';

  const renderLocationDropdown = (
    locations: Location[] | undefined,
    show: boolean,
    onSelect: (loc: Location) => void
  ) =>
    show && locations && locations.length > 0 ? (
      <ul className="absolute z-50 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto w-full">
        {locations.map((loc) => (
          <li key={loc.id}>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(loc);
              }}
            >
              {loc.name}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Boarding stop combobox */}
        <div className="relative" ref={boardingRef}>
          <label className={labelClass}>Boarding stop</label>
          <input
            type="text"
            value={boardingQuery}
            placeholder="Search boarding stop…"
            className={inputClass}
            onChange={(e) => {
              setBoardingQuery(e.target.value);
              if (e.target.value !== selectedBoardingName) {
                setSelectedBoardingId(undefined);
              }
              setShowBoardingDropdown(true);
            }}
            onFocus={() => {
              if (boardingQuery.length >= 1) setShowBoardingDropdown(true);
            }}
          />
          {renderLocationDropdown(boardingLocations, showBoardingDropdown, handleBoardingSelect)}
        </div>

        {/* Alighting stop combobox */}
        <div className="relative" ref={alightingRef}>
          <label className={labelClass}>Alighting stop</label>
          <input
            type="text"
            value={alightingQuery}
            placeholder="Search alighting stop…"
            className={inputClass}
            onChange={(e) => {
              setAlightingQuery(e.target.value);
              if (e.target.value !== selectedAlightingName) {
                setSelectedAlightingId(undefined);
              }
              setShowAlightingDropdown(true);
            }}
            onFocus={() => {
              if (alightingQuery.length >= 1) setShowAlightingDropdown(true);
            }}
          />
          {renderLocationDropdown(alightingLocations, showAlightingDropdown, handleAlightingSelect)}
        </div>

        {/* Date picker */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={selectedDate ?? ''}
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
