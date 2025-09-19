import React from 'react';
import {
  BarChart,
  Bar,
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

const KpiChart = ({ className }) => {
  // Get controller ID and global refresh trigger from date range context
  const { getControllerId, refreshTrigger } = useDateRange();
  const controllerId = getControllerId();
  
  // Use unified KPI data hook for KPI data
  const { data: kpiData, isLoading, error } = useKpiData(
    controllerId,
    'kpi',
    { 
      autoRefresh: true, 
      enableIntervalRefresh: true, // Enable interval-based refresh
      globalRefreshTrigger: refreshTrigger
    }
  );
  
  // Transform KPI data for chart display
  const chartData = kpiData ? [
    { name: 'Total Load', value: kpiData.totalLoad || 0 },
    { name: 'Generation', value: kpiData.totalGeneration || 0 },
    { name: 'Grid Power', value: kpiData.gridPower || 0 },
    { name: 'Efficiency', value: kpiData.efficiency || 0 }
  ] : [];

  return (
    <BaseChart
      className={className}
      title="KPI Performance"
      subtitle="Key performance indicators"
      data={chartData}
      isLoading={isLoading}
      error={error}
      onRetry={() => window.location.reload()}
      loadingMessage="Loading KPI data..."
      loadingSubMessage="Fetching performance metrics"
      emptyMessage="No KPI data available"
      emptySubMessage="No performance data found"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default KpiChart;
