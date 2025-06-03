import React from 'react';
import { SlidersHorizontal, TrendingUp, Calendar, Star, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';

interface FilterControlsProps {
  sortBy: 'popularity' | 'date-asc' | 'date-desc' | 'rating';
  onSortChange: (sort: 'popularity' | 'date-asc' | 'date-desc' | 'rating') => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  yearFilter: number | null;
  onYearFilterChange: (year: number | null) => void;
}

export function FilterControls({
  sortBy,
  onSortChange,
  minRating,
  onMinRatingChange,
  yearFilter,
  onYearFilterChange,
}: FilterControlsProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Sort By
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSortChange('popularity')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                sortBy === 'popularity'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp size={14} />
              Popularity
            </button>
            <button
              onClick={() => onSortChange('date-desc')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                sortBy === 'date-desc'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ArrowDownNarrowWide size={14} />
              Newest First
            </button>
            <button
              onClick={() => onSortChange('date-asc')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                sortBy === 'date-asc'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ArrowUpNarrowWide size={14} />
              Oldest First
            </button>
            <button
              onClick={() => onSortChange('rating')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                sortBy === 'rating'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star size={14} />
              Rating
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Star size={16} />
            Minimum Rating
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{minRating.toFixed(1)}+ Stars</div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            Filter by Year
          </label>
          <select
            value={yearFilter || ''}
            onChange={(e) => onYearFilterChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}