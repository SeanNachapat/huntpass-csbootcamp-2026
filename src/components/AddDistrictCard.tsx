'use client';

import { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { addCheckpoint } from '@/app/actions';

export default function AddDistrictCard({ huntId }: { huntId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col justify-center items-center text-center hover:bg-zoo-amber-50 hover:border-zoo-amber-400 hover:text-zoo-amber-600 transition min-h-[300px] text-slate-400 group shadow-sm hover:shadow-md cursor-pointer w-full"
      >
        <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-zoo-amber-500 group-hover:text-white transition-all">
          <Plus size={36} />
        </div>
        <span className="font-bold text-lg">Add New District</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <MapPin size={18} className="text-zoo-amber-500" /> New District
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await addCheckpoint(fd); setIsOpen(false); }} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="huntId" value={huntId} />
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">District Name</label>
                <input type="text" name="name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-amber-500 outline-none transition" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Emoji Icon</label>
                <input type="text" name="icon" placeholder="e.g. 🏢" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zoo-amber-500 outline-none transition" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-zoo-amber-500 text-white rounded-lg text-sm font-bold hover:bg-zoo-amber-600 transition shadow-sm">Add District</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
