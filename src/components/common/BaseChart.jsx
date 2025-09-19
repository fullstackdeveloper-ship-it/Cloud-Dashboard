import React from 'react';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const BaseChart = ({ 
  children,
  className = "",
  title,
  subtitle,
  isLoading = false,
  error = null,
  data = [],
  onRetry = null,
  loadingMessage = "Loading chart data...",
  loadingSubMessage = "Fetching latest information",
  emptyMessage = "No data available",
  emptySubMessage = "No data found for the selected time range",
  showTitle = true,
  showSubtitle = true
}) => {
  return (
    <div className={`${className} hover:shadow-2xl transition-all duration-500 group`}>
      {/* Chart Header */}
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
              {title}
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0097b2]"></div>
            )}
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full mt-2" />
          {showSubtitle && subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      {/* Chart Content */}
      <div className="h-[320px] relative">
        {isLoading ? (
          <LoadingState 
            message={loadingMessage}
            subMessage={loadingSubMessage}
            size="large"
          />
        ) : error ? (
          <ErrorState 
            error={error}
            onRetry={onRetry}
            title="Error loading chart data"
          />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-semibold">{emptyMessage}</p>
              <p className="text-sm">{emptySubMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0097b2]/5 via-transparent to-[#198c1a]/5 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
};

export default BaseChart;
