import React from 'react';
import { User } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardStatsProps {
  users: User[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ users }) => {
  const data = users
    .map(user => ({
      name: user.username,
      assets: user.assets.length
    }))
    .filter(u => u.assets > 0)
    .sort((a, b) => b.assets - a.assets)
    .slice(0, 10); // Top 10 users with assets

  const totalAssets = users.reduce((acc, user) => acc + user.assets.length, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Distribuição de Ativos</h2>
          <p className="text-sm text-gray-500">Top usuários com mais equipamentos</p>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-brand-600">{totalAssets}</span>
          <span className="text-xs text-gray-500 uppercase font-semibold">Total Ativos</span>
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 12}} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: '#f0f9ff'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="assets" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};