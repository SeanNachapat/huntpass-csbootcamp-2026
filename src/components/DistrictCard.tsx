'use client';

import { useState } from 'react';
import { Trash2, Plus, Pen, X } from 'lucide-react';
import { assignOfficer, updateOfficer, removeOfficer, removeCheckpoint, updateCheckpoint, linkExistingOfficer } from '@/app/actions';

export default function DistrictCard({ cp, index = 0, allOfficers = [] }: { cp: any, index?: number, allOfficers?: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditDistrictOpen, setIsEditDistrictOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);
  const [addMode, setAddMode] = useState<'create' | 'existing'>('create');
  const [editType, setEditType] = useState(cp.type || 'badge');

  const districtColors = [
    'border-l-district-ice', 'border-l-district-desert', 'border-l-district-jungle', 
    'border-l-district-lavender', 'border-l-district-amber', 'border-l-district-teal', 
    'border-l-district-gold', 'border-l-ink-red'
  ];
  const borderLeftColor = districtColors[index % districtColors.length];
  const hasActiveModal = isAddOpen || !!editingOfficer || isEditDistrictOpen;

  return (
    <div className={`bg-white/60 p-5 rounded-xl border border-paper-border border-l-[6px] ${borderLeftColor} flex flex-col h-full shadow-sm ${hasActiveModal ? '' : 'hover:-translate-y-1 transition-transform'}`}>
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-paper-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-passport-ivory paper-texture w-14 h-14 flex items-center justify-center rounded-full shadow-sm border border-seal-gold/30">{cp.zootopiaIcon}</span>
          <div className="flex flex-col">
            <span className="font-playfair font-bold text-passport-navy text-xl leading-tight max-w-[150px]">{cp.name}</span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-seal-gold mt-0.5">
              {cp.type === 'daily_attendance' ? '📅 Attendance' : '🛡️ Badge'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddOpen(true)} title="Add Officer" className="text-seal-gold hover:bg-seal-gold/10 rounded-lg transition-all p-2 bg-white border border-paper-border shadow-sm">
            <Plus size={16} strokeWidth={3} />
          </button>
          <button onClick={() => { setEditType(cp.type || 'badge'); setIsEditDistrictOpen(true); }} title="Edit Badge" className="text-seal-gold hover:bg-seal-gold/10 rounded-lg transition-all p-2 bg-white border border-paper-border shadow-sm">
            <Pen size={16} />
          </button>
          <form action={removeCheckpoint}>
            <input type="hidden" name="checkpointId" value={cp.id} />
            <button type="submit" title="Remove Badge" className="text-ink-red hover:bg-ink-red/10 rounded-lg transition-all p-2 bg-white border border-paper-border shadow-sm">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col justify-start">
        <p className="font-sans text-xs font-bold uppercase text-muted-sepia tracking-widest mb-3">Assigned Officers</p>
        {cp.officers.length > 0 ? (
          <div className="space-y-3 mb-4">
            {cp.officers.map((officer: any) => (
              <div key={officer.id} className="bg-passport-ivory paper-texture p-3 rounded-xl border border-paper-border shadow-sm flex justify-between items-center group">
                <div>
                  <div className="font-sarabun font-bold text-sepia-ink text-sm">{officer.displayName}</div>
                  <div className="text-xs font-sans text-muted-sepia">@{officer.username}</div>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingOfficer(officer)} className="p-1.5 text-muted-sepia hover:text-seal-gold hover:bg-seal-gold/10 rounded-md transition">
                    <Pen size={14} />
                  </button>
                  <form action={removeOfficer}>
                    <input type="hidden" name="officerId" value={officer.id} />
                    <input type="hidden" name="checkpointId" value={cp.id} />
                    <button type="submit" className="p-1.5 text-muted-sepia hover:text-ink-red hover:bg-ink-red/10 rounded-md transition">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm font-sarabun text-muted-sepia text-center py-6 border-2 border-dashed border-paper-border rounded-xl italic bg-white/40">
            No officers assigned
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (() => {
        const assignableOfficers = allOfficers.filter(
          (officer) => !cp.officers.some((assigned: any) => assigned.id === officer.id)
        );
        
        return (
          <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50">
              <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
                <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                  <Plus size={20} className="text-seal-gold" /> Add Officer
                </h3>
                <button onClick={() => setIsAddOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-paper-border">
                <button 
                  type="button" 
                  onClick={() => setAddMode('create')} 
                  className={`flex-1 py-3 text-xs font-sans font-bold uppercase tracking-wider text-center border-b-2 transition-all ${addMode === 'create' ? 'border-seal-gold text-passport-navy bg-seal-gold/5' : 'border-transparent text-muted-sepia'}`}
                >
                  Create New
                </button>
                <button 
                  type="button" 
                  onClick={() => setAddMode('existing')} 
                  className={`flex-1 py-3 text-xs font-sans font-bold uppercase tracking-wider text-center border-b-2 transition-all ${addMode === 'existing' ? 'border-seal-gold text-passport-navy bg-seal-gold/5' : 'border-transparent text-muted-sepia'}`}
                >
                  Assign Existing
                </button>
              </div>

              {addMode === 'create' ? (
                <form action={async (fd) => { await assignOfficer(fd); setIsAddOpen(false); }} className="p-6 flex flex-col gap-4">
                  <input type="hidden" name="checkpointId" value={cp.id} />
                  <div>
                    <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Display Name</label>
                    <input type="text" name="displayName" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
                  </div>
                  <div>
                    <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Username</label>
                    <input type="text" name="username" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
                  </div>
                  <div>
                    <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Password</label>
                    <input type="password" name="password" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Assign</button>
                  </div>
                </form>
              ) : (
                <form action={async (fd) => { await linkExistingOfficer(fd); setIsAddOpen(false); }} className="p-6 flex flex-col gap-4">
                  <input type="hidden" name="checkpointId" value={cp.id} />
                  <div>
                    <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Select Officer</label>
                    <select name="officerId" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required>
                      <option value="">-- Choose Officer --</option>
                      {assignableOfficers.map(officer => (
                        <option key={officer.id} value={officer.id}>{officer.displayName} (@{officer.username})</option>
                      ))}
                    </select>
                  </div>
                  {assignableOfficers.length === 0 && (
                    <p className="text-xs font-sarabun text-ink-red italic text-center py-2 bg-red-50 rounded-lg border border-red-200">
                      All existing officers are already assigned to this checkpoint.
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                    <button type="submit" disabled={assignableOfficers.length === 0} className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm disabled:opacity-40 disabled:pointer-events-none">Assign</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      {/* Edit Modal */}
      {editingOfficer && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <Pen size={18} className="text-seal-gold" /> Edit Officer
              </h3>
              <button onClick={() => setEditingOfficer(null)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateOfficer(fd); setEditingOfficer(null); }} className="p-6 flex flex-col gap-4">
              <input type="hidden" name="officerId" value={editingOfficer.id} />
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Display Name</label>
                <input type="text" name="displayName" defaultValue={editingOfficer.displayName} className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Username</label>
                <input type="text" name="username" defaultValue={editingOfficer.username} className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">New Password</label>
                <input type="password" name="password" placeholder="(Leave blank to keep current)" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingOfficer(null)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {isEditDistrictOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50 text-left">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <Pen size={18} className="text-seal-gold" /> Edit Badge/Checkpoint
              </h3>
              <button onClick={() => setIsEditDistrictOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            <form action={async (fd) => { await updateCheckpoint(fd); setIsEditDistrictOpen(false); }} className="p-6 flex flex-col gap-4">
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
              {editType !== 'daily_attendance' && (
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Hint (คำใบ้)</label>
                  <textarea name="hint" rows={3} defaultValue={cp.hint || ''} placeholder="e.g. Look under the big polar bear rug..." className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition resize-none" />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditDistrictOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
