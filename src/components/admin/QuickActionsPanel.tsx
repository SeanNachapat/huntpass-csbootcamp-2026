'use client';

import { useState } from 'react';
import { Download, Megaphone, Loader2 } from 'lucide-react';
import { broadcastAnnouncement } from '@/app/actions';

export default function QuickActionsPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/export/recruits');
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recruits-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export recruits');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsBroadcasting(true);
      const formData = new FormData();
      formData.append('message', message);
      await broadcastAnnouncement(formData);
      setMessage('');
      alert('Announcement broadcasted successfully!');
    } catch (err) {
      alert('Failed to broadcast announcement');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-paper-border pb-3">
        <h3 className="text-lg font-playfair font-bold text-passport-navy">Quick Actions</h3>
      </div>
      
      <div className="space-y-6">
        {/* Export Data */}
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-passport-navy text-white px-4 py-3 rounded-xl font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Exporting...' : 'Export Recruits Data (CSV)'}
          </button>
        </div>

        <hr className="border-paper-border" />

        {/* Global Broadcast */}
        <form onSubmit={handleBroadcast} className="space-y-3">
          <label className="block text-sm font-sans font-bold text-muted-sepia uppercase tracking-widest">
            Global Broadcast
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type an announcement to send to all recruits..."
            className="w-full p-3 bg-white border border-paper-border rounded-xl font-sarabun text-sepia-ink focus:outline-none focus:border-seal-gold focus:ring-1 focus:ring-seal-gold resize-none h-24 shadow-inner text-sm"
            required
          />
          <button
            type="submit"
            disabled={isBroadcasting || !message.trim()}
            className="w-full flex items-center justify-center gap-2 bg-seal-gold text-white px-4 py-3 rounded-xl font-sarabun font-bold hover:bg-yellow-600 transition shadow-sm disabled:opacity-70"
          >
            {isBroadcasting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
            {isBroadcasting ? 'Broadcasting...' : 'Broadcast Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
