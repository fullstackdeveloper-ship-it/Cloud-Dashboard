import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData.js';

const KpiMiniCard = ({ title, value, unit, icon }) => {
  return (
    <div className="flex-1 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 p-4 flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-sm font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent mb-1">{title}</h4>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-gray-900">
            {value}
          </span>
          <span className="text-xs text-gray-600">{unit}</span>
        </div>
      </div>
      <div className="text-xl opacity-80 ml-2">{icon}</div>
    </div>
  );
};

const KpiMiniStack = () => {
  // Get power mix data from Redux store
  const { powerMix } = useData();
  const { data: powerMixData, isLoading, error } = powerMix;
  
  const [co2Saved, setCo2Saved] = useState(0);
  const [waterSaved, setWaterSaved] = useState(892.3);
  const [treesPlanted, setTreesPlanted] = useState(54);

  // Calculate CO2 saved based on W_PV data
  useEffect(() => {
    if (powerMixData?.data && powerMixData.data.length > 0) {
      const rawData = powerMixData.data;
      
      // Calculate CO2 saved using formula: (W_pv/60) * 0.0007
      let totalCo2Saved = 0;
      
      rawData.forEach(item => {
        const w_pv = typeof item.W_PV === 'number' ? item.W_PV : 0;
        // CO2 Saved in kg = (W_pv/60) * 0.0007
        const co2ForThisPoint = (w_pv / 60) * 0.0007;
        totalCo2Saved += co2ForThisPoint;
      });
      
      setCo2Saved(totalCo2Saved);
      
      // Debug logging
    } else {
      setCo2Saved(0);
    }
  }, [powerMixData]);

  // Keep other metrics with simulated data
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterSaved(prev => prev + (Math.random() * 1.5 - 0.5));
      setTreesPlanted(prev => Math.max(1, prev + Math.floor(Math.random() * 3 - 1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      <KpiMiniCard
        title="CO2 Saved"
        value={isLoading ? "---" : error ? "Error" : co2Saved.toFixed(1)}
        unit="kg"
        icon="🌱"
      />
      <KpiMiniCard
        title="Water Saved"
        value={waterSaved.toFixed(1)}
        unit="L"
        icon="💧"
      />
      <KpiMiniCard
        title="Eqvt. Tree Planted"
        value={treesPlanted}
        unit="trees"
        icon="🌳"
      />
    </div>
  );
};

export default KpiMiniStack;
