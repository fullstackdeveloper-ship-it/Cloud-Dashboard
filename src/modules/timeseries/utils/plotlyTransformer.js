/**
 * Transforms configuration JSON to Plotly.js format
 * Converts dashboard configuration to Plotly traces and layout
 */

import moment from 'moment';

/**
 * Get appropriate tick format based on date range
 * @param {string|Date} startDate - Start date in ISO format or Date object
 * @param {string|Date} endDate - End date in ISO format or Date object
 * @returns {string} Plotly tick format string
 */
export const getTickFormatByRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) {
    return '%H:%M:%S';  // Less than 1 day: show time only
  } else if (diffDays <= 7) {
    return '%b %d %H:%M';  // 1-7 days: show date and hour
  } else {
    return '%Y-%m-%d';  // More than 7 days: show only date
  }
};

/**
 * Get appropriate tick interval based on date range
 * @param {string|Date} startDate - Start date in ISO format or Date object
 * @param {string|Date} endDate - End date in ISO format or Date object
 * @returns {number} Tick interval in milliseconds
 */
export const getTickInterval = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) {
    return 15 * 60 * 1000;  // 15 minutes for less than 1 day
  } else if (diffDays <= 7) {
    return 6 * 60 * 60 * 1000;  // 6 hours for 1-7 days
  } else {
    return 24 * 60 * 60 * 1000;  // 1 day for more than 7 days
  }
};

export const transformConfigToPlotly = (config, data) => {
  const traces = [];
  const layout = createLayout(config, data);
  
  // Transform series to traces
  if (config.series && Array.isArray(config.series)) {
    config.series.forEach((series, index) => {
      const trace = createTrace(series, data, config);
      if (trace) {
        traces.push(trace);
      }
    });
  }

  // Threshold lines disabled to prevent extra invisible lines
  // if (config.thresholds && Array.isArray(config.thresholds)) {
  //   config.thresholds.forEach(threshold => {
  //     const thresholdTrace = createThresholdTrace(threshold, data, config);
  //     if (thresholdTrace) {
  //       traces.push(thresholdTrace);
  //     }
  //   });
  // }

  const result = {
    data: traces,
    layout,
    config: {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      responsive: true
    }
  };
  
  console.log('Final Plotly result:', result);
  console.log('Number of traces:', traces.length);
  // traces.forEach((trace, index) => {
  //   console.log(`Trace ${index}:`, trace);
  // });
  
  return result;
};

