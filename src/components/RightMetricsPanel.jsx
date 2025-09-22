import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData.js';
import { useDataIntegration } from '../hooks/useDataIntegration.js';
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
  // Initialize data integration to populate Redux store
  useDataIntegration();
  
  // Get power mix data from Redux store
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

  // Get energy values directly from energy data
  const getEnergyValues = () => {
    if (!energyData?.totals) {
      return {
        solarEnergy: '0.0',
        gensetEnergy: '0.0', 
        gridEnergy: '0.0',
        loadEnergy: '0.0'
      };
    }
    
    const totals = energyData.totals;
    
    // Display energy values directly (kWh)
    const solarEnergy = totals.kWh_PV.toFixed(1);
    const gensetEnergy = totals.kWh_Gen.toFixed(1);
    const gridImportEnergy = totals.kWh_Grid_Import.toFixed(1);
    const gridExportEnergy = totals.kWh_Grid_Export.toFixed(1);
    const loadEnergy = totals.kWh_Load.toFixed(1);
    
    // Display grid energy as import/export format
    const gridEnergy = `${gridImportEnergy}/${gridExportEnergy}`;
    
    // Debug logging to verify values
    
    return {
      solarEnergy,
      gensetEnergy,
      gridEnergy,
      loadEnergy
    };
  };

  const energyValues = getEnergyValues();
  
  const energyMetrics = [
    { title: 'Solar Generation', value: `${energyValues.solarEnergy} kWh` },
    { title: 'Genset Production', value: `${energyValues.gensetEnergy} kWh` },
    { title: 'Grid Import/Export', value: `${energyValues.gridEnergy} kWh` },
    { title: 'Load Consumption', value: `${energyValues.loadEnergy} kWh` }
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
