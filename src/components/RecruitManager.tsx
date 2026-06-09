'use client';

import { useState } from 'react';
import { Users, Upload, Plus, X, Info } from 'lucide-react';
import { addRecruit, bulkImportRecruits } from '@/app/actions';
import { houses } from '@/lib/houses';

export default function RecruitManager({ huntId }: { huntId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Add Single Button */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="flex-1 bg-white p-6 rounded-2xl border-2 border-dashed border-pink-200 flex flex-col justify-center items-center text-center hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition group shadow-sm hover:shadow-md cursor-pointer"
      >
        <div className="bg-pink-100 text-pink-500 p-3 rounded-full mb-3 shadow-sm border border-pink-200 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
          <Plus size={24} strokeWidth={3} />
        </div>
        <span className="font-bold text-slate-600 group-hover:text-pink-600">Add Recruit</span>
      </button>

      {/* Bulk Import Button */}
      <button 
        onClick={() => setIsImportOpen(true)}
        className="flex-1 bg-white p-6 rounded-2xl border-2 border-dashed border-zoo-blue-200 flex flex-col justify-center items-center text-center hover:bg-zoo-blue-50 hover:border-zoo-blue-300 hover:text-zoo-blue-600 transition group shadow-sm hover:shadow-md cursor-pointer"
      >
        <div className="bg-zoo-blue-100 text-zoo-blue-500 p-3 rounded-full mb-3 shadow-sm border border-zoo-blue-200 group-hover:scale-110 group-hover:bg-zoo-blue-500 group-hover:text-white transition-all">
          <Upload size={24} strokeWidth={3} />
        </div>
        <span className="font-bold text-slate-600 group-hover:text-zoo-blue-600">Bulk Import</span>
      </button>

      {/* Add Single Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <Users size={18} className="text-pink-500" /> Register Recruit
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await addRecruit(fd); setIsAddOpen(false); }} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="huntId" value={huntId} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Name (ชื่อ)</label>
                  <input type="text" name="name" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Surname (นามสกุล)</label>
                  <input type="text" name="surname" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nickname (ชื่อเล่น)</label>
                <input type="text" name="nickname" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">House (บ้าน)</label>
                <select name="house" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white" required>
                  {Object.keys(houses).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                  <input type="text" name="username" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
                  <input type="password" name="password" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition shadow-sm">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-zpd-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-zpd-navy flex items-center gap-2">
                <Upload size={18} className="text-zoo-blue-500" /> Bulk Import Recruits
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200"><X size={16}/></button>
            </div>
            
            <form action={async (fd) => { 
                setIsImporting(true);
                try {
                  await bulkImportRecruits(fd); 
                  setIsImportOpen(false);
                } catch (err) {
                  alert(String(err));
                } finally {
                  setIsImporting(false);
                }
              }} 
              className="p-5 flex flex-col gap-6"
            >
              <input type="hidden" name="huntId" value={huntId} />
              
              <div className="bg-zoo-blue-50 p-4 rounded-xl border border-zoo-blue-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-zoo-blue-800 text-sm">Upload File (.csv, .xlsx, .json)</div>
                  
                  {/* Tooltip Hover Guide */}
                  <div className="relative">
                    <Info size={16} className="text-zoo-blue-500 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-zpd-navy text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
                      <div className="font-bold mb-1 border-b border-slate-600 pb-1 text-zoo-amber-400">Required Column Headers:</div>
                      <ul className="list-disc pl-4 space-y-1 mt-2 font-mono">
                        <li>name</li>
                        <li>surname</li>
                        <li>nickname</li>
                        <li>house</li>
                        <li>username</li>
                        <li>password</li>
                      </ul>
                      <div className="absolute -bottom-1 right-1 w-2 h-2 bg-zpd-navy transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                <input 
                  type="file" 
                  name="file" 
                  accept=".csv, .json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white file:text-zoo-blue-700 file:border file:border-zoo-blue-200 hover:file:bg-zoo-blue-100 cursor-pointer"
                  required 
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsImportOpen(false)} disabled={isImporting} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isImporting} className="flex-1 px-4 py-2.5 bg-zoo-blue-600 text-white rounded-lg text-sm font-bold hover:bg-zoo-blue-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isImporting ? <span className="animate-pulse">Importing...</span> : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
