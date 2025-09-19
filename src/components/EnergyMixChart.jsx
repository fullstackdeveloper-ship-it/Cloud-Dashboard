import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const EnergyMixChart = ({ className, data }) => {

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        className="drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 min-w-[160px]">
          <div className="text-center">
            <div className="font-bold text-gray-900 text-lg mb-1">{data.name}</div>
            <div className="text-2xl font-bold text-gray-800">{data.value}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${className}`}>
      {/* Gradient title matching the project style */}
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
          Energy Mix
        </h3>
        <div className="h-1 w-16 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full mt-2" />
      </div>
      
      <div className="h-[320px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={3}
              stroke="white"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0097b2]/5 via-transparent to-[#198c1a]/5 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
};

export default EnergyMixChart;
