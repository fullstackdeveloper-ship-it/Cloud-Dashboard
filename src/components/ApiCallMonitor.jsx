import React, { useState, useEffect } from 'react';
import apiCallManager from '../services/apiCallManager';

const ApiCallMonitor = () => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiCallManager.getCallStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50"
      >
        API Monitor
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">API Call Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {stats && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Active Calls:</span>
            <span className={`font-medium ${stats.activeCalls > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {stats.activeCalls}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total History:</span>
            <span className="font-medium text-gray-800">{stats.totalHistory}</span>
          </div>
          
          {stats.recentCalls.length > 0 && (
            <div>
              <div className="text-gray-600 mb-1">Recent Calls:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {stats.recentCalls.map((call, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className={`font-medium ${call.success ? 'text-green-600' : 'text-red-600'}`}>
                        {call.success ? '✅' : '❌'}
                      </span>
                      <span className="text-gray-500">{call.duration}ms</span>
                    </div>
                    <div className="text-gray-600 truncate">{call.key}</div>
                    {call.error && (
                      <div className="text-red-500 text-xs">{call.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              apiCallManager.cancelAllCalls();
              setStats(apiCallManager.getCallStats());
            }}
            className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
          >
            Cancel All Calls
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiCallMonitor;
