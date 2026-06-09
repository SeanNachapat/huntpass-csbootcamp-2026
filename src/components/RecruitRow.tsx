'use client';

import { useState } from 'react';
import { Trash2, Pen, X, Eye, EyeOff } from 'lucide-react';
import { updateRecruit, removeRecruit } from '@/app/actions';
import { houses } from '@/lib/houses';

export default function RecruitRow({ recruit }: { recruit: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 group hover:bg-seal-gold/10 transition duration-200">
        
        {/* Username */}
        <div className="col-span-2 font-mono text-sm font-bold text-passport-navy flex items-center">
          <span className="bg-passport-navy/10 text-passport-navy px-2 py-0.5 rounded-md border border-seal-gold/20">@{recruit.username}</span>
        </div>

        {/* Password */}
        <div className="col-span-2 flex items-center gap-2">
          <span className="font-mono text-sm text-muted-sepia min-w-[64px]">
            {showPassword ? recruit.password : '••••••••'}
          </span>
          <button onClick={() => setShowPassword(!showPassword)} className="text-seal-gold hover:text-passport-navy transition outline-none focus:outline-none">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Name */}
        <div className="col-span-3 font-sarabun font-bold text-sepia-ink text-sm">
          {recruit.name} {recruit.surname}
        </div>

        {/* Nickname */}
        <div className="col-span-2 font-sarabun text-muted-sepia text-sm italic">
          "{recruit.nickname}"
        </div>

        {/* House */}
        <div className="col-span-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-paper-border shrink-0 ring-1 ring-seal-gold/50">
            <img src={houses[recruit.house]?.image || '/assets/IMG_0488.PNG'} alt={recruit.house} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-sarabun font-medium text-sepia-ink">{recruit.house}</span>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-muted-sepia hover:text-seal-gold hover:bg-seal-gold/10 rounded-md transition" title="Config Recruit">
            <Pen size={16} strokeWidth={2.5} />
          </button>
          <form action={removeRecruit}>
            <input type="hidden" name="recruitId" value={recruit.id} />
            <button type="submit" className="p-1.5 text-muted-sepia hover:text-ink-red hover:bg-ink-red/10 rounded-md transition" title="Remove Recruit">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 text-left border border-seal-gold/50">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <Pen size={18} className="text-seal-gold" /> Config Recruit
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateRecruit(fd); setIsEditOpen(false); }} className="p-6 flex flex-col gap-4">
              <input type="hidden" name="recruitId" value={recruit.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Name (ชื่อ)</label>
                  <input type="text" name="name" defaultValue={recruit.name} className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Surname (นามสกุล)</label>
                  <input type="text" name="surname" defaultValue={recruit.surname} className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Nickname (ชื่อเล่น)</label>
                  <input type="text" name="nickname" defaultValue={recruit.nickname} className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">House (บ้าน)</label>
                  <select name="house" defaultValue={recruit.house} className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required>
                    {Object.keys(houses).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-paper-border space-y-4">
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Username</label>
                  <input type="text" name="username" defaultValue={recruit.username} className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">New Password</label>
                  <input type="password" name="password" placeholder="(Leave blank to keep current)" className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Save Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
