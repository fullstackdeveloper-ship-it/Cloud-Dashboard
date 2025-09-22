import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataProvider.js';
import { calcEnergyWithDuration } from '../utils/energyCalculator.js';

const MetricCard = ({ title, value, isLoading = false, error = false }) => {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-2 h-[64px] flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-xs font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
          {title}
        </h4>
      </div>
      <div className="text-right">
        {isLoading ? (
          <span className="text-sm font-bold text-gray-400">---</span>
        ) : error ? (
          <span className="text-sm font-bold text-red-500">Error</span>
        ) : value ? (
          <span className="text-sm font-bold text-gray-900">{value}</span>
        ) : (
          <span className="text-sm font-bold text-gray-400">N/A</span>
        )}
      </div>
    </div>
  );
};

const RightMetricsPanel = ({ className }) => {
  // Get power mix data to calculate energy values
  const { powerMix } = useData();
  const { data: powerMixData, isLoading, error } = powerMix;
  
  const [energyData, setEnergyData] = useState(null);
  
  // Calculate energy data when power mix data changes
  useEffect(() => {
    if (powerMixData?.data && powerMixData.data.length > 0) {
      const rawData = powerMixData.data;
      
      // Process data for energy calculation
      const processedData = rawData.map(item => ({
        time: item.time || new Date().toISOString(),
        W_PV: typeof item.W_PV === 'number' ? item.W_PV : 0,
        W_Grid: typeof item.W_Grid === 'number' ? item.W_Grid : 0,
        W_Gen: typeof item.W_Gen === 'number' ? item.W_Gen : 0,
        W_Load: typeof item.W_Load === 'number' ? item.W_Load : 0,
      }));
      
      // Calculate energy values
      const calculatedEnergy = calcEnergyWithDuration(processedData);
      setEnergyData(calculatedEnergy);
    } else {
      // Clear energy data when no power mix data is available
      setEnergyData(null);
    }
  }, [powerMixData]);

  // Calculate power values from energy data
  const getPowerValues = () => {
    if (!energyData?.totals || !energyData?.range?.hours) {
      return {
        solarPower: '0.0',
        gensetPower: '0.0', 
        gridPower: '0.0',
        loadPower: '0.0'
      };
    }
    
    const hours = energyData.range.hours;
    const totals = energyData.totals;
    
    const solarPower = (totals.kWh_PV / hours).toFixed(1);
    const gensetPower = (totals.kWh_Gen / hours).toFixed(1);
    const gridImportPower = (totals.kWh_Grid_Import / hours).toFixed(1);
    const gridExportPower = (totals.kWh_Grid_Export / hours).toFixed(1);
    const loadPower = (totals.kWh_Load / hours).toFixed(1);
    
    // Calculate net grid power (import - export)
    const netGridPower = (parseFloat(gridImportPower) - parseFloat(gridExportPower)).toFixed(1);
    const gridPower = parseFloat(netGridPower) >= 0 ? `+${netGridPower}` : netGridPower;
    
    return {
      solarPower,
      gensetPower,
      gridPower,
      loadPower
    };
  };

  const powerValues = getPowerValues();
  
  const energyMetrics = [
    { title: 'Solar Generation', value: `${powerValues.solarPower} kW` },
    { title: 'Genset Production', value: `${powerValues.gensetPower} kW` },
    { title: 'Grid Import/Export', value: `${powerValues.gridPower} kW` },
    { title: 'Load Consumption', value: `${powerValues.loadPower} kW` }
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
                isLoading={isLoading}
                error={error}
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
