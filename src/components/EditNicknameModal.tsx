'use client';

import { useState } from 'react';
import { Pen, X } from 'lucide-react';
import { updateRecruitNickname } from '@/app/actions';

export default function EditNicknameModal({ initialNickname }: { initialNickname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateRecruitNickname(formData);
      setSuccessMsg('แก้ไขชื่อเล่นสำเร็จ! (Nickname updated successfully)');
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการแก้ไขชื่อเล่น');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1 rounded-full text-seal-gold/60 hover:text-seal-gold hover:bg-white/10 transition opacity-0 group-hover/nick:opacity-100 focus:opacity-100 cursor-pointer"
        title="Edit Nickname"
      >
        <Pen size={12} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-passport-navy/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm border border-seal-gold/50 overflow-hidden relative animate-in zoom-in-95 duration-200 text-left">
            <div className="absolute inset-[6px] border border-seal-gold/30 rounded-xl pointer-events-none"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-paper-border pb-4">
                <h3 className="font-playfair font-bold text-passport-navy flex items-center gap-2 text-xl">
                  <Pen size={20} className="text-seal-gold" /> แก้ไขชื่อเล่น
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1 border border-paper-border shadow-sm cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 text-xs text-center font-sarabun font-bold">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-700 text-xs text-center font-sarabun font-bold">
                  {successMsg}
                </div>
              )}

              <form action={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1.5 block">ชื่อเล่นใหม่ (New Nickname)</label>
                  <input 
                    type="text" 
                    name="nickname" 
                    defaultValue={initialNickname}
                    maxLength={20}
                    className="w-full bg-white border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none shadow-sm" 
                    required 
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !!successMsg}
                    className="flex-1 bg-passport-navy text-white rounded-lg py-2.5 text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? <span className="animate-pulse">Saving...</span> : 'Save Nickname'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
