import React, { useState } from 'react';
import { Plus, Trash2, Palette, BarChart3, Settings, Eye, Link, AlertTriangle, ZoomIn, Move } from 'lucide-react';

const TimeSeriesConfigForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    
    // Panel Configuration
    panel: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      transparent: false
    },
    
    // Refresh Configuration
    refresh: {
      enabled: true,
      interval: 5000
    },
    
    // Time Range
    startTime: '-24h',
    endTime: 'now()',
    fluxQuery: `from(bucket: "iot-bucket-gfe")
|> range(start: -24h, stop: now())
|> filter(fn: (r) => r["_measurement"] == "power_mix")
|> filter(fn: (r) => r["_field"] == "W_Load" or r["_field"] == "W_Gen")`,
    
    // Axes Configuration
    axes: {
      x: {
        title: 'Time',
        format: 'HH:mm:ss',
        gridLines: true,
        show: true,
        timeZone: 'auto',
        showBorder: true,
        color: 'text'
      },
      y: {
        title: 'Power (W)',
        unit: 'watts',
        min: 0,
        max: 300000,
        softMin: 0,
        softMax: 300000,
        gridLines: true,
        show: true,
        side: 'left',
        scale: 'linear',
        centeredZero: false,
        showBorder: true,
        color: 'text',
        width: 'auto'
      }
    },
    
    // Series Configuration
    series: [
      {
        id: 1,
        name: 'PV Generation',
        dataField: 'W_PV',
        chartType: 'line',
        color: '#f39c12',
        lineWidth: 3,
        lineStyle: 'solid',
        lineInterpolation: 'linear',
        markerSize: 6,
        markerStyle: 'circle',
        markerLineWidth: 2,
        markerLineColor: '#f39c12',
        fill: 'none',
        fillOpacity: 0.3,
        gradientMode: 'none',
        unit: 'W',
        showPoints: 'auto',
        pointSize: 4,
        connectNullValues: 'never',
        disconnectValues: 'never',
        stackSeries: 'off',
        barAlignment: 'center',
        barWidthFactor: 0.8,
        displayName: 'Solar Generation',
        decimals: 0,
        noValue: '-'
      }
    ],
    
    // Tooltip Configuration
    tooltip: {
      enabled: true,
      mode: 'all',
      sortOrder: 'asc',
      hideZeros: false,
      hoverProximity: 20,
      maxWidth: 400,
      maxHeight: 600,
      format: 'HH:mm:ss',
      showValues: true,
      showUnits: true,
      shared: true,
      hoverinfo: 'x+y+text',
      hovertemplate: '<b>%{fullData.name}</b><br>Time: %{x}<br>Power: %{y:,.0f} W<br><extra></extra>'
    },
    
    // Legend Configuration
    legend: {
      enabled: true,
      mode: 'list',
      placement: 'top',
      width: 200,
      values: ['last', 'max', 'min', 'mean'],
      showAsTable: false,
      hideEmpty: false,
      hideZero: false
    },
    
    // Graph Styles
    graphStyles: {
      style: 'lines',
      lineInterpolation: 'linear',
      lineWidth: 3,
      fillOpacity: 0.3,
      gradientMode: 'none',
      lineStyle: 'solid',
      connectNullValues: 'never',
      disconnectValues: 'never',
      showPoints: 'auto',
      pointSize: 4,
      stackSeries: 'off',
      barAlignment: 'center',
      barWidthFactor: 0.8
    },
    
    // Standard Options
    standardOptions: {
      unit: 'watts',
      min: 0,
      max: 300000,
      fieldMinMax: true,
      decimals: 0,
      displayName: 'Energy Data',
      colorScheme: 'single',
      noValue: '-'
    },
    
    // Value Mappings
    valueMappings: [
      {
        type: 'value',
        value: 0,
        displayText: 'No Power',
        color: '#95a5a6'
      },
      {
        type: 'range',
        from: 200000,
        to: 300000,
        displayText: 'High Power',
        color: '#e74c3c'
      }
    ],
    
    // Data Links
    dataLinks: [
      {
        title: 'View Details',
        url: '/energy-details',
        openInNewTab: true,
        oneClick: false
      }
    ],
    
    // Actions
    actions: [
      {
        title: 'Send Alert',
        confirmationMessage: 'Send power alert to operators?',
        method: 'POST',
        url: '/api/alerts',
        variables: [
          {
            key: 'power_level',
            name: 'Power Level',
            type: 'number'
          }
        ],
        queryParameters: [
          {
            key: 'type',
            value: 'power_alert'
          }
        ],
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        contentType: 'application/json',
        body: '{"power_level": $power_level, "timestamp": "$__time"}'
      }
    ],
    
    // Zoom and Pan
    zoom: {
      enabled: true,
      type: 'x'
    },
    
    pan: {
      enabled: true,
      type: 'x'
    },
    
    // Annotations
    annotations: []
  });

  const [errors, setErrors] = useState({});

  // Color options for series
  const colorOptions = [
    '#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', 
    '#1abc9c', '#f1c40f', '#e67e22', '#34495e', '#95a5a6'
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line' },
    { value: 'bar', label: 'Bar' },
    { value: 'area', label: 'Area' }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle series changes
  const handleSeriesChange = (index, field, value) => {
    const updatedSeries = [...formData.series];
    updatedSeries[index] = {
      ...updatedSeries[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      series: updatedSeries
    }));
  };

  // Add new series
  const addSeries = () => {
    const newSeries = {
      id: Date.now(),
      name: '',
      dataField: '',
      chartType: 'line',
      color: colorOptions[formData.series.length % colorOptions.length]
    };
    setFormData(prev => ({
      ...prev,
      series: [...prev.series, newSeries]
    }));
  };

  // Remove series
  const removeSeries = (index) => {
    if (formData.series.length > 1) {
      const updatedSeries = formData.series.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        series: updatedSeries
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Chart title is required';
    }
    
    if (!formData.fluxQuery.trim()) {
      newErrors.fluxQuery = 'Flux query is required';
    }
    
    formData.series.forEach((series, index) => {
      if (!series.name.trim()) {
        newErrors[`series_${index}_name`] = 'Series name is required';
      }
      if (!series.dataField.trim()) {
        newErrors[`series_${index}_dataField`] = 'Data field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate the complete JSON configuration
    const config = {
      title: formData.title,
      description: formData.description || "Real-time energy generation and consumption monitoring with comprehensive configuration options",
      version: "1.0.0",
      influx: {
        bucket: "iot-bucket-gfe",
        org: "GFE-DB"
      },
      query: formData.fluxQuery,
      parameters: {
        start: formData.startTime,
        stop: formData.endTime,
        controllerId: "CTRL-1A64BCC039E8D677872A6A73E31ADFE1098432BE49B3AC4159FD21A909EF61EA"
      },
      panel: {
        title: formData.title,
        description: formData.description || "Monitor power generation, consumption, and grid interactions",
        backgroundColor: "#ffffff",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        borderRadius: 8,
        transparent: false
      },
      refresh: {
        enabled: true,
        interval: 5000
      },
      axes: {
        x: {
          type: "time",
          title: "Time",
          format: "HH:mm:ss",
          gridLines: true,
          show: true,
          timeZone: "auto",
          showBorder: true,
          color: "text"
        },
        y: [
          {
            title: formData.yAxisTitle,
            unit: "watts",
            min: formData.yAxisMin,
            max: formData.yAxisMax,
            softMin: formData.yAxisMin,
            softMax: formData.yAxisMax,
            gridLines: true,
            show: true,
            side: "left",
            scale: "linear",
            centeredZero: false,
            showBorder: true,
            color: "text",
            width: "auto"
          }
        ]
      },
      series: formData.series.map(series => ({
        name: series.name,
        type: series.chartType,
        yAxis: 0,
        color: series.color,
        lineWidth: 3,
        lineStyle: "solid",
        lineInterpolation: "linear",
        markerSize: 6,
        markerStyle: "circle",
        markerLineWidth: 2,
        markerLineColor: series.color,
        fill: series.chartType === 'area' ? 'tonexty' : 'none',
        fillOpacity: 0.3,
        gradientMode: "none",
        dataField: series.dataField,
        unit: "W",
        showPoints: "auto",
        pointSize: 4,
        connectNullValues: "never",
        disconnectValues: "never",
        stackSeries: "off",
        barAlignment: "center",
        barWidthFactor: 0.8,
        displayName: series.name,
        decimals: 0,
        noValue: "-"
      })),
      tooltip: {
        enabled: formData.enableTooltips,
        mode: "all",
        sortOrder: "asc",
        hideZeros: false,
        hoverProximity: 20,
        maxWidth: 400,
        maxHeight: 600,
        format: "HH:mm:ss",
        showValues: true,
        showUnits: true,
        shared: true,
        hoverinfo: "x+y+text",
        hovertemplate: "<b>%{fullData.name}</b><br>Time: %{x}<br>Power: %{y:,.0f} W<br><extra></extra>"
      },
      legend: {
        enabled: true,
        mode: "list",
        placement: "top",
        width: 200,
        values: ["last", "max", "min", "mean"],
        showAsTable: false,
        hideEmpty: false,
        hideZero: false
      },
      graphStyles: {
        style: "lines",
        lineInterpolation: "linear",
        lineWidth: 3,
        fillOpacity: 0.3,
        gradientMode: "none",
        lineStyle: "solid",
        connectNullValues: "never",
        disconnectValues: "never",
        showPoints: "auto",
        pointSize: 4,
        stackSeries: "off",
        barAlignment: "center",
        barWidthFactor: 0.8
      }
    };

    console.log('Generated TimeSeries Configuration:', config);
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Chart Title */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-[#0097b2]" />
          Chart Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Energy Monitoring Dashboard"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
              placeholder="Chart description"
            />
          </div>
        </div>
      </div>

      {/* Time Range */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="text"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
              placeholder="e.g., -24h, -7d, 2022-01-01"
            />
            <p className="text-xs text-gray-500 mt-1">Use relative time (e.g., -24h) or absolute time</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="text"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
              placeholder="e.g., now(), 2022-01-02"
            />
            <p className="text-xs text-gray-500 mt-1">Use 'now()' for current time</p>
          </div>
        </div>
      </div>

      {/* Flux Query */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flux Query</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flux Query *
          </label>
          <textarea
            value={formData.fluxQuery}
            onChange={(e) => handleInputChange('fluxQuery', e.target.value)}
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors font-mono text-sm ${
              errors.fluxQuery ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your Flux query here..."
          />
          {errors.fluxQuery && <p className="text-red-500 text-sm mt-1">{errors.fluxQuery}</p>}
        </div>
      </div>

      {/* Series Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Series Configuration</h3>
          <button
            type="button"
            onClick={addSeries}
            className="inline-flex items-center px-3 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#0097b2]/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Series
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.series.map((series, index) => (
            <div key={series.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Series {index + 1}</h4>
                {formData.series.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSeries(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Series Name *
                  </label>
                  <input
                    type="text"
                    value={series.name}
                    onChange={(e) => handleSeriesChange(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors text-sm ${
                      errors[`series_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., PV Generation"
                  />
                  {errors[`series_${index}_name`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_name`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Field *
                  </label>
                  <input
                    type="text"
                    value={series.dataField}
                    onChange={(e) => handleSeriesChange(index, 'dataField', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors text-sm ${
                      errors[`series_${index}_dataField`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., W_PV, W_Load"
                  />
                  {errors[`series_${index}_dataField`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`series_${index}_dataField`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chart Type
                  </label>
                  <select
                    value={series.chartType}
                    onChange={(e) => handleSeriesChange(index, 'chartType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors text-sm"
                  >
                    {chartTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={series.color}
                      onChange={(e) => handleSeriesChange(index, 'color', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1">
                      {colorOptions.slice(0, 5).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleSeriesChange(index, 'color', color)}
                          className={`w-4 h-4 rounded border-2 ${
                            series.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Y-Axis Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Y-Axis Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Title
            </label>
            <input
              type="text"
              value={formData.yAxisTitle}
              onChange={(e) => handleInputChange('yAxisTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
              placeholder="e.g., Power (W)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Value
            </label>
            <input
              type="number"
              value={formData.yAxisMin}
              onChange={(e) => handleInputChange('yAxisMin', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Value
            </label>
            <input
              type="number"
              value={formData.yAxisMax}
              onChange={(e) => handleInputChange('yAxisMax', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tooltip Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tooltip Configuration</h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableTooltips"
            checked={formData.enableTooltips}
            onChange={(e) => handleInputChange('enableTooltips', e.target.checked)}
            className="h-4 w-4 text-[#0097b2] focus:ring-[#0097b2] border-gray-300 rounded"
          />
          <label htmlFor="enableTooltips" className="ml-2 text-sm font-medium text-gray-700">
            Enable Tooltips
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-xl hover:from-[#0097b2]/90 hover:to-[#198c1a]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Create Chart
        </button>
      </div>
    </form>
  );
};

export default TimeSeriesConfigForm;
