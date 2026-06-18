'use client';

import { useState } from 'react';
import { Trash2, Pen, X, MapPin } from 'lucide-react';
import { removeCheckpoint, updateCheckpoint } from '@/app/actions';

export default function BadgeCard({ cp, index = 0 }: { cp: any; index?: number }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editType, setEditType] = useState(cp.type || 'badge');

  const districtColors = [
    'border-l-district-ice', 'border-l-district-desert', 'border-l-district-jungle', 
    'border-l-district-lavender', 'border-l-district-amber', 'border-l-district-teal', 
    'border-l-district-gold', 'border-l-ink-red'
  ];
  const borderLeftColor = districtColors[index % districtColors.length];

  return (
    <div className={`bg-white/60 p-5 rounded-xl border border-paper-border border-l-[6px] ${borderLeftColor} flex flex-col h-full shadow-sm hover:-translate-y-0.5 transition-transform`}>
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3 pb-2 border-b border-paper-border/40">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-passport-ivory paper-texture w-12 h-12 flex items-center justify-center rounded-full shadow-xs border border-seal-gold/20 shrink-0">{cp.zootopiaIcon}</span>
          <div className="text-left">
            <span className="font-playfair font-bold text-passport-navy text-lg leading-tight block">{cp.name}</span>
          </div>
        </div>
        
        {/* Sleek, borderless action buttons */}
        <div className="flex gap-0.5">
          <button 
            onClick={() => { setEditType(cp.type || 'badge'); setIsEditOpen(true); }} 
            title="Edit Badge" 
            className="text-muted-sepia hover:text-seal-gold hover:bg-seal-gold/10 rounded-lg p-1.5 transition cursor-pointer"
          >
            <Pen size={14} />
          </button>
          <form action={removeCheckpoint}>
            <input type="hidden" name="checkpointId" value={cp.id} />
            <button 
              type="submit" 
              title="Remove Badge" 
              className="text-muted-sepia hover:text-ink-red hover:bg-ink-red/10 rounded-lg p-1.5 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
      
      {/* Content / Hint area */}
      <div className="flex-grow flex flex-col justify-end">
        {cp.type !== 'daily_attendance' ? (
          <div className="mt-2 text-xs text-sepia-ink bg-passport-ivory/40 p-3 rounded-lg border border-paper-border/50 font-sarabun leading-relaxed relative min-h-[50px] flex items-center">
            <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-passport-ivory text-[7px] font-mono font-bold text-seal-gold/80 uppercase tracking-wider border border-paper-border/60 rounded select-none">Clue Clue</span>
            {cp.hint ? (
              <p className="line-clamp-2 text-left italic w-full">{cp.hint}</p>
            ) : (
              <p className="text-muted-sepia italic text-center w-full">No clue provided yet.</p>
            )}
          </div>
        ) : (
          <div className="mt-2 text-[10px] font-sarabun text-muted-sepia bg-passport-ivory/20 py-2.5 px-3 rounded-lg border border-dashed border-paper-border/50 text-center leading-relaxed">
            📅 Attendance check-in point (no clue)
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50 text-left">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <Pen size={18} className="text-seal-gold" /> Edit Badge/Checkpoint
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm cursor-pointer"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateCheckpoint(fd); setIsEditOpen(false); }} className="p-6 flex flex-col gap-4">
              <input type="hidden" name="checkpointId" value={cp.id} />
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Name</label>
                <input type="text" name="name" defaultValue={cp.name} className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Type (ประเภท)</label>
                <select 
                  name="type" 
                  value={editType} 
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" 
                  required
                >
                  <option value="badge">Scavenger Hunt Badge (เหรียญตรา)</option>
                  <option value="daily_attendance">Daily Attendance (จุดเช็คอินรายวัน)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Emoji Icon</label>
                <input type="text" name="icon" defaultValue={cp.zootopiaIcon || ''} className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" />
              </div>
              
              {editType === 'badge' && (
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Hint (คำใบ้ - Supports Markdown)</label>
                  <textarea 
                    name="hint" 
                    rows={3} 
                    defaultValue={cp.hint || ''} 
                    placeholder="e.g. Look under the big polar bear rug..." 
                    className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition resize-none" 
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
