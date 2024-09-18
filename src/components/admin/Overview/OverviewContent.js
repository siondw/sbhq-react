// OverviewContent.js
import React from 'react';
import { UserGroupIcon, ChartBarIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const participationData = [
  { name: 'Round 1', participants: 1000 },
  { name: 'Round 2', participants: 750 },
  { name: 'Round 3', participants: 500 },
  { name: 'Round 4', participants: 250 },
  { name: 'Round 5', participants: 100 },
];

const OverviewContent = () => (
  <div>
    <h2 className="text-2xl font-semibold text-white">Dashboard Overview</h2>
    <div className="mt-4">
      <div className="flex flex-wrap -mx-6">
        {/* Cards here with similar structure */}
      </div>
    </div>
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Participation Trend</h3>
      <div className="bg-gray-800 p-4 rounded-md shadow-sm" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={participationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              itemStyle={{ color: '#D1D5DB' }}
            />
            <Legend />
            <Line type="monotone" dataKey="participants" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default OverviewContent;
