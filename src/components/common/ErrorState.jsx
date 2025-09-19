import React from 'react';

const ErrorState = ({ 
  error, 
  onRetry = null,
  title = "Error loading data",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <div className="text-center text-red-600">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-sm mt-1 text-gray-600">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
