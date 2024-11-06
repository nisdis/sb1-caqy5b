import React from 'react';
import { MapPin } from 'lucide-react';
import type { SearchResult } from '../services/searchService';

interface SearchResultsProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  isLoading: boolean;
}

export function SearchResults({ results, onSelectResult, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg">
        <div className="p-4 text-center text-gray-500">Searching...</div>
      </div>
    );
  }

  if (!results.length) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelectResult(result)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b last:border-b-0 border-gray-100"
        >
          <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-900">{result.name}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{result.displayName}</div>
          </div>
        </button>
      ))}
    </div>
  );
}