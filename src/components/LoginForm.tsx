'use client';

import { useState } from 'react';
import { unifiedLogin } from '@/app/actions';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div 
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 30, 61, 0.55), rgba(15, 30, 61, 0.55)), url('/assets/Background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <main className="flex-grow flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-passport-navy rounded-[24px] p-8 md:p-10 shadow-2xl relative animate-passport-slide">
          
          {/* Decorative Gold Inset Border */}
          <div className="absolute inset-[10px] border border-seal-gold/40 rounded-[14px] pointer-events-none"></div>
          
          <div className="text-center mb-8 relative z-10 flex flex-col items-center">
            <div className="mb-6">
              <img src="/assets/Logo.png" alt="HuntPass Logo" className="h-16 w-auto" />
            </div>
            <p className="font-sarabun text-sm text-passport-ivory/70">
              กิจกรรมสแกน QR Code สำหรับ CS Bootcamp
            </p>
          </div>

          <div className="w-full h-px bg-seal-gold/30 mb-8 relative z-10"></div>
          
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-sarabun z-20 relative animate-in fade-in zoom-in-95">
              {errorMsg}
            </div>
          )}

          <form 
            action={async (fd) => {
              setIsSubmitting(true);
              setErrorMsg('');
              const res = await unifiedLogin(fd);
              if (res?.error) {
                setErrorMsg(res.error);
              }
              setIsSubmitting(false);
            }} 
            className="space-y-4 relative z-10"
          >
            {/* Inner Paper Section for Inputs */}
            <div className="bg-passport-ivory rounded-xl p-6 paper-texture shadow-inner">
              <div className="space-y-5 relative z-20">
                <div>
                  <label htmlFor="username" className="block font-sans text-xs font-bold text-sepia-ink uppercase tracking-wider mb-2 ml-1">ชื่อผู้ใช้งาน (USERNAME)</label>
                  <input 
                    type="text" 
                    name="username" 
                    id="username"
                    className="w-full bg-passport-ivory border border-sepia-ink/30 rounded-lg p-3.5 font-sarabun font-bold text-sepia-ink focus:border-seal-gold focus:ring-2 focus:ring-seal-gold outline-none transition-colors duration-300 shadow-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block font-sans text-xs font-bold text-sepia-ink uppercase tracking-wider mb-2 ml-1">รหัสผ่าน (PASSWORD)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      id="password"
                      className="w-full bg-passport-ivory border border-sepia-ink/30 rounded-lg p-3.5 pr-12 font-sarabun font-bold text-sepia-ink focus:border-seal-gold focus:ring-2 focus:ring-seal-gold outline-none transition-colors duration-300 shadow-sm"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-sepia hover:text-sepia-ink transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-passport-navy font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md mt-6 flex items-center justify-center gap-2 hover:opacity-90 ${isSubmitting ? 'animate-press-spin' : 'hover:-translate-y-0.5 active:scale-95'}`}
            >
              <Shield size={20} className={isSubmitting ? 'animate-spin' : ''} />
              ดำเนินการต่อ
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
