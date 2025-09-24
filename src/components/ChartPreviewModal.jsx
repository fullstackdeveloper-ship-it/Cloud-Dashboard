import React, { useState, useEffect } from 'react';
import { X, BarChart3 } from 'lucide-react';
import ConfigBasedChart from './ConfigBasedChart';
import { useDateRange } from '../hooks/redux';

const ChartPreviewModal = ({ 
  isOpen, 
  onClose, 
  chartConfig, 
  configName 
}) => {
  const [chartHeight, setChartHeight] = useState(600);
  
  // Get date range functions from Redux
  const { 
    getControllerId
  } = useDateRange();

  // Set chart height based on modal size
  useEffect(() => {
    if (isOpen) {
      setChartHeight(600);
    }
  }, [isOpen]);

  if (!isOpen || !chartConfig) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0097b2] to-[#198c1a] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {chartConfig?.displayName || chartConfig?.name || configName || 'Chart Preview'}
                </h2>
                <p className="text-lg text-gray-600">
                  {chartConfig?.description || 'Preview of chart configuration'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Chart Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <ConfigBasedChart
                configName={configName}
                height={chartHeight}
                refreshInterval={0}
                controllerId={getControllerId()}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-6">
                <span className="font-medium">Config: {configName}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>Charts: {chartConfig?.charts || 0}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>Last Updated: {new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-600">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPreviewModal;