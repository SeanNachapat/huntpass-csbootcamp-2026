'use client';

import { useState, useEffect } from 'react';

export default function SystemHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setIsHealthy(true);
        } else {
          setIsHealthy(false);
        }
      } catch (err) {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, []);

  if (isHealthy === null) return null; // Don't show while loading initial state

  return (
    <div className="flex items-center gap-2" title={isHealthy ? "System Online" : "System Offline or Unreachable"}>
      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isHealthy ? 'bg-verified-green animate-pulse' : 'bg-ink-red'} ring-2 ring-white/10`} />
      <span className={`text-[10px] font-mono tracking-widest hidden md:inline-block ${isHealthy ? 'text-verified-green' : 'text-ink-red'}`}>
        {isHealthy ? 'API OK' : 'ERR'}
      </span>
    </div>
  );
}
