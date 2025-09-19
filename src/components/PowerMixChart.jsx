import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import BaseChart from './common/BaseChart';
import { useData } from '../contexts/DataProvider.js';

const PowerMixChart = ({ className }) => {
  // Use centralized data provider to avoid duplicate API calls
  const { powerMix } = useData();
  const { data: powerMixData, isLoading, error } = powerMix;
  
  const rawData = powerMixData?.data || [];
  
  // Process and validate the data
  const chartData = rawData.map((item, index) => {
    // Ensure all values are numbers and handle any data issues
    const processedItem = {
      time: item.time || new Date().toISOString(),
      W_PV: typeof item.W_PV === 'number' ? item.W_PV : 0,
      W_Grid: typeof item.W_Grid === 'number' ? item.W_Grid : 0,
      W_Gen: typeof item.W_Gen === 'number' ? item.W_Gen : 0,
      W_Load: typeof item.W_Load === 'number' ? item.W_Load : 0,
    };
    
    // Only log first item for debugging
    if (index === 0) {
      console.log('Power Mix - First data point:', processedItem);
    }
    
    return processedItem;
  });
  
  // Check if all values are zero or if we have no data
  const hasValidData = chartData.length > 0 && chartData.some(item => 
    item.W_PV > 0 || item.W_Grid > 0 || item.W_Gen > 0 || item.W_Load > 0
  );
  
  // Only log warnings, not all data
  if (!hasValidData && chartData.length > 0) {
    console.warn('Power Mix Chart: All values are zero or invalid');
  }

  return (
    <BaseChart
      className={className}
      title="Power Mix"
      subtitle=""
      data={chartData}
      isLoading={isLoading}
      error={error}
      onRetry={() => window.location.reload()}
      loadingMessage="Loading power mix data..."
      loadingSubMessage="Fetching all data points from database"
      emptyMessage="No power mix data available"
      emptySubMessage={hasValidData ? "Data loaded but all values are zero" : "No data found in the database"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (!value) return '';
              const date = new Date(value);
              return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
            }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => {
              if (value === 0) return '0 kW';
              if (value < 1000) return `${Math.round(value)} W`;
              return `${Math.round(value / 1000)} kW`;
            }}
            scale="linear"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            formatter={(value, name) => {
              if (value === 0) return ['0 W', name];
              if (value < 1000) return [`${Math.round(value)} W`, name];
              return [`${Math.round(value / 1000)} kW`, name];
            }}
            labelFormatter={(label) => {
              if (!label) return 'Time: N/A';
              const date = new Date(label);
              return `Time: ${date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
              })}`;
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          
          {/* W_PV Area - Solar */}
          <Area
            type="monotone"
            dataKey="W_PV"
            stackId="power"
            stroke="#FF8C00"
            fill="#FFA500"
            fillOpacity={0.7}
            strokeWidth={2}
            strokeOpacity={0.9}
            name="Solar Active Power"
            connectNulls={false}
          />
          
          {/* W_Grid Area - Grid */}
          <Area
            type="monotone"
            dataKey="W_Grid"
            stackId="power"
            stroke="#4169E1"
            fill="#87CEEB"
            fillOpacity={0.7}
            strokeWidth={2}
            strokeOpacity={0.9}
            name="Grid Active Power"
            connectNulls={false}
          />
          
          {/* W_Gen Area - Generator */}
          <Area
            type="monotone"
            dataKey="W_Gen"
            stackId="power"
            stroke="#32CD32"
            fill="#90EE90"
            fillOpacity={0.7}
            strokeWidth={2}
            strokeOpacity={0.9}
            name="Generator Active Power"
            connectNulls={false}
          />
          
          {/* W_Load Area - Load */}
          <Area
            type="monotone"
            dataKey="W_Load"
            stackId="power"
            stroke="#DC143C"
            fill="#FFB6C1"
            fillOpacity={0.7}
            strokeWidth={2}
            strokeOpacity={0.9}
            name="Load Active Power"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default PowerMixChart;