/**
 * Example implementation of dynamic Plotly.js tick formatting
 * Shows how to handle date range filtering with automatic tick format updates
 */

import { getTickFormatByRange, getTickInterval } from './plotlyTransformer';

/**
 * Example: Create a Plotly.js time series chart with dynamic tick formatting
 * @param {string} containerId - DOM element ID for the chart
 * @param {Array} data - Time series data
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 */
export const createDynamicTimeSeriesChart = (containerId, data, startDate, endDate) => {
  // Get dynamic tick format and interval
  const tickFormat = getTickFormatByRange(startDate, endDate);
  const tickInterval = getTickInterval(startDate, endDate);
  
  // Prepare data for Plotly
  const plotlyData = data.map(item => ({
    x: new Date(item.timestamp || item.time),
    y: item.value,
    type: 'scatter',
    mode: 'lines+markers',
    name: item.series || 'Data'
  }));
  
  // Create layout with dynamic x-axis configuration
  const layout = {
    title: 'Dynamic Time Series Chart',
    xaxis: {
      type: 'date',  // Important: Use 'date' type, not 'category'
      title: 'Time',
      tickformat: tickFormat,
      dtick: tickInterval,
      tickmode: 'linear',
      showgrid: true,
      gridcolor: '#e0e0e0',
      // Set range to show only the selected time period
      range: [new Date(startDate), new Date(endDate)],
      // Ensure today's data is included
      autorange: false
    },
    yaxis: {
      title: 'Value',
      showgrid: true,
      gridcolor: '#e0e0e0'
    },
    hovermode: 'closest',
    showlegend: true,
    margin: { t: 50, r: 50, b: 50, l: 50 }
  };
  
  // Configuration for better user experience
  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    scrollZoom: true,
    doubleClick: 'reset+autosize'
  };
  
  // Render the chart
  Plotly.newPlot(containerId, plotlyData, layout, config);
  
  console.log('Chart created with:', {
    tickFormat,
    tickInterval,
    startDate,
    endDate,
    dataPoints: data.length
  });
};

/**
 * Example: Update chart when date range filter changes
 * @param {string} containerId - DOM element ID for the chart
 * @param {string} newStartDate - New start date in ISO format
 * @param {string} newEndDate - New end date in ISO format
 */
export const updateChartDateRange = (containerId, newStartDate, newEndDate) => {
  // Get new dynamic tick format and interval
  const tickFormat = getTickFormatByRange(newStartDate, newEndDate);
  const tickInterval = getTickInterval(newStartDate, newEndDate);
  
  // Update layout
  const update = {
    'xaxis.tickformat': tickFormat,
    'xaxis.dtick': tickInterval,
    'xaxis.range': [new Date(newStartDate), new Date(newEndDate)]
  };
  
  // Apply the update
  Plotly.relayout(containerId, update);
  
  console.log('Chart updated with new date range:', {
    tickFormat,
    tickInterval,
    newStartDate,
    newEndDate
  });
};

/**
 * Example: React component integration
 */
export const TimeSeriesChartComponent = ({ data, startDate, endDate, onDateRangeChange }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (data && data.length > 0) {
      createDynamicTimeSeriesChart(chartRef.current, data, startDate, endDate);
    }
  }, [data, startDate, endDate]);
  
  const handleDateRangeChange = (newStart, newEnd) => {
    updateChartDateRange(chartRef.current, newStart, newEnd);
    onDateRangeChange?.(newStart, newEnd);
  };
  
  return (
    <div>
      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
      {/* Date range picker components would go here */}
    </div>
  );
};

/**
 * Example usage with different date ranges
 */
export const exampleUsage = () => {
  // Sample data
  const sampleData = [
    { timestamp: '2025-09-24T07:00:00Z', value: 100 },
    { timestamp: '2025-09-24T08:00:00Z', value: 150 },
    { timestamp: '2025-09-24T09:00:00Z', value: 200 },
    // ... more data points
  ];
  
  // Test different date ranges
  console.log('Less than 1 day:', getTickFormatByRange('2025-09-24T07:00:00Z', '2025-09-24T19:00:00Z'));
  // Output: '%H:%M:%S'
  
  console.log('1-7 days:', getTickFormatByRange('2025-09-24T07:00:00Z', '2025-09-30T07:00:00Z'));
  // Output: '%b %d %H:%M'
  
  console.log('More than 7 days:', getTickFormatByRange('2025-09-17T07:00:00Z', '2025-09-24T07:00:00Z'));
  // Output: '%Y-%m-%d'
};

/**
 * Format examples for different ranges:
 * 
 * Less than 1 day (< 1 day):
 * - Format: '%H:%M:%S'
 * - Example ticks: "07:30:00", "08:00:00", "08:30:00"
 * - Interval: 15 minutes
 * 
 * 1-7 days:
 * - Format: '%b %d %H:%M'
 * - Example ticks: "Sep 24 07:00", "Sep 24 13:00", "Sep 25 07:00"
 * - Interval: 6 hours
 * 
 * More than 7 days:
 * - Format: '%Y-%m-%d'
 * - Example ticks: "2025-09-17", "2025-09-18", "2025-09-19"
 * - Interval: 1 day
 */
