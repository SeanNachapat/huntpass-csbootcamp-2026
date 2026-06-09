import { unifiedLogin } from '@/app/actions';
import { PawPrint, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-zoo-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-zoo-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-[2rem] p-8 md:p-10 border border-white/50 backdrop-blur-sm">
          
          <div className="text-center mb-8">
            <img 
              src="/assets/Logo.png" 
              alt="HuntPass Logo" 
              className="w-28 h-28 mx-auto mb-4 object-contain drop-shadow-sm"
            />
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zpd-navy to-zoo-blue-600 tracking-tight mb-2">
              HuntPass
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-xs mx-auto leading-relaxed">
              กิจกรรมสแกน QR Code สำหรับ CS Bootcamp
            </p>
          </div>

          <div className="w-full h-px bg-slate-100 mb-8"></div>

          <h2 className="text-lg font-bold text-zpd-navy mb-5 text-center">เข้าสู่ระบบ</h2>
          
          <form action={unifiedLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-1 ml-1">ชื่อผู้ใช้งาน (Username)</label>
              <input 
                type="text" 
                name="username" 
                id="username"
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-zoo-blue-500/20 focus:border-zoo-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1 ml-1">รหัสผ่าน (Password)</label>
              <input 
                type="password" 
                name="password" 
                id="password"
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-zoo-blue-500/20 focus:border-zoo-blue-500 outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-zpd-navy to-zoo-blue-600 hover:from-zoo-blue-900 hover:to-zoo-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgb(30,58,138,0.3)] hover:shadow-[0_8px_30px_rgb(30,58,138,0.5)] hover:-translate-y-1 mt-6 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              ดำเนินการต่อ
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
