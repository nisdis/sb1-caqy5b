import React from 'react';
import { History, X, Clock, MapPin } from 'lucide-react';
import type { RouteHistoryItem } from '../services/routeHistoryService';
import { clearRouteHistory } from '../services/routeHistoryService';

interface RouteHistoryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  history: RouteHistoryItem[];
  onSelectRoute: (route: RouteHistoryItem) => void;
}

export function RouteHistoryPanel({ 
  isVisible, 
  onClose, 
  history,
  onSelectRoute 
}: RouteHistoryPanelProps) {
  if (!isVisible) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all route history?')) {
      clearRouteHistory();
      onClose();
    }
  };

  return (
    <div className="absolute right-4 top-24 bg-white rounded-lg shadow-lg p-4 w-96 max-h-[calc(100vh-120px)] overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Route History</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-600 hover:text-red-700 transition-colors"
            disabled={history.length === 0}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No routes in history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectRoute(item)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="truncate font-medium text-gray-900">
                      {item.origin.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div className="truncate font-medium text-gray-900">
                      {item.destination.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}