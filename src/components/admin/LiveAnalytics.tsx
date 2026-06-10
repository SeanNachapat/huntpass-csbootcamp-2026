'use client';

import useSWR from 'swr';
import { Trophy, Target, CheckCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TopPerformersLive() {
  const { data, error, isLoading } = useSWR('/api/analytics/leaderboard', fetcher, { refreshInterval: 5000 });

  if (isLoading || error || !data?.leaderboard) {
    return (
      <div className="space-y-3 opacity-50">
        <p className="font-sarabun text-muted-sepia text-center py-4 italic text-sm">Loading live data...</p>
      </div>
    );
  }

  const { leaderboard } = data;

  if (leaderboard.length === 0) {
    return <p className="font-sarabun text-muted-sepia text-center py-4 italic text-sm">No recruits yet.</p>;
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((p: any, i: number) => (
        <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-paper-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-seal-gold/10 text-seal-gold font-bold font-mono text-[10px] flex items-center justify-center border border-seal-gold/30">
              {i + 1}
            </div>
            <div>
              <p className="font-sarabun font-bold text-sm text-sepia-ink">{p.name}</p>
              <p className="font-sans text-[10px] text-muted-sepia">@{p.username}</p>
            </div>
          </div>
          <div className="font-mono font-bold text-passport-navy text-sm">
            {p.stampCount} <span className="text-[10px] text-muted-sepia font-sans font-normal uppercase">stamps</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentScansLive() {
  const { data, error, isLoading } = useSWR('/api/analytics/recent-scans', fetcher, { refreshInterval: 5000 });

  if (isLoading || error || !data?.recentScans) {
    return (
      <div className="space-y-3 opacity-50">
        <p className="font-sarabun text-muted-sepia text-center py-4 italic text-sm">Loading live feed...</p>
      </div>
    );
  }

  const { recentScans } = data;

  if (recentScans.length === 0) {
    return <p className="font-sarabun text-muted-sepia text-center py-4 italic text-sm">No stamps recorded yet.</p>;
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {recentScans.map((stamp: any) => (
        <div key={stamp.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-paper-border shadow-sm">
          <div className="flex items-center gap-3">
             <CheckCircle className="text-verified-green w-4 h-4 shrink-0" />
             <div className="min-w-0">
               <p className="text-sm font-sarabun font-bold text-sepia-ink truncate">{stamp.participantName}</p>
               <p className="text-[11px] font-sarabun text-muted-sepia truncate">
                 Stamped at <span className="font-bold text-passport-navy">{stamp.checkpointName}</span>
               </p>
             </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="font-mono text-[10px] font-bold text-muted-sepia uppercase">
              {new Date(stamp.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-sans text-[9px] text-muted-sepia">by {stamp.officerName}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
