'use client';

import { useState } from 'react';
import { Pen, Trash2, Plus, X, UserPlus } from 'lucide-react';
import { createOfficer, updateOfficer, deleteOfficer, linkExistingOfficer, removeOfficer } from '@/app/actions';

interface Checkpoint {
  id: string;
  name: string;
  zootopiaIcon: string | null;
  type: string;
  hunt: {
    name: string;
  };
}

interface Officer {
  id: string;
  displayName: string;
  username: string;
  password?: string;
  checkpoints: Checkpoint[];
}

export default function OfficersListUI({ 
  initialOfficers = [], 
  allCheckpoints = [] 
}: { 
  initialOfficers: Officer[]; 
  allCheckpoints: Checkpoint[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [deletingOfficer, setDeletingOfficer] = useState<Officer | null>(null);
  const [assigningToOfficerId, setAssigningToOfficerId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center pb-4 border-b border-paper-border">
        <h2 className="text-xl font-playfair font-bold text-passport-navy">Active Staff Roster</h2>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-passport-navy text-white hover:bg-passport-navy/90 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border-b-2 border-black/20"
        >
          <UserPlus size={16} /> Register Officer
        </button>
      </div>

      {/* Tabular Officers List */}
      <div className="overflow-x-auto rounded-xl border border-paper-border bg-white/40 shadow-xs custom-scrollbar">
        <table className="w-full text-left border-collapse font-sarabun min-w-[600px]">
          <thead>
            <tr className="bg-passport-navy/5 border-b border-paper-border text-[10px] font-sans font-bold uppercase tracking-widest text-muted-sepia">
              <th className="py-4 px-5">Officer Details</th>
              <th className="py-4 px-5">Assigned Scanners & Permissions</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-border/60">
            {initialOfficers.map((officer) => {
              const unassignedCheckpoints = allCheckpoints.filter(
                (cp) => !officer.checkpoints.some((assigned) => assigned.id === cp.id)
              );

              return (
                <tr key={officer.id} className="hover:bg-white/30 transition-colors">
                  {/* Column 1: Officer Details */}
                  <td className="py-4 px-5 align-middle">
                    <div className="font-playfair font-bold text-passport-navy text-base leading-tight">
                      {officer.displayName}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-seal-gold tracking-wider mt-1 uppercase">
                      @{officer.username}
                    </div>
                  </td>
                  
                  {/* Column 2: Permissions Badge List & Grant Action */}
                  <td className="py-4 px-5 align-middle">
                    <div className="flex flex-wrap items-center gap-2">
                      {officer.checkpoints.map((cp) => (
                        <div 
                          key={cp.id} 
                          className="bg-passport-ivory paper-texture pl-2 pr-1 py-1 rounded-lg border border-paper-border shadow-xs flex items-center gap-1.5 shrink-0 text-xs"
                        >
                          <span className="text-sm shrink-0">{cp.zootopiaIcon || '📍'}</span>
                          <span className="font-bold text-sepia-ink max-w-[120px] truncate">{cp.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-bold uppercase ${cp.type === 'daily_attendance' ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20' : 'bg-green-600/10 text-green-600 border border-green-600/20'}`}>
                            {cp.type === 'daily_attendance' ? 'Daily' : 'Badge'}
                          </span>
                          <form action={removeOfficer} className="inline-flex shrink-0">
                            <input type="hidden" name="officerId" value={officer.id} />
                            <input type="hidden" name="checkpointId" value={cp.id} />
                            <button 
                              type="submit" 
                              className="text-muted-sepia hover:text-ink-red p-0.5 rounded transition cursor-pointer" 
                              title="Revoke Access"
                            >
                              <X size={10} strokeWidth={3} />
                            </button>
                          </form>
                        </div>
                      ))}
                      
                      {officer.checkpoints.length === 0 && (
                        <span className="text-xs text-muted-sepia italic mr-2">No scanners assigned.</span>
                      )}

                      {/* Grant Permission Form / Inline Dropdown */}
                      {assigningToOfficerId === officer.id ? (
                        <form 
                          action={async (fd) => {
                            await linkExistingOfficer(fd);
                            setAssigningToOfficerId(null);
                          }} 
                          className="inline-flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150"
                        >
                          <input type="hidden" name="officerId" value={officer.id} />
                          <select 
                            name="checkpointId" 
                            className="bg-white text-black border border-paper-border rounded-lg px-2 py-1 text-xs font-sarabun focus:ring-1 focus:ring-seal-gold outline-none"
                            required
                          >
                            <option value="">-- Choose Checkpoint --</option>
                            {unassignedCheckpoints.map(cp => (
                              <option key={cp.id} value={cp.id}>
                                {cp.zootopiaIcon || '📍'} {cp.name} ({cp.type === 'daily_attendance' ? 'Daily' : 'Badge'})
                              </option>
                            ))}
                          </select>
                          <button 
                            type="submit"
                            className="px-2.5 py-1 bg-passport-navy text-white rounded-lg text-[10px] font-bold font-sans uppercase tracking-wider hover:bg-passport-navy/90 transition shadow-xs cursor-pointer animate-pulse"
                          >
                            Grant
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setAssigningToOfficerId(null)}
                            className="p-1 text-muted-sepia hover:text-sepia-ink bg-white rounded-lg border border-paper-border transition cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setAssigningToOfficerId(officer.id)}
                          disabled={unassignedCheckpoints.length === 0}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-seal-gold/40 hover:border-seal-gold text-seal-gold bg-white hover:bg-seal-gold/5 text-[10px] font-bold font-sans uppercase tracking-wider transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <Plus size={10} strokeWidth={2.5} /> Grant Access
                        </button>
                      )}
                    </div>
                  </td>
                  
                  {/* Column 3: Edit / Delete Action Buttons */}
                  <td className="py-4 px-5 text-right align-middle shrink-0">
                    <div className="inline-flex gap-1">
                      <button 
                        onClick={() => setEditingOfficer(officer)}
                        className="p-1.5 text-muted-sepia hover:text-seal-gold hover:bg-seal-gold/10 rounded-lg transition cursor-pointer"
                        title="Edit Officer details"
                      >
                        <Pen size={14} />
                      </button>
                      <button 
                        onClick={() => setDeletingOfficer(officer)}
                        className="p-1.5 text-muted-sepia hover:text-ink-red hover:bg-ink-red/10 rounded-lg transition cursor-pointer"
                        title="Delete Officer account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {initialOfficers.length === 0 && (
        <div className="py-12 text-center border border-dashed border-paper-border rounded-xl bg-white/40 italic font-sarabun text-muted-sepia">
          No officer staff accounts registered yet.
        </div>
      )}

      {/* Create Officer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50 text-left">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <UserPlus size={20} className="text-seal-gold" /> Register ZPD Officer
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm cursor-pointer"
              >
                <X size={16}/>
              </button>
            </div>
            <form action={async (fd) => { await createOfficer(fd); setIsCreateOpen(false); }} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Officer Display Name</label>
                <input type="text" name="displayName" placeholder="e.g. Officer Clawhauser" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Username</label>
                <input type="text" name="username" placeholder="e.g. clawhauser" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">Password</label>
                <input type="password" name="password" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none transition" required />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm cursor-pointer">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Officer Details Modal */}
      {editingOfficer && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-seal-gold/50 text-left">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy text-xl flex items-center gap-2">
                <Pen size={18} className="text-seal-gold" /> Edit Officer Credentials
              </h3>
              <button 
                onClick={() => setEditingOfficer(null)} 
                className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm cursor-pointer"
              >
                <X size={16}/>
              </button>
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
                <button type="button" onClick={() => setEditingOfficer(null)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Officer Confirmation Modal */}
      {deletingOfficer && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-ink-red/50 text-left">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-red-50/10">
              <h3 className="font-playfair font-bold text-ink-red text-xl flex items-center gap-2">
                <Trash2 size={20} /> Delete Officer Account
              </h3>
              <button 
                onClick={() => setDeletingOfficer(null)} 
                className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm cursor-pointer"
              >
                <X size={16}/>
              </button>
            </div>
            <form action={async (fd) => { await deleteOfficer(fd); setDeletingOfficer(null); }} className="p-6 flex flex-col gap-4">
              <input type="hidden" name="officerId" value={deletingOfficer.id} />
              <p className="font-sarabun text-sm text-sepia-ink leading-relaxed">
                Are you sure you want to permanently delete the officer account for <strong className="text-passport-navy">{deletingOfficer.displayName}</strong>?
              </p>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs font-sarabun text-ink-red">
                <strong>Warning:</strong> This will completely remove their account, and revoke all scanner permissions immediately. This action cannot be undone.
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setDeletingOfficer(null)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-ink-red text-white rounded-lg text-sm font-sarabun font-bold hover:bg-ink-red/90 transition shadow-sm cursor-pointer">Delete Permanent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
