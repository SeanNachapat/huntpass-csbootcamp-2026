'use client';

import { useState } from 'react';
import { Trash2, Users, AlertTriangle } from 'lucide-react';
import RecruitRow from './RecruitRow';
import { bulkRemoveRecruits } from '@/app/actions';

export default function RecruitTable({ recruits }: { recruits: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(recruits.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = recruits.length > 0 && selectedIds.length === recruits.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < recruits.length;

  const handleDeleteClick = () => {
    if (selectedIds.length > 5) {
      setIsWarningOpen(true);
    } else {
      if (confirm(`Are you sure you want to remove ${selectedIds.length} recruits?`)) {
        performDelete();
      }
    }
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      await bulkRemoveRecruits(selectedIds);
      setSelectedIds([]);
      setIsWarningOpen(false);
    } catch (err) {
      alert('Failed to delete recruits: ' + String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-passport-navy text-passport-ivory p-4 rounded-xl shadow-lg border border-seal-gold/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-30">
          <div className="absolute inset-[4px] border border-seal-gold/25 rounded-lg pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <span className="w-6 h-6 rounded-full bg-seal-gold text-passport-navy font-mono font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="font-sarabun font-bold text-sm tracking-wide">Recruits Selected</span>
          </div>

          <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 border border-seal-gold/40 text-seal-gold rounded-lg text-xs font-sarabun font-bold hover:bg-white/10 transition cursor-pointer"
            >
              Deselect All
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="px-4 py-2 bg-ink-red text-white hover:bg-red-600 rounded-lg text-xs font-sarabun font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Trash2 size={14} />
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="bg-white/60 border border-paper-border rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-passport-navy/5 text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest border-b border-paper-border items-center">
          {/* Checkbox */}
          <div className="col-span-1 flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={isAllSelected}
              ref={el => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-paper-border text-seal-gold focus:ring-seal-gold cursor-pointer accent-seal-gold"
            />
          </div>
          <div className="col-span-2">Username</div>
          <div className="col-span-2">Password</div>
          <div className="col-span-3">Full Name</div>
          <div className="col-span-1">Nickname</div>
          <div className="col-span-2">House</div>
          <div className="col-span-1 text-right pr-2">Actions</div>
        </div>

        <div className="divide-y divide-paper-border/50 flex flex-col">
          {recruits.map(p => (
            <RecruitRow 
              key={p.id} 
              recruit={p} 
              isSelected={selectedIds.includes(p.id)}
              onToggleSelect={() => handleSelectOne(p.id)}
            />
          ))}
          
          {recruits.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-muted-sepia bg-white/40">
              <Users size={48} className="mb-4 opacity-30 text-seal-gold" />
              <p className="font-playfair font-bold text-lg text-passport-navy">No recruits enrolled yet.</p>
              <p className="text-sm font-sarabun mt-1">Use the buttons above to add or import recruits.</p>
            </div>
          )}
        </div>
      </div>

      {/* High-Visibility Warning Modal (For deleting > 5 recruits) */}
      {isWarningOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 text-left border-2 border-ink-red">
            
            {/* Double Gold/Red Frame */}
            <div className="absolute inset-[6px] border border-ink-red/30 rounded-xl pointer-events-none"></div>

            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-ink-red/10">
              <h3 className="font-playfair font-bold text-ink-red text-xl flex items-center gap-2">
                <AlertTriangle size={24} className="text-ink-red animate-bounce" /> Danger Zone Warning
              </h3>
              <button onClick={() => setIsWarningOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm cursor-pointer"><X size={16}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-ink-red/5 border-l-4 border-l-ink-red text-sepia-ink text-sm rounded-r-xl leading-relaxed">
                <p className="font-sarabun font-bold mb-2">You are about to delete <span className="text-ink-red font-mono font-black">{selectedIds.length} recruits</span> in bulk.</p>
                <p className="font-sarabun text-xs opacity-80">This action will permanently remove all associated stamp history, leaderboard entries, and passports. This cannot be undone.</p>
              </div>

              <div className="pt-4 mt-2 border-t border-paper-border flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsWarningOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={performDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-ink-red text-white rounded-lg text-sm font-sarabun font-bold hover:bg-red-600 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Bulk Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal X component since X was used in warning modal
function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
