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
      <div className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 group hover:bg-zoo-blue-50/50 transition duration-200">
        
        {/* Username */}
        <div className="col-span-2 font-mono text-sm font-bold text-zoo-blue-600 flex items-center">
          <span className="bg-zoo-blue-100 text-zoo-blue-700 px-2 py-0.5 rounded-md">@{recruit.username}</span>
        </div>

        {/* Password */}
        <div className="col-span-2 flex items-center gap-2">
          <span className="font-mono text-sm text-slate-500 min-w-[64px]">
            {showPassword ? recruit.password : '••••••••'}
          </span>
          <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-zoo-blue-500 transition outline-none focus:outline-none">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Name */}
        <div className="col-span-3 font-semibold text-zpd-navy text-sm">
          {recruit.name} {recruit.surname}
        </div>

        {/* Nickname */}
        <div className="col-span-2 text-slate-500 text-sm italic">
          "{recruit.nickname}"
        </div>

        {/* House */}
        <div className="col-span-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
            <img src={houses[recruit.house]?.image || '/assets/IMG_0488.PNG'} alt={recruit.house} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-medium text-slate-600">{recruit.house}</span>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-slate-400 hover:text-zoo-blue-600 hover:bg-zoo-blue-100 rounded-md transition" title="Config Recruit">
            <Pen size={16} strokeWidth={2.5} />
          </button>
          <form action={removeRecruit}>
            <input type="hidden" name="recruitId" value={recruit.id} />
            <button type="submit" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Remove Recruit">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <Pen size={18} className="text-zoo-blue-500" /> Config Recruit
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateRecruit(fd); setIsEditOpen(false); }} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="recruitId" value={recruit.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Name (ชื่อ)</label>
                  <input type="text" name="name" defaultValue={recruit.name} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Surname (นามสกุล)</label>
                  <input type="text" name="surname" defaultValue={recruit.surname} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nickname (ชื่อเล่น)</label>
                  <input type="text" name="nickname" defaultValue={recruit.nickname} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">House (บ้าน)</label>
                  <select name="house" defaultValue={recruit.house} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none bg-white" required>
                    {Object.keys(houses).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                  <input type="text" name="username" defaultValue={recruit.username} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                  <input type="password" name="password" placeholder="(Leave blank to keep current)" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-zoo-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-zoo-blue-600 text-white rounded-lg text-sm font-bold hover:bg-zoo-blue-700 transition shadow-sm">Save Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