const createLayout = (config, data) => {
  const layout = {
    title: {
      text: config.panel?.title || 'Time Series Chart',
      font: { size: 16 }
    },
    showlegend: config.legend?.enabled !== false,
    legend: {
      orientation: config.legend?.orientation === 'vertical' ? 'v' : 'h',
      x: getLegendXPosition(config.legend?.placement || config.legend?.position),
      y: getLegendYPosition(config.legend?.placement || config.legend?.position),
      xanchor: 'center',
      yanchor: 'middle',
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#ccc',
      borderwidth: 1
    },
    margin: { t: 60, r: 60, b: 60, l: 60 },
    plot_bgcolor: config.panel?.backgroundColor || '#ffffff',
    paper_bgcolor: config.panel?.backgroundColor || '#ffffff',
    font: { color: '#333333' },
    hovermode: config.tooltip?.hoverMode || 'closest',
    hoverdistance: config.tooltip?.hoverProximity || 20,
    spikedistance: config.tooltip?.spikeDistance || 1000,
    spikecolor: config.tooltip?.spikeColor || '#000000',
    spikethickness: config.tooltip?.spikeThickness || 1,
    spikemode: config.tooltip?.spikeMode || 'across',
    showspikes: config.tooltip?.showSpikes || false,
    hoverlabel: {
      bgcolor: config.tooltip?.backgroundColor || 'rgba(255, 255, 255, 0.95)',
      bordercolor: config.tooltip?.borderColor || '#ccc',
      font: { 
        color: config.tooltip?.fontColor || '#333',
        size: config.tooltip?.fontSize || 13,
        family: config.tooltip?.fontFamily || 'Arial, sans-serif'
      },
      namelength: config.tooltip?.nameLength || 0,
      align: config.tooltip?.align || 'left'
    },
    dragmode: config.chart?.dragMode || 'pan',
    selectdirection: config.chart?.selectDirection || 'diagonal'
  };

  // Configure x-axis with dynamic time formatting
  const isToday = data && data.length > 0 && isDataFromToday(data);
  console.log('Data date check:', { isToday, dataLength: data?.length, firstDataPoint: data?.[0] });
  
  // Dynamic time format based on date range
  let timeFormat;
  let tickInterval;
  
  if (config.axes?.x?.tickFormat) {
    // Use explicit format from config
    timeFormat = config.axes?.x?.tickFormat;
    tickInterval = config.axes?.x?.dtick;
  } else if (config.axes?.x?.format) {
    // Convert common format patterns to Plotly format
    timeFormat = config.axes?.x?.format
      .replace(/HH/g, '%H')
      .replace(/mm/g, '%M')
      .replace(/ss/g, '%S')
      .replace(/dd/g, '%d')
      .replace(/MM/g, '%m')
      .replace(/yyyy/g, '%Y')
      .replace(/yy/g, '%y');
    tickInterval = config.axes?.x?.dtick;
  } else {
    // Use the complete date range from the data, not just first/last points
    if (data && data.length > 0) {
      // Get all timestamps and find the actual min/max
      const allTimestamps = data.map(item => new Date(item.timestamp || item.time).getTime());
      const minTimestamp = Math.min(...allTimestamps);
      const maxTimestamp = Math.max(...allTimestamps);
      
      const firstTime = new Date(minTimestamp).toISOString();
      const lastTime = new Date(maxTimestamp).toISOString();
      
      // Use helper functions for consistent formatting
      timeFormat = getTickFormatByRange(firstTime, lastTime);
      tickInterval = getTickInterval(firstTime, lastTime);
      
      // Calculate actual time difference for debugging
      const actualDiffMs = maxTimestamp - minTimestamp;
      const actualDiffDays = actualDiffMs / (1000 * 60 * 60 * 24);
      
      console.log('Dynamic time format calculation (using full range):', {
        firstTime,
        lastTime,
        actualDiffDays: actualDiffDays.toFixed(2),
        calculatedFormat: timeFormat,
        calculatedInterval: tickInterval,
        dataLength: data.length,
        minTimestamp: new Date(minTimestamp).toISOString(),
        maxTimestamp: new Date(maxTimestamp).toISOString()
      });
    } else {
      // Fallback for no data
      timeFormat = isToday ? '%H:%M:%S' : '%Y-%m-%d';
      tickInterval = isToday ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;
    }
  }
  console.log('Using time format:', timeFormat, 'with interval:', tickInterval);
  
  // Set x-axis range to show only the selected time range
  let xAxisRange = undefined;
  if (data && data.length > 0) {
    // Use the same min/max approach as tick formatting
    const allTimestamps = data.map(item => new Date(item.timestamp || item.time).getTime());
    const minTimestamp = Math.min(...allTimestamps);
    const maxTimestamp = Math.max(...allTimestamps);
    
    const firstTime = new Date(minTimestamp);
    const lastTime = new Date(maxTimestamp);
    xAxisRange = [firstTime, lastTime];
    console.log('Setting x-axis range (using full range):', { 
      firstTime: firstTime.toISOString(), 
      lastTime: lastTime.toISOString() 
    });
  }

  layout.xaxis = {
    type: 'date', // Force date type for proper formatting
    title: config.axes?.x?.title || 'Time',
    showgrid: config.axes?.x?.showGrid !== false,
    gridcolor: config.axes?.x?.gridColor || '#e0e0e0',
    gridwidth: config.axes?.x?.gridWidth || 1,
    zeroline: config.axes?.x?.showZeroLine || false,
    zerolinecolor: config.axes?.x?.zeroLineColor || '#ccc',
    zerolinewidth: config.axes?.x?.zeroLineWidth || 1,
    showline: config.axes?.x?.showBorder !== false,
    linecolor: config.axes?.x?.color === 'text' ? '#333333' : (config.axes?.x?.color || '#d0d0d0'),
    linewidth: config.axes?.x?.lineWidth || 1,
    tickformat: timeFormat,
    hoverformat: config.axes?.x?.hoverFormat || '%Y-%m-%d %H:%M',
    range: xAxisRange, // Set range to show only selected time period
    dtick: tickInterval,
    tick0: config.axes?.x?.tick0 || (isToday ? undefined : data?.[0]?.timestamp || data?.[0]?.time),
    tickmode: config.axes?.x?.tickMode || 'auto',
    nticks: config.axes?.x?.nTicks || 10,
    showticklabels: config.axes?.x?.showTickLabels !== false,
    tickangle: config.axes?.x?.tickAngle || 0,
    tickfont: { 
      size: config.axes?.x?.tickFontSize || 12,
      color: config.axes?.x?.tickFontColor || '#333'
    },
    titlefont: { 
      size: config.axes?.x?.titleFontSize || 14,
      color: config.axes?.x?.titleFontColor || '#333'
    },
    rangeslider: { visible: config.axes?.x?.rangeSlider || false },
    rangeselector: { visible: config.axes?.x?.rangeSelector || false },
    fixedrange: config.axes?.x?.fixedRange || false
  };

  // Configure y-axes
  if (config.axes?.y && Array.isArray(config.axes.y)) {
    config.axes.y.forEach((yAxis, index) => {
      const axisKey = index === 0 ? 'yaxis' : `yaxis${index + 1}`;
      layout[axisKey] = {
        title: yAxis.title || `Y-Axis ${index + 1}`,
        showgrid: yAxis.showGrid !== false,
        gridcolor: yAxis.gridColor || '#e0e0e0',
        gridwidth: yAxis.gridWidth || 1,
        zeroline: yAxis.zeroline || yAxis.centeredZero || false,
        zerolinecolor: yAxis.zerolinecolor || '#ccc',
        zerolinewidth: yAxis.zerolinewidth || 1,
        showline: yAxis.showBorder !== false,
        linecolor: yAxis.color === 'text' ? '#333333' : (yAxis.color || '#d0d0d0'),
        linewidth: yAxis.lineWidth || 1,
        side: yAxis.side || 'left',
        type: yAxis.scale === 'log' ? 'log' : 'linear',
        tickmode: yAxis.tickMode || 'auto',
        nticks: yAxis.nTicks || 10,
        showticklabels: yAxis.showTickLabels !== false,
        tickangle: yAxis.tickAngle || 0,
        tickfont: { 
          size: yAxis.tickFontSize || 12,
          color: yAxis.tickFontColor || '#333'
        },
        titlefont: { 
          size: yAxis.titleFontSize || 14,
          color: yAxis.titleFontColor || '#333'
        },
        fixedrange: yAxis.fixedRange || false
      };

      if (yAxis.min !== undefined || yAxis.softMin !== undefined) {
        const min = yAxis.softMin !== undefined ? yAxis.softMin : yAxis.min;
        const max = yAxis.softMax !== undefined ? yAxis.softMax : yAxis.max;
        layout[axisKey].range = [min, max || 'auto'];
      }
      if (yAxis.scale === 'log' || yAxis.logScale) {
        layout[axisKey].type = 'log';
      }
    });
  }

  // Add annotations
  if (config.annotations && Array.isArray(config.annotations)) {
    layout.annotations = config.annotations.map(annotation => 
      createAnnotation(annotation, config)
    );
  }

  return layout;
};

