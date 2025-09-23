/**
 * Configuration validator for time series dashboard
 * Validates JSON configuration files to ensure they have required fields and valid data types
 */

export const validateConfig = (config) => {
  const errors = [];
  const warnings = [];

  // Validate panel configuration
  if (!config.panel) {
    errors.push('Missing required "panel" configuration');
  } else {
    if (!config.panel.title || typeof config.panel.title !== 'string') {
      errors.push('Panel title is required and must be a string');
    }
    if (config.panel.width && (typeof config.panel.width !== 'number' || config.panel.width <= 0)) {
      errors.push('Panel width must be a positive number');
    }
    if (config.panel.height && (typeof config.panel.height !== 'number' || config.panel.height <= 0)) {
      errors.push('Panel height must be a positive number');
    }
  }

  // Validate axes configuration
  if (!config.axes) {
    errors.push('Missing required "axes" configuration');
  } else {
    if (!config.axes.x) {
      errors.push('Missing required x-axis configuration');
    } else {
      if (config.axes.x.type !== 'time') {
        warnings.push('X-axis type should be "time" for time series charts');
      }
    }

    if (!config.axes.y || !Array.isArray(config.axes.y) || config.axes.y.length === 0) {
      errors.push('At least one y-axis is required');
    } else {
      config.axes.y.forEach((yAxis, index) => {
        if (!yAxis.title || typeof yAxis.title !== 'string') {
          errors.push(`Y-axis ${index} title is required and must be a string`);
        }
        if (yAxis.min !== undefined && (typeof yAxis.min !== 'number' || yAxis.min >= yAxis.max)) {
          errors.push(`Y-axis ${index} min value must be less than max value`);
        }
        if (yAxis.max !== undefined && (typeof yAxis.max !== 'number' || yAxis.max <= yAxis.min)) {
          errors.push(`Y-axis ${index} max value must be greater than min value`);
        }
      });
    }
  }

  // Validate series configuration
  if (!config.series || !Array.isArray(config.series) || config.series.length === 0) {
    errors.push('At least one series is required');
  } else {
    config.series.forEach((series, index) => {
      if (!series.name || typeof series.name !== 'string') {
        errors.push(`Series ${index} name is required and must be a string`);
      }
      if (!series.type || !['line', 'bar', 'area', 'scatter'].includes(series.type)) {
        errors.push(`Series ${index} type must be one of: line, bar, area, scatter`);
      }
      if (series.yAxis !== undefined && (typeof series.yAxis !== 'number' || series.yAxis < 0)) {
        errors.push(`Series ${index} yAxis must be a non-negative number`);
      }
      if (series.yAxis !== undefined && config.axes.y && series.yAxis >= config.axes.y.length) {
        errors.push(`Series ${index} yAxis index is out of range`);
      }
      if (!series.dataField || typeof series.dataField !== 'string') {
        errors.push(`Series ${index} dataField is required and must be a string`);
      }
    });
  }

  // Validate tooltip configuration
  if (config.tooltip) {
    if (config.tooltip.mode && !['single', 'all', 'hidden'].includes(config.tooltip.mode)) {
      errors.push('Tooltip mode must be one of: single, all, hidden');
    }
    if (config.tooltip.sortOrder && !['asc', 'desc'].includes(config.tooltip.sortOrder)) {
      errors.push('Tooltip sortOrder must be one of: asc, desc');
    }
  }

  // Validate legend configuration
  if (config.legend) {
    if (config.legend.placement && !['top', 'bottom', 'left', 'right'].includes(config.legend.placement)) {
      errors.push('Legend placement must be one of: top, bottom, left, right');
    }
    if (config.legend.displayMode && !['list', 'table'].includes(config.legend.displayMode)) {
      errors.push('Legend displayMode must be one of: list, table');
    }
  }

  // Validate thresholds
  if (config.thresholds && Array.isArray(config.thresholds)) {
    config.thresholds.forEach((threshold, index) => {
      if (typeof threshold.value !== 'number') {
        errors.push(`Threshold ${index} value must be a number`);
      }
      if (threshold.yAxis !== undefined && (typeof threshold.yAxis !== 'number' || threshold.yAxis < 0)) {
        errors.push(`Threshold ${index} yAxis must be a non-negative number`);
      }
      if (threshold.yAxis !== undefined && config.axes.y && threshold.yAxis >= config.axes.y.length) {
        errors.push(`Threshold ${index} yAxis index is out of range`);
      }
    });
  }

  // Validate annotations
  if (config.annotations && Array.isArray(config.annotations)) {
    config.annotations.forEach((annotation, index) => {
      if (!annotation.type || !['line', 'range', 'point'].includes(annotation.type)) {
        errors.push(`Annotation ${index} type must be one of: line, range, point`);
      }
      if (annotation.type === 'range' && (!annotation.startTime || !annotation.endTime)) {
        errors.push(`Annotation ${index} of type "range" requires startTime and endTime`);
      }
      if (annotation.type === 'line' && !annotation.time) {
        errors.push(`Annotation ${index} of type "line" requires time`);
      }
    });
  }

  // Validate refresh configuration
  if (config.refresh) {
    if (config.refresh.interval && (typeof config.refresh.interval !== 'number' || config.refresh.interval < 100)) {
      errors.push('Refresh interval must be a number >= 100ms');
    }
    if (config.refresh.enabled !== undefined && typeof config.refresh.enabled !== 'boolean') {
      errors.push('Refresh enabled must be a boolean');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateData = (data, config) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push('Data array is empty');
    return { isValid: true, errors, warnings };
  }

  // Check if data has required fields
  const firstItem = data[0];
  if (!firstItem.timestamp && !firstItem.time) {
    errors.push('Data must contain timestamp or time field');
  }

  // Check if series data fields exist
  if (config.series) {
    config.series.forEach(series => {
      if (series.dataField && !(series.dataField in firstItem)) {
        warnings.push(`Data field "${series.dataField}" not found in data`);
      }
    });
  }

  // Validate data types
  data.forEach((item, index) => {
    if (item.timestamp && typeof item.timestamp !== 'string' && typeof item.timestamp !== 'number') {
      errors.push(`Data item ${index} timestamp must be a string or number`);
    }
    if (item.time && typeof item.time !== 'string' && typeof item.time !== 'number') {
      errors.push(`Data item ${index} time must be a string or number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
