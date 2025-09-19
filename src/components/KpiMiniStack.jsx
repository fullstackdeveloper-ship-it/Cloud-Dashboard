import React, { useState, useEffect } from 'react';

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
  const [co2Saved, setCo2Saved] = useState(1247.5);
  const [waterSaved, setWaterSaved] = useState(892.3);
  const [treesPlanted, setTreesPlanted] = useState(54);

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setCo2Saved(prev => prev + (Math.random() * 2 - 1));
      setWaterSaved(prev => prev + (Math.random() * 1.5 - 0.5));
      setTreesPlanted(prev => Math.max(1, prev + Math.floor(Math.random() * 3 - 1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      <KpiMiniCard
        title="CO2 Saved"
        value={co2Saved.toFixed(1)}
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
