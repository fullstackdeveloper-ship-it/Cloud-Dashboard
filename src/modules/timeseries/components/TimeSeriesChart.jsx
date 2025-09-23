/**
 * Main time series chart component
 * Renders interactive charts using Plotly.js with configuration-driven setup
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { transformConfigToPlotly, updateTraceData } from '../utils/plotlyTransformer';
import { validateConfig, validateData } from '../utils/configValidator';
import { formatTime } from '../utils/dateHelpers';
import './TimeSeriesChart.css';

const TimeSeriesChart = ({ 
  config, 
  data, 
  realTime = false, 
  onError, 
  onAlert,
  debug = false 
}) => {
  const [plotlyData, setPlotlyData] = useState(null);
  const [plotlyLayout, setPlotlyLayout] = useState(null);
  const [plotlyConfig, setPlotlyConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Validate configuration and data
  const validation = useMemo(() => {
    if (!config) return { isValid: true, errors: [], warnings: [] }; // Don't treat missing config as error initially
    
    const configValidation = validateConfig(config);
    const dataValidation = data ? validateData(data, config) : { isValid: true, errors: [], warnings: [] };
    
    return {
      isValid: configValidation.isValid && dataValidation.isValid,
      errors: [...configValidation.errors, ...dataValidation.errors],
      warnings: [...configValidation.warnings, ...dataValidation.warnings]
    };
  }, [config, data]);

  // Transform configuration to Plotly format
  const transformToPlotly = useCallback(() => {
    if (!config || !data || !validation.isValid) {
      console.log('Skipping transformation:', { config: !!config, data: !!data, validationValid: validation.isValid });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting Plotly transformation with:', { config, data: data.length, validation });
      const plotlyConfig = transformConfigToPlotly(config, data);
      console.log('Plotly transformation result:', plotlyConfig);
      
      setPlotlyData(plotlyConfig.data);
      setPlotlyLayout(plotlyConfig.layout);
      setPlotlyConfig(plotlyConfig.config);

      if (debug) {
        console.log('Plotly Configuration:', plotlyConfig);
      }
    } catch (err) {
      const errorMessage = `Failed to transform configuration: ${err.message}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
      console.error('Plotly transformation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [config, data, validation.isValid, onError, debug]);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    if (!config || !config.alerts || !data || data.length === 0) return;

    const latestData = data[data.length - 1];
    const newAlerts = [];

    config.alerts.forEach(alert => {
      try {
        // Simple condition evaluation (in production, use a proper expression parser)
        const condition = alert.condition.replace(/(\w+)/g, (match) => {
          const field = match.toLowerCase();
          if (field in latestData) {
            return latestData[field];
          }
          return match;
        });

        // Simple condition evaluation without eval
        let conditionMet = false;
        try {
          // Parse simple conditions like "temperature > 35"
          const parts = condition.split(/\s+/);
          if (parts.length === 3) {
            const [left, operator, right] = parts;
            const leftVal = parseFloat(left);
            const rightVal = parseFloat(right);
            
            switch (operator) {
              case '>':
                conditionMet = leftVal > rightVal;
                break;
              case '<':
                conditionMet = leftVal < rightVal;
                break;
              case '>=':
                conditionMet = leftVal >= rightVal;
                break;
              case '<=':
                conditionMet = leftVal <= rightVal;
                break;
              case '==':
              case '===':
                conditionMet = leftVal === rightVal;
                break;
              case '!=':
              case '!==':
                conditionMet = leftVal !== rightVal;
                break;
              default:
                conditionMet = false;
            }
          }
        } catch (err) {
          console.warn('Failed to parse alert condition:', alert.condition, err);
          conditionMet = false;
        }

        if (conditionMet) {
          newAlerts.push({
            ...alert,
            timestamp: Date.now(),
            data: latestData
          });
        }
      } catch (err) {
        console.warn('Failed to evaluate alert condition:', alert.condition, err);
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      if (onAlert) {
        newAlerts.forEach(alert => onAlert(alert));
      }
    }
  }, [config, data, onAlert]);

  // Note: Data updates are handled by re-running the full transformation
  // This prevents infinite loops that can occur with partial updates

  // Initial transformation
  useEffect(() => {
    transformToPlotly();
  }, [transformToPlotly]);

  // Check alerts when data updates
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  // Real-time updates
  useEffect(() => {
    if (!realTime || !config || !config.refresh?.enabled) return;

    const interval = setInterval(() => {
      // This would typically fetch new data from an API
      // For now, we'll just re-trigger the transformation
      transformToPlotly();
    }, config.refresh.interval || 5000);

    return () => clearInterval(interval);
  }, [realTime, config, transformToPlotly]);

  // Handle plot events
  const handlePlotClick = (event) => {
    if (debug) {
      console.log('Plot clicked:', event);
    }
  };

  const handlePlotHover = (event) => {
    if (debug) {
      console.log('Plot hover:', event);
    }
  };

  const handlePlotRelayout = (event) => {
    if (debug) {
      console.log('Plot relayout:', event);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="chart-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  // Render empty state for no config
  if (!config) {
    return (
      <div className="chart-container empty">
        <div className="empty-message">
          <h3>No Configuration</h3>
          <p>Please select a configuration to display the chart</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !validation.isValid) {
    return (
      <div className="chart-container error">
        <div className="error-message">
          <h3>Chart Error</h3>
          <p>{error || validation.errors?.join(', ') || 'Unknown error'}</p>
          {validation.warnings?.length > 0 && (
            <div className="warnings">
              <h4>Warnings:</h4>
              <ul>
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty">
        <div className="empty-message">
          <h3>No Data Available</h3>
          <p>Please load data to display the chart</p>
        </div>
      </div>
    );
  }

  // Render chart
  return (
    <div className="chart-container">
      {alerts.length > 0 && (
        <div className="alerts-panel">
          <h4>Active Alerts</h4>
          {alerts.slice(-5).map((alert, index) => (
            <div key={index} className={`alert alert-${alert.severity}`}>
              <span className="alert-time">{formatTime(alert.timestamp)}</span>
              <span className="alert-message">{alert.message}</span>
            </div>
          ))}
        </div>
      )}
      
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={plotlyConfig}
        style={{ width: '100%', height: '100%' }}
        onInitialized={(figure, graphDiv) => {
          if (debug) {
            console.log('Plot initialized:', figure);
          }
        }}
        onUpdate={(figure, graphDiv) => {
          if (debug) {
            console.log('Plot updated:', figure);
          }
        }}
        onPurge={(figure, graphDiv) => {
          if (debug) {
            console.log('Plot purged:', figure);
          }
        }}
        onError={(err) => {
          console.error('Plotly error:', err);
          setError(`Plotly error: ${err.message}`);
        }}
        onClick={handlePlotClick}
        onHover={handlePlotHover}
        onRelayout={handlePlotRelayout}
      />
      
      {debug && (
        <div className="debug-panel">
          <h4>Debug Information</h4>
          <div className="debug-info">
            <p><strong>Data Points:</strong> {data?.length || 0}</p>
            <p><strong>Series:</strong> {config?.series?.length || 0}</p>
            <p><strong>Y-Axes:</strong> {config?.axes?.y?.length || 0}</p>
            <p><strong>Real-time:</strong> {realTime ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Refresh Interval:</strong> {config?.refresh?.interval || 'N/A'}ms</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesChart;
