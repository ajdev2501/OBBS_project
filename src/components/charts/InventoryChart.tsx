import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { bloodGroups } from '../../lib/validation';

interface InventoryChartProps {
  data: Record<string, number>;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const chartData = bloodGroups.map(group => ({
    bloodGroup: group,
    units: data[group] || 0,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bloodGroup" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="units" fill="#DC2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};