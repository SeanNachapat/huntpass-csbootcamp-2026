import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { ShieldCheck, LogOut, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { houses } from '@/lib/houses';

export default async function Dashboard() {
  const session = await getSession();

  if (!session || session.role !== 'participant') {
    redirect('/');
  }

  const participant = await prisma.participant.findUnique({
    where: { qrToken: session.token },
    include: {
      hunt: {
        include: {
          checkpoints: {
            orderBy: { order: 'asc' }
          }
        }
      },
      stamps: true
    }
  });

  if (!participant || !participant.hunt) {
    redirect('/');
  }

  // Generate QR Code data URL
  const qrDataUrl = await QRCode.toDataURL(participant.qrToken, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Calculate Progress
  const totalCheckpoints = participant.hunt.checkpoints.length;
  const stampsCollected = participant.stamps.length;
  const progressPercent = totalCheckpoints > 0 ? Math.round((stampsCollected / totalCheckpoints) * 100) : 0;

  // Get House Config
  const houseConfig = houses[participant.house] || houses['ควาย (Bogo)']; // fallback to Bogo

  return (
    <div className={`flex flex-col min-h-screen ${houseConfig.bgClass} bg-opacity-20 transition-colors duration-500`}>
      {/* Decorative Background */}
      <div className={`absolute top-0 left-0 w-full h-96 ${houseConfig.bgClass} opacity-10 rounded-b-[100%] pointer-events-none -z-10`}></div>

      <header className="bg-white/80 backdrop-blur-md p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-white/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className={houseConfig.textClass} size={24} />
          <span className={`font-black text-xl ${houseConfig.textClass}`}>HuntPass</span>
        </div>
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition">
          <LogOut size={16} /> ออกจากระบบ
        </Link>
      </header>

      <main className="flex-grow p-4 sm:p-6 flex flex-col items-center max-w-lg mx-auto w-full relative">
        
        {/* ID Badge Card */}
        <div className={`w-full bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-t-8 ${houseConfig.borderClass}`}>
          <div className={`p-6 text-center border-b ${houseConfig.borderClass} border-opacity-20`}>
            {/* House Image */}
            <div className="w-32 h-32 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center shadow-inner overflow-hidden border-4 border-white ring-4 ring-slate-100">
              <img src={houseConfig.image} alt={houseConfig.name} className="w-full h-full object-cover" />
            </div>

            <h1 className="text-3xl font-black text-slate-800 mb-1 leading-tight">
              {participant.name} {participant.surname}
            </h1>
            <p className="text-xl font-bold text-slate-500 mb-3">({participant.nickname})</p>
            
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${houseConfig.bgClass} ${houseConfig.textClass}`}>
              บ้าน {houseConfig.name}
            </div>
          </div>

          <div className="p-8 flex flex-col items-center bg-slate-50/50">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">QR Code ประจำตัว</p>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain mix-blend-multiply" />
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">แสดง QR Code นี้ให้เจ้าหน้าที่ประจำฐานสแกน</p>
          </div>
        </div>

        {/* Case Board (Checklists) */}
        <div className="w-full bg-white rounded-3xl shadow-lg p-6 border border-slate-100 mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-800">ภารกิจตามล่าตราประทับ</h2>
            <span className="text-3xl font-black text-slate-800">{stampsCollected}<span className="text-lg text-slate-400 font-bold">/{totalCheckpoints}</span></span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${houseConfig.bgClass}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {participant.hunt.checkpoints.map((cp) => {
              const stamp = participant.stamps.find(s => s.checkpointId === cp.id);
              const isStamped = !!stamp;
              
              // Generate a consistent pseudo-random rotation for the stamp effect based on string length
              const rotation = ((cp.id.charCodeAt(0) + cp.id.charCodeAt(cp.id.length - 1)) % 30) - 15;
              
              return (
                <div 
                  key={cp.id} 
                  className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-3 overflow-hidden group"
                >
                  {/* Background Watermark */}
                  <div className="absolute inset-0 opacity-5 flex items-center justify-center text-7xl select-none pointer-events-none transform -rotate-12">
                    {cp.zootopiaIcon}
                  </div>
                  
                  {/* District Name */}
                  <h3 className="text-sm font-bold text-slate-500 text-center z-10 leading-tight mb-2 px-1 line-clamp-2">
                    {cp.name}
                  </h3>

                  {isStamped ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-20 transition-all duration-500">
                      <div 
                        className={`border-4 border-double rounded-lg p-2 flex flex-col items-center justify-center shadow-sm bg-white/90 backdrop-blur-md transform hover:scale-110 transition-transform ${houseConfig.borderClass} ${houseConfig.textClass}`}
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <span className="text-3xl mb-1 drop-shadow-sm">{cp.zootopiaIcon}</span>
                        <div className={`w-full border-t-2 border-b-2 py-0.5 mb-1 ${houseConfig.borderClass}`}>
                          <span className="text-xs font-black tracking-wider block text-center">ผ่านแล้ว</span>
                        </div>
                        {stamp && (
                          <span className="text-[10px] font-bold opacity-80">
                            {stamp.stampedAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="z-10 flex flex-col items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-400 flex items-center justify-center border-dashed mb-2">
                        <MapPin size={20} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded-full">รอประทับตรา</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {totalCheckpoints === 0 && (
              <p className="text-center text-slate-500 py-4">ยังไม่มีฐานในระบบ</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
