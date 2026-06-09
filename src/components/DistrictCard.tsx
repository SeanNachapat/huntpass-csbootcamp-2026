'use client';

import { useState } from 'react';
import { Trash2, Plus, Pen, X } from 'lucide-react';
import { assignOfficer, updateOfficer, removeOfficer, removeCheckpoint } from '@/app/actions';

export default function DistrictCard({ cp }: { cp: any }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col h-full shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-slate-100">{cp.zootopiaIcon}</span>
          <span className="font-extrabold text-zpd-navy text-xl">{cp.name}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddOpen(true)} title="Add Officer" className="text-zoo-blue-500 hover:bg-zoo-blue-100 hover:text-zoo-blue-700 rounded-lg transition-all p-2 bg-white border border-slate-200 shadow-sm">
            <Plus size={16} strokeWidth={3} />
          </button>
          <form action={removeCheckpoint}>
            <input type="hidden" name="checkpointId" value={cp.id} />
            <button type="submit" title="Remove District" className="text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all p-2 bg-white border border-slate-200 shadow-sm">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col justify-start">
        {cp.officers.length > 0 ? (
          <div className="space-y-3 mb-4">
            {cp.officers.map((officer: any) => (
              <div key={officer.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                <div>
                  <div className="font-bold text-zoo-blue-800 text-sm">{officer.displayName}</div>
                  <div className="text-xs text-slate-500 font-mono">@{officer.username}</div>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingOfficer(officer)} className="p-1.5 text-slate-400 hover:text-zoo-blue-600 hover:bg-zoo-blue-50 rounded-md transition">
                    <Pen size={14} />
                  </button>
                  <form action={removeOfficer}>
                    <input type="hidden" name="officerId" value={officer.id} />
                    <button type="submit" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl font-medium">
            No officers assigned
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <Plus size={18} className="text-zoo-amber-500" /> Add Officer
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await assignOfficer(fd); setIsAddOpen(false); }} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="checkpointId" value={cp.id} />
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Name</label>
                <input type="text" name="displayName" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-amber-500 outline-none transition" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                <input type="text" name="username" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-amber-500 outline-none transition" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
                <input type="password" name="password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-amber-500 outline-none transition" required />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-zoo-amber-500 text-white rounded-lg text-sm font-bold hover:bg-zoo-amber-600 transition shadow-sm">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingOfficer && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <Pen size={16} className="text-zoo-blue-500" /> Edit Officer
              </h3>
              <button onClick={() => setEditingOfficer(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateOfficer(fd); setEditingOfficer(null); }} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="officerId" value={editingOfficer.id} />
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Name</label>
                <input type="text" name="displayName" defaultValue={editingOfficer.displayName} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none transition" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                <input type="text" name="username" defaultValue={editingOfficer.username} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none transition" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                <input type="password" name="password" placeholder="(Leave blank to keep current)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none transition" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setEditingOfficer(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-zoo-blue-600 text-white rounded-lg text-sm font-bold hover:bg-zoo-blue-700 transition shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
