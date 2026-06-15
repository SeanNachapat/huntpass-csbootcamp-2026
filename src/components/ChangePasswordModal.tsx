'use client';

import { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { changeRecruitPassword } from '@/app/actions';

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const newPass = formData.get('newPassword') as string;
    const confirmPass = formData.get('confirmPassword') as string;

    if (newPass !== confirmPass) {
      setErrorMsg('รหัสผ่านใหม่ไม่ตรงกัน (Passwords do not match)');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await changeRecruitPassword(formData);
      if (res && 'error' in res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จ! (Password changed successfully)');
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="font-mono text-xs text-seal-gold/80 hover:text-seal-gold flex items-center gap-1 transition"
      >
        <KeyRound size={16} /> Password
      </button>

      {isOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-passport-navy/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-sm border border-seal-gold/50 overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="absolute inset-[6px] border border-seal-gold/30 rounded-xl pointer-events-none"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-paper-border pb-4">
                <h3 className="font-playfair font-bold text-passport-navy flex items-center gap-2 text-xl">
                  <KeyRound size={20} className="text-seal-gold" /> เปลี่ยนรหัสผ่าน
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1 border border-paper-border shadow-sm">
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
                  <label className="text-[10px] font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">รหัสผ่านปัจจุบัน (Current Password)</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none shadow-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">รหัสผ่านใหม่ (New Password)</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none shadow-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none shadow-sm" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !!successMsg}
                  className="w-full mt-4 bg-passport-navy text-white rounded-xl py-3 text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <span className="animate-pulse">Updating...</span> : 'บันทึก (Save)'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
