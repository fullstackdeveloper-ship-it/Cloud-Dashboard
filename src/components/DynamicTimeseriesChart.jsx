/**
 * Dynamic Timeseries Chart Component
 * Simple component that loads config and data files to create charts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import { transformConfigToPlotly } from '../modules/timeseries/utils/plotlyTransformer';
import { validateConfig } from '../modules/timeseries/utils/configValidator';

const DynamicTimeseriesChart = ({ 
  configPath,           // Path to config file (e.g., 'energy-monitoring')
  dataPath,            // Path to data file (e.g., 'energy-monitoring-data')
  className = "",      // CSS classes
  height = 400         // Chart height
}) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [plotlyData, setPlotlyData] = useState(null);
  const [plotlyLayout, setPlotlyLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const chartRef = useRef(null);

  // Load configuration file
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch(`/configs/${configPath}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const configData = await response.json();
      
      // Validate config
      const validation = validateConfig(configData);
      if (!validation.isValid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }
      
      setConfig(configData);
    } catch (err) {
      setError(`Config Error: ${err.message}`);
      console.error('Config loading error:', err);
    }
  }, [configPath]);

  // Load data file
  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`/data/${dataPath}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const dataArray = await response.json();
      
      // Transform data to chart format
      const transformedData = dataArray.map(item => ({
        timestamp: new Date(item.time || item.timestamp).getTime(),
        time: item.time || item.timestamp,
        ...item
      }));
      
      setData(transformedData);
    } catch (err) {
      setError(`Data Error: ${err.message}`);
      console.error('Data loading error:', err);
    }
  }, [dataPath]);

  // Transform to Plotly format
  const transformToPlotly = useCallback(() => {
    if (!config || !data || data.length === 0) return;

    try {
      const plotlyConfig = transformConfigToPlotly(config, data);
      setPlotlyData(plotlyConfig.data);
      setPlotlyLayout(plotlyConfig.layout);
    } catch (err) {
      setError(`Transform Error: ${err.message}`);
      console.error('Plotly transformation error:', err);
    }
  }, [config, data]);

  // Handle hover events for custom tooltip
  const handleHover = useCallback((event) => {
    if (!event.points || event.points.length === 0) {
      return;
    }

    const point = event.points[0];
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const tooltipData = {
      x: point.x,
      y: point.y,
      text: point.text || `${point.data.name}: ${point.y}`,
      color: point.data.line?.color || point.data.marker?.color || '#1f77b4',
      name: point.data.name,
      xLabel: new Date(point.x).toLocaleString(),
      yLabel: point.y.toLocaleString()
    };

    setTooltip({
      ...tooltipData,
      position: {
        x: event.event.clientX - rect.left,
        y: event.event.clientY - rect.top
      }
    });
  }, []);

  // Handle unhover events
  const handleUnhover = useCallback(() => {
    setTooltip(null);
  }, []);

  // Load everything on mount
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([loadConfig(), loadData()]);
      setIsLoading(false);
    };
    
    loadAll();
  }, [loadConfig, loadData]);

  // Transform when config and data are ready
  useEffect(() => {
    if (config && data && data.length > 0) {
      transformToPlotly();
    }
  }, [config, data, transformToPlotly]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198c1a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold mb-2">Chart Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!config || !data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <h3 className="text-lg font-semibold mb-2">No Data</h3>
          <p className="text-sm">Please provide valid config and data files</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`} style={{ height }}>
      <div ref={chartRef} className="w-full h-full">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          style={{ width: '100%', height: '100%' }}
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            staticPlot: false
          }}
          onHover={handleHover}
          onUnhover={handleUnhover}
        />
      </div>
      
      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
          style={{
            left: Math.min(tooltip.position.x + 10, window.innerWidth - 200),
            top: Math.max(tooltip.position.y - 10, 10),
            transform: 'translateY(-50%)',
            zIndex: 9999
          }}
        >
          <div className="flex items-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2 border-2 border-white shadow-sm"
              style={{ backgroundColor: tooltip.color }}
            ></div>
            <span className="font-bold text-gray-900 text-lg">{tooltip.name}</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Time:</strong> {tooltip.xLabel}</div>
            <div><strong>Value:</strong> {tooltip.yLabel}</div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default DynamicTimeseriesChart;