const createTrace = (series, data, config) => {
  if (!data || data.length === 0) {
    console.log('No data provided to createTrace for series:', series.name);
    return null;
  }

  const xData = data.map(item => {
    const timestamp = item.timestamp || item.time;
    // Keep as Date objects for proper formatting
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp);
    } else {
      return timestamp;
    }
  });
  const yData = data.map(item => {
    const value = item[series.dataField];
    return value !== undefined && value !== null ? value : null;
  });

  console.log(`Creating trace for ${series.name}:`, {
    dataField: series.dataField,
    xDataLength: xData.length,
    yDataLength: yData.length,
    firstX: xData[0],
    firstXType: typeof xData[0],
    firstY: yData[0],
    lastX: xData[xData.length - 1],
    lastY: yData[yData.length - 1],
    zeroValues: yData.filter(val => val === 0).length,
    nullValues: yData.filter(val => val === null).length
  });

  const trace = {
    x: xData,
    y: yData,
    type: series.type || 'scatter',
    mode: series.mode || 'lines+markers',
    name: series.displayName || series.name || 'Series',
    yaxis: series.yAxis !== undefined ? `y${series.yAxis + 1}` : 'y',
    line: {
      color: series.color || '#1f77b4',
      width: series.lineWidth || 2,
      dash: getLineDash(series.lineStyle),
      shape: getLineInterpolation(series.lineInterpolation)
    },
    marker: {
      size: series.markerSize || 6,
      color: series.color || '#1f77b4',
      symbol: getMarkerSymbol(series.markerStyle),
      line: {
        width: series.markerLineWidth || 2,
        color: series.markerLineColor || series.color || '#1f77b4'
      },
      opacity: series.fillOpacity || 1,
      showscale: false
    },
    hovertemplate: series.hovertemplate || '',
    hoverinfo: series.hoverinfo || 'none',
    hoverlabel: {
      bgcolor: series.hoverBackgroundColor || config.tooltip?.backgroundColor || 'rgba(255, 255, 255, 0.95)',
      bordercolor: series.hoverBorderColor || config.tooltip?.borderColor || '#ccc',
      font: { 
        color: series.hoverFontColor || config.tooltip?.fontColor || '#333',
        size: series.hoverFontSize || config.tooltip?.fontSize || 13,
        family: series.hoverFontFamily || config.tooltip?.fontFamily || 'Arial, sans-serif'
      },
      namelength: series.hoverNameLength || config.tooltip?.nameLength || 0,
      align: series.hoverAlign || config.tooltip?.align || 'left'
    },
    hoveron: 'points',
    hoverdistance: config.tooltip?.hoverProximity || 20,
    showlegend: series.showLegend !== false,
    visible: series.visible !== false
  };

  // Configure line style
  if (series.lineStyle === 'dash') {
    trace.line.dash = 'dash';
  } else if (series.lineStyle === 'dot') {
    trace.line.dash = 'dot';
  } else if (series.lineStyle === 'dashdot') {
    trace.line.dash = 'dashdot';
  }

  // Configure fill for area charts
  if (series.type === 'area' || series.fill) {
    trace.fill = series.fill || 'tozeroy';
    trace.opacity = series.opacity || 0.3;
  }

  // Configure bar charts
  if (series.type === 'bar') {
    trace.opacity = series.opacity || 0.7;
  }

  return trace;
};

