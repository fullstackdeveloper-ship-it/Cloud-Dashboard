import React from 'react';

const MetricCard = ({ title, value }) => {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-2 h-[64px] flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-xs font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
          {title}
        </h4>
      </div>
      {value && (
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
      )}
    </div>
  );
};

const RightMetricsPanel = ({ className }) => {
  // Mock data for the metrics
  const energyMetrics = [
    { title: 'Solar Generation', value: '45.2 kW' },
    { title: 'Genset Production', value: '12.8 kW' },
    { title: 'Grid Import/Export', value: '8.5 kW' },
    { title: 'Load Consumption', value: '66.5 kW' }
  ];

  const performanceMetrics = [
    { title: 'Performance Ratio', value: '87.3%' },
    { title: 'Specific Yield', value: '4.2 kWh/kWp' },
    { title: 'Gen Run Time', value: '3.2 hrs' },
    { title: 'Availability %', value: '98.7%' }
  ];

  return (
    <div className={`rounded-2xl bg-white shadow-lg border border-gray-200 p-3 sm:p-4 h-full flex flex-col overflow-hidden ${className || ''}`}>
      <div className="space-y-4 flex-1">
        {/* Section A - Energy Consumption and Generation */}
        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-semibold text-gray-800 tracking-tight">
              Energy Consumption and Generation
            </h3>
            <div className="h-[1px] bg-gray-300/70 mt-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {energyMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
              />
            ))}
          </div>
        </div>

        {/* Section B - Performance */}
        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-semibold text-gray-800 tracking-tight">
              Performance
            </h3>
            <div className="h-[1px] bg-gray-300/70 mt-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {performanceMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightMetricsPanel;
