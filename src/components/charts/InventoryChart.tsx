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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Blood Group</h3>
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
    </div>
  );
};