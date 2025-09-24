import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle } from 'lucide-react';
import TimeSeriesConfigForm from '../../components/admin/TimeSeriesConfigForm';

const ChartsCreate = () => {
  const [selectedChartType, setSelectedChartType] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleChartTypeChange = (type) => {
    setSelectedChartType(type);
    setIsFormSubmitted(false);
  };

  const handleFormSubmit = (config) => {
    console.log('Chart configuration submitted:', config);
    setIsFormSubmitted(true);
    // Here you would typically save the configuration to your backend
  };

  const chartTypes = [
    {
      id: 'timeseries',
      name: 'Time Series',
      description: 'Time-based data visualization with multiple series support',
      icon: '📈',
      available: true
    },
    {
      id: 'bar',
      name: 'Bar Chart',
      description: 'Categorical data comparison charts',
      icon: '📊',
      available: false
    },
    {
      id: 'line',
      name: 'Line Chart',
      description: 'Continuous data trend visualization',
      icon: '📈',
      available: false
    },
    {
      id: 'area',
      name: 'Area Chart',
      description: 'Filled area under curves',
      icon: '📈',
      available: false
    },
    {
      id: 'gauge',
      name: 'Gauge Chart',
      description: 'Single value indicators',
      icon: '⏱️',
      available: false
    },
    {
      id: 'pie',
      name: 'Pie Chart',
      description: 'Proportional data segments',
      icon: '🥧',
      available: false
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/charts-management"
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Charts
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create New Chart
                </h1>
                <p className="text-gray-600">
                  Build and configure a new chart visualization
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isFormSubmitted && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Chart Created Successfully!</h3>
                <p className="text-green-600">Your chart configuration has been generated and logged to the console.</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Type Selection */}
        {!selectedChartType && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Chart Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chartTypes.map((chart) => (
                <div
                  key={chart.id}
                  onClick={() => chart.available && handleChartTypeChange(chart.id)}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    chart.available
                      ? 'border-gray-200 hover:border-[#0097b2] hover:shadow-lg hover:scale-105'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-4">{chart.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{chart.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{chart.description}</p>
                  {chart.available ? (
                    <div className="flex items-center text-[#0097b2] text-sm font-medium">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Available
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400 text-sm">
                      Coming Soon
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TimeSeries Configuration Form */}
        {selectedChartType === 'timeseries' && (
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Time Series Configuration</h2>
                  <p className="text-gray-600 mt-1">Configure your time series chart with multiple data series</p>
                </div>
                <button
                  onClick={() => setSelectedChartType('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Chart Types
                </button>
              </div>
            </div>
            
            <TimeSeriesConfigForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {/* Other Chart Types - Coming Soon */}
        {selectedChartType && selectedChartType !== 'timeseries' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-gray-600 mb-6">
                This chart type is currently under development. Please select Time Series for now.
              </p>
              <button
                onClick={() => setSelectedChartType('')}
                className="inline-flex items-center px-4 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#0097b2]/90 transition-colors"
              >
                ← Back to Chart Types
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsCreate;