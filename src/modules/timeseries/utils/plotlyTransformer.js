/**
 * Transforms configuration JSON to Plotly.js format
 * Converts dashboard configuration to Plotly traces and layout
 */

import moment from 'moment';

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
    hovermode: config.tooltip?.mode || 'closest',
    hoverdistance: config.tooltip?.hoverProximity || 20,
    spikedistance: 1000,
    spikecolor: '#000000',
    spikethickness: 1,
    spikemode: 'across',
    showspikes: true
  };

  // Configure x-axis with dynamic time formatting
  const isToday = data && data.length > 0 && isDataFromToday(data);
  console.log('Data date check:', { isToday, dataLength: data?.length, firstDataPoint: data?.[0] });
  const timeFormat = isToday ? '%H:%M' : '%Y-%m-%d %H:%M';
  console.log('Using time format:', timeFormat);
  
  layout.xaxis = {
    type: 'date',
    title: config.axes?.x?.title || 'Time',
    showgrid: config.axes?.x?.gridLines !== false,
    gridcolor: '#e0e0e0',
    zeroline: false,
    showline: config.axes?.x?.showBorder !== false,
    linecolor: config.axes?.x?.color === 'text' ? '#333333' : (config.axes?.x?.color || '#d0d0d0'),
    tickformat: timeFormat,
    dtick: isToday ? 3600000 : 86400000, // 1 hour for today, 1 day for other dates
    tick0: isToday ? undefined : data?.[0]?.timestamp || data?.[0]?.time,
    tickmode: 'auto',
    nticks: 10,
    showticklabels: true,
    tickangle: 0,
    tickfont: { size: 12 },
    titlefont: { size: 14 }
  };

  // Configure y-axes
  if (config.axes?.y && Array.isArray(config.axes.y)) {
    config.axes.y.forEach((yAxis, index) => {
      const axisKey = index === 0 ? 'yaxis' : `yaxis${index + 1}`;
      layout[axisKey] = {
        title: yAxis.title || `Y-Axis ${index + 1}`,
        showgrid: yAxis.gridLines !== false,
        gridcolor: '#e0e0e0',
        zeroline: yAxis.centeredZero || false,
        showline: yAxis.showBorder !== false,
        linecolor: yAxis.color === 'text' ? '#333333' : (yAxis.color || '#d0d0d0'),
        side: yAxis.side || 'left',
        type: yAxis.scale === 'log' ? 'log' : 'linear',
        tickmode: 'auto',
        nticks: 10,
        showticklabels: true,
        tickangle: 0,
        tickfont: { size: 12 },
        titlefont: { size: 14 },
        fixedrange: false
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
    // Convert to milliseconds if it's not already
    return typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  });
  const yData = data.map(item => item[series.dataField] || null);

  console.log(`Creating trace for ${series.name}:`, {
    dataField: series.dataField,
    xDataLength: xData.length,
    yDataLength: yData.length,
    firstX: xData[0],
    firstY: yData[0],
    lastX: xData[xData.length - 1],
    lastY: yData[yData.length - 1]
  });

  const trace = {
    x: xData,
    y: yData,
    type: series.type || 'line',
    name: series.displayName || series.name || 'Series',
    yaxis: series.yAxis !== undefined ? `y${series.yAxis + 1}` : 'y',
    line: {
      color: series.color || '#1f77b4',
      width: series.lineWidth || 2,
      dash: getLineDash(series.lineStyle),
      shape: getLineInterpolation(series.lineInterpolation)
    },
    marker: {
      size: series.markerSize || 4,
      color: series.color || '#1f77b4',
      symbol: getMarkerSymbol(series.markerStyle),
      line: {
        width: series.markerLineWidth || 1,
        color: series.markerLineColor || series.color || '#1f77b4'
      },
      opacity: series.fillOpacity || 1
    },
    hovertemplate: config.tooltip?.hovertemplate || 
      `<b>%{fullData.name}</b><br>` +
      `Time: %{x}<br>` +
      `Value: %{y:,.0f}<br>` +
      `<extra></extra>`,
    hoverinfo: config.tooltip?.hoverinfo || 'x+y+text',
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