// Helper function to check if data is from today
const isDataFromToday = (data) => {
  if (!data || data.length === 0) return false;
  
  const today = moment().format('YYYY-MM-DD');
  const firstDataPoint = data[0];
  const dataDate = moment(firstDataPoint.time || firstDataPoint.timestamp).format('YYYY-MM-DD');
  
  console.log('Date comparison:', { today, dataDate, isToday: dataDate === today });
  return dataDate === today;
};

// Helper functions for comprehensive configuration
const getLineDash = (lineStyle) => {
  switch (lineStyle) {
    case 'dash': return 'dash';
    case 'dot': return 'dot';
    case 'dashdot': return 'dashdot';
    case 'solid': 
    default: return 'solid';
  }
};

const getLineInterpolation = (interpolation) => {
  switch (interpolation) {
    case 'smooth': return 'spline';
    case 'step-before': return 'hv';
    case 'step-after': return 'vh';
    case 'linear':
    default: return 'linear';
  }
};

const getMarkerSymbol = (markerStyle) => {
  switch (markerStyle) {
    case 'circle': return 'circle';
    case 'square': return 'square';
    case 'diamond': return 'diamond';
    case 'triangle-up': return 'triangle-up';
    case 'triangle-down': return 'triangle-down';
    case 'cross': return 'cross';
    case 'x': return 'x';
    default: return 'circle';
  }
};

// createThresholdTrace function removed to prevent extra invisible lines

const createAnnotation = (annotation, config) => {
  const baseAnnotation = {
    text: annotation.label || '',
    font: { color: annotation.color || '#000000' }
  };

  if (annotation.type === 'line') {
    return {
      ...baseAnnotation,
      x: annotation.time,
      y: 1,
      xref: 'x',
      yref: 'paper',
      showarrow: true,
      arrowhead: 2,
      arrowcolor: annotation.color || '#000000',
      ax: 0,
      ay: -40
    };
  } else if (annotation.type === 'range') {
    return {
      ...baseAnnotation,
      x: annotation.startTime,
      xref: 'x',
      y: 0,
      yref: 'paper',
      y1: 1,
      bgcolor: annotation.color || '#000000',
      opacity: annotation.opacity || 0.3,
      showarrow: false
    };
  }

  return baseAnnotation;
};

const getLegendXPosition = (placement) => {
  switch (placement) {
    case 'left': return 0.02;
    case 'right': return 0.98;
    case 'top': return 0.5;
    case 'bottom': return 0.5;
    default: return 0.5;
  }
};

const getLegendYPosition = (placement) => {
  switch (placement) {
    case 'left': return 0.5;
    case 'right': return 0.5;
    case 'top': return 1.02;
    case 'bottom': return -0.1;
    default: return -0.1;
  }
};

export const updateTraceData = (traces, newData, seriesConfig) => {
  if (!seriesConfig || !newData) return traces;
  
  return traces.map(trace => {
    if (trace.name === seriesConfig.name) {
      const xData = newData.map(item => item.timestamp || item.time);
      const yData = newData.map(item => item[seriesConfig.dataField] || null);
      
      return {
        ...trace,
        x: xData,
        y: yData
      };
    }
    return trace;
  });
};

export const addNewTrace = (traces, seriesConfig, data) => {
  if (!seriesConfig || !data) return traces;
  
  const newTrace = createTrace(seriesConfig, data, {});
  if (newTrace) {
    return [...traces, newTrace];
  }
  return traces;
};
