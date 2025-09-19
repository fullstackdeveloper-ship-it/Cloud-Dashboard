import React from 'react';

const LoadingState = ({ 
  message = "Loading data...", 
  subMessage = "Please wait while we fetch the latest information",
  size = "large",
  className = ""
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8", 
    large: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xl: "text-xl"
  };

  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-[#0097b2] mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
        {subMessage && (
          <p className={`text-sm text-gray-500 mt-1 ${textSizeClasses[size] === 'text-sm' ? 'text-xs' : ''}`}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
