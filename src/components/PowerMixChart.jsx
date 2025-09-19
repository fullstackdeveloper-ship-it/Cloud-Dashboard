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
import useKpiData from '../hooks/useKpiData.js';
import { useDateRange } from '../contexts/DateRangeContext.js';

const PowerMixChart = ({ className }) => {
  // Get controller ID, time range, and global refresh trigger from context
  const { getControllerId, getApiTimeRange, refreshTrigger } = useDateRange();
  const controllerId = getControllerId();
  const timeRange = getApiTimeRange();
  
  // Use unified KPI data hook for power mix data
  const { data: powerMixData, isLoading, error } = useKpiData(
    controllerId,
    'powerMix',
    {
      startTime: timeRange.start,
      stopTime: timeRange.stop,
      autoRefresh: true, // Enable auto-refresh for power mix
      enableIntervalRefresh: true, // Enable interval-based refresh
      globalRefreshTrigger: refreshTrigger
    }
  );
  
  const chartData = powerMixData?.data || [];

  return (
    <BaseChart
      className={className}
      title="Power Mix (W_PV, W_Grid, W_Gen, W_Load)"
      subtitle=""
      data={chartData}
      isLoading={isLoading}
      error={error}
      onRetry={() => window.location.reload()}
      loadingMessage="Loading power mix data..."
      loadingSubMessage="Fetching all data points from database"
      emptyMessage="No power mix data available"
      emptySubMessage="No data found in the database"
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
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
            tickFormatter={(value) => `${value}kW`}
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
            formatter={(value, name) => [`${value} kW`, name]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          
          {/* W_PV Area */}
          <Area
            type="monotone"
            dataKey="W_PV"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeOpacity={0.8}
            name="W_PV"
          />
          
          {/* W_Grid Area */}
          <Area
            type="monotone"
            dataKey="W_Grid"
            stackId="2"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeOpacity={0.8}
            name="W_Grid"
          />
          
          {/* W_Gen Area */}
          <Area
            type="monotone"
            dataKey="W_Gen"
            stackId="3"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeOpacity={0.8}
            name="W_Gen"
          />
          
          {/* W_Load Area */}
          <Area
            type="monotone"
            dataKey="W_Load"
            stackId="4"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeOpacity={0.8}
            name="W_Load"
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default PowerMixChart;