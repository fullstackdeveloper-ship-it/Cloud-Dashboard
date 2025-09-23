import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import BaseChart from './common/BaseChart';
import { useData } from '../hooks/useData';
import { useDateRange } from '../hooks/redux';
import { calcEnergyWithDuration } from '../utils/energyCalculator';

const PowerMixChart = ({ className }) => {
  
  // Use centralized data provider to avoid duplicate API calls
  const { powerMix } = useData();
  const { data: powerMixData, error } = powerMix;
  
  // Get date range from filter
  const { fromDateTime, endDateTime } = useDateRange();
  
  console.log('PowerMixChart - fromDateTime:', fromDateTime);
  console.log('PowerMixChart - endDateTime:', endDateTime);
  
  // Helper function to ensure number values
  const ensureNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 0;
    return Number(value);
  };


  // Generate time series backbone with gaps for missing data
  const chartData = useMemo(() => {
    // The data structure from powerMixService is: { data: [...], metadata: {...} }
    const rawData = powerMixData?.data || [];
    console.log('PowerMixChart - rawData:', rawData);
    console.log('PowerMixChart - powerMixData:', powerMixData);
    console.log('PowerMixChart - rawData length:', rawData.length);
    
    if (!fromDateTime || !endDateTime) return [];

    const startTime = new Date(fromDateTime);
    const endTime = new Date(endDateTime);
    const timeRange = endTime.getTime() - startTime.getTime();
    
    // Auto-detect interval based on data density and time range
    const getOptimalInterval = (dataPoints, timeRangeMs) => {
      const totalMinutes = timeRangeMs / (1000 * 60);
      const dataPointsPerMinute = dataPoints.length / totalMinutes;
      
      // If we have very dense data (> 1 point per minute), use 1-minute intervals
      if (dataPointsPerMinute > 1) return 1;
      // If we have moderate data (1 point per 5 minutes), use 5-minute intervals
      if (dataPointsPerMinute > 0.2) return 5;
      // For sparse data, use 15-minute intervals
      if (dataPointsPerMinute > 0.067) return 15;
      // For very sparse data, use 1-hour intervals
      return 60;
    };

    const intervalMinutes = getOptimalInterval(rawData, timeRange);
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Performance optimization: limit total points for very long ranges
    const maxPoints = 1000;
    const totalIntervals = Math.ceil(timeRange / intervalMs);
    const actualInterval = totalIntervals > maxPoints ? timeRange / maxPoints : intervalMs;
    
    // Create time series backbone - always create even if no raw data
    const timeSeries = [];
    const currentTime = new Date(startTime);
    
    while (currentTime.getTime() <= endTime.getTime()) {
      timeSeries.push({
        time: currentTime.toISOString(),
        W_PV: 0, // Use 0 instead of null to show lines
        W_Grid: 0,
        W_Gen: 0,
        W_Load: 0,
        hasData: false
      });
      currentTime.setTime(currentTime.getTime() + actualInterval);
    }

    // If no raw data, return the backbone with zeros
    if (!rawData.length) {
      return timeSeries;
    }

    // Create a map of existing data for quick lookup
    const dataMap = new Map();
    const filteredData = rawData.filter(item => {
      const itemTime = new Date(item.time);
      return itemTime >= startTime && itemTime <= endTime;
    });
    
    console.log('PowerMixChart - filteredData length:', filteredData.length);
    console.log('PowerMixChart - startTime:', startTime.toISOString());
    console.log('PowerMixChart - endTime:', endTime.toISOString());
    console.log('PowerMixChart - sample rawData item:', rawData[0]);
    
    filteredData.forEach(item => {
      const timeKey = new Date(item.time).toISOString();
      dataMap.set(timeKey, {
        W_PV: ensureNumber(item.W_PV),
        W_Grid: ensureNumber(item.W_Grid),
        W_Gen: ensureNumber(item.W_Gen),
        W_Load: ensureNumber(item.W_Load),
      });
    });

    // Merge actual data with time series backbone
    const mergedData = timeSeries.map(timePoint => {
      const timeKey = timePoint.time;
      const actualData = dataMap.get(timeKey);
      
      if (actualData) {
        return {
          ...timePoint,
          ...actualData,
          hasData: true
        };
      }
      
      // Return 0 values for missing data (don't change the timePoint)
      return timePoint;
    });

    console.log('PowerMixChart - mergedData length:', mergedData.length);
    console.log('PowerMixChart - mergedData with data:', mergedData.filter(d => d.hasData).length);
    console.log('PowerMixChart - sample mergedData item:', mergedData[0]);

    return mergedData;
  }, [powerMixData, fromDateTime, endDateTime]);


  // Calculate energy data when we have valid data
  if (chartData.length > 0) {
    calcEnergyWithDuration(chartData);
  }

  return (
    <BaseChart
      className={className}
      title="Power Mix"
      subtitle="Power consumption and generation over time"
      data={chartData}
      isLoading={false}
      error={error}
      onRetry={() => window.location.reload()}
      loadingMessage="Loading power mix data..."
      loadingSubMessage="Fetching all data points from database"
      emptyMessage="No power mix data available"
      emptySubMessage="No data found in the selected time range"
    >
      <div style={{ height: 'calc(100% - 60px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
          animationDuration={300}
          animationEasing="ease-in-out"
        >
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (!value) return '';
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                return date.toLocaleString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                });
              } catch (error) {
                return value;
              }
            }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value === 0) return '0';
              if (value < 1000) return `${Math.round(value)}`;
              return `${Math.round(value / 1000)}k`;
            }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (value === 0) return ['0 W', name];
              if (value < 1000) return [`${Math.round(value)} W`, name];
              return [`${Math.round(value / 1000)} kW`, name];
            }}
            labelFormatter={(label) => {
              if (!label) return 'Time: N/A';
              const date = new Date(label);
              return `Time: ${date.toLocaleString('en-US', { 
                month: 'short',
                day: 'numeric',
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
            connectNulls={true}
            animationDuration={300}
            animationEasing="ease-in-out"
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
            connectNulls={true}
            animationDuration={300}
            animationEasing="ease-in-out"
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
            connectNulls={true}
            animationDuration={300}
            animationEasing="ease-in-out"
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
            connectNulls={true}
            animationDuration={300}
            animationEasing="ease-in-out"
          />
        </AreaChart>
        </ResponsiveContainer>
      </div>
    </BaseChart>
  );
};

export default PowerMixChart;