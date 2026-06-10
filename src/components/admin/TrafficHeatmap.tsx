'use client';

import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const COLORS = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];

export default function TrafficHeatmap() {
  const { data, error, isLoading } = useSWR('/api/analytics/heatmap', fetcher, { refreshInterval: 5000 });

  if (isLoading || error || !data?.heatmap) {
    return (
      <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm h-[300px] flex items-center justify-center">
        <p className="font-sarabun text-muted-sepia italic text-sm">Loading district traffic...</p>
      </div>
    );
  }

  const { heatmap } = data;

  if (heatmap.length === 0) {
    return (
      <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm h-[300px] flex items-center justify-center">
        <p className="font-sarabun text-muted-sepia italic text-sm">No districts configured.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-paper-border pb-3">
        <h3 className="text-lg font-playfair font-bold text-passport-navy">District Traffic Heatmap</h3>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={heatmap} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8C7A6B', fontFamily: 'monospace' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8C7A6B' }}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #E6D5B8', backgroundColor: '#FDFBF7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              labelStyle={{ color: '#2C2416', fontWeight: 'bold', fontFamily: 'Playfair Display' }}
              itemStyle={{ color: '#2C2416', fontFamily: 'monospace', fontWeight: 'bold' }}
            />
            <Bar dataKey="scans" radius={[4, 4, 0, 0]}>
              {heatmap.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
