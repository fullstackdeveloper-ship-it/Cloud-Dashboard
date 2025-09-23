// src/pages/Overview.jsx
import React from 'react';
import FlowKPI from '../components/FlowKPI.jsx';
import ProjectPictureCard from '../components/ProjectPictureCard.jsx';
import KpiMiniStack from '../components/KpiMiniStack.jsx';
import NotificationsCard from '../components/NotificationsCard.jsx';
import RightMetricsPanel from '../components/RightMetricsPanel.jsx';
import EnergyMixChart from '../components/EnergyMixChart.jsx';
import DynamicTimeseriesChart from '../components/DynamicTimeseriesChart.jsx';
import { useDateRange, useData } from '../hooks/redux';

const Overview = () => {
  // Get global date range context (not used for Power Mix chart anymore)
  useDateRange();
  
  // Get power mix data for the timeseries chart
  // const { powerMix } = useData(); // Not needed for dynamic chart

  // Dummy data for Energy Mix Chart
  const energyMixData = [
    { name: "Solar", value: 46, fill: "#3b82f6" },
    { name: "Grid", value: 34, fill: "#f97316" },
    { name: "Genset", value: 11, fill: "#22c55e" },
    { name: "Battery", value: 7, fill: "#6366f1" },
    { name: "Other", value: 2, fill: "#374151" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Top Row Section - 50/50 Split */}
      <div className="grid grid-cols-12 gap-3 h-[20vh] mb-36">
        {/* Project Picture - Left 50% */}
        <div className="col-start-1 col-span-6">
          <ProjectPictureCard />
        </div>
        
        {/* Right Side - CO2 Saved + Notifications - 50% */}
        <div className="col-start-7 col-span-6 flex gap-2">
          {/* KPI Mini Stack (CO2 Saved) - 40% of right side */}
          <div className="flex-[0.4]">
            <KpiMiniStack />
          </div>
          
          {/* Notifications - 60% of right side */}
          <div className="flex-[0.6]">
            <NotificationsCard />
          </div>
        </div>
      </div>
      
      {/* Middle Section - 50/50 Split */}
      <section className="grid grid-cols-12 gap-2 mb-4">
        {/* Power Flow Card - Left 50% */}
        <div className="col-start-1 col-span-6 h-[400px] rounded-2xl bg-white shadow-lg border border-gray-200 p-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <FlowKPI />
          </div>
        </div>
        
        {/* Right Metrics Panel - Right 50% */}
        <RightMetricsPanel className="col-start-7 col-span-6 h-[400px]" />
      </section>

      {/* Bottom Row - Charts Section */}
      <div className="grid grid-cols-12 gap-2">
        {/* Left: Dynamic Energy Monitoring Chart (8 cols) */}
        <div className="col-span-8 rounded-2xl bg-white shadow-lg border border-gray-200 p-2 sm:p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Monitoring</h3>
          <DynamicTimeseriesChart 
            configPath="energy-monitoring-comprehensive"
            dataPath="energy-monitoring-data"
            height={350}
          />
        </div>
        
        {/* Right: Energy Mix Chart (4 cols) */}
        <EnergyMixChart 
          className="col-span-4 rounded-2xl bg-white shadow-lg border border-gray-200 p-2 sm:p-3" 
          data={energyMixData} 
        />
      </div>

      {/* Second Row - Additional Charts */}
      <div className="grid grid-cols-12 gap-2 mt-4">
        {/* Temperature Monitoring Chart (6 cols) */}
        <div className="col-span-6 rounded-2xl bg-white shadow-lg border border-gray-200 p-2 sm:p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Monitoring</h3>
          <DynamicTimeseriesChart 
            configPath="temperature-monitoring"
            dataPath="temperature-monitoring-data"
            height={300}
          />
        </div>
        
        {/* System Metrics Chart (6 cols) */}
        <div className="col-span-6 rounded-2xl bg-white shadow-lg border border-gray-200 p-2 sm:p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
          <DynamicTimeseriesChart 
            configPath="system-metrics"
            dataPath="system-metrics-data"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
