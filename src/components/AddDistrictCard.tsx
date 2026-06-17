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
        className="bg-white/40 rounded-2xl border-2 border-dashed border-paper-border flex flex-col justify-center items-center text-center hover:bg-white hover:border-seal-gold hover:text-seal-gold transition min-h-[300px] text-muted-sepia group shadow-sm hover:-translate-y-1 cursor-pointer w-full"
      >
        <div className="bg-passport-ivory paper-texture p-4 rounded-full mb-4 shadow-sm border border-paper-border group-hover:scale-110 group-hover:border-seal-gold transition-all">
          <Plus size={36} />
        </div>
        <span className="font-playfair font-bold text-lg text-passport-navy group-hover:text-seal-gold">Add New Badge</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <MapPin size={20} className="text-seal-gold" /> New Badge/Checkpoint
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await addCheckpoint(fd); setIsOpen(false); }} className="p-6 flex flex-col gap-4">
              <input type="hidden" name="huntId" value={huntId} />
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Name</label>
                <input type="text" name="name" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Type (ประเภท)</label>
                <select name="type" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required>
                  <option value="badge">Scavenger Hunt Badge (เหรียญตรา)</option>
                  <option value="daily_attendance">Daily Attendance (จุดเช็คอินรายวัน)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Emoji Icon</label>
                <input type="text" name="icon" placeholder="e.g. 🏢" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Add Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
