import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { ShieldCheck, LogOut, CheckCircle, MapPin, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { houses } from '@/lib/houses';
import ChangePasswordModal from '@/components/ChangePasswordModal';

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
  const qrData = JSON.stringify({
    participantId: participant.id,
    huntId: participant.huntId
  });
  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#2C2416', // sepia ink
      light: '#ffffff',
    },
  });

  // Calculate Progress
  const totalCheckpoints = participant.hunt.checkpoints.length;
  const stampsCollected = participant.stamps.length;

  // Get House Config
  const houseConfig = houses[participant.house] || houses['ควาย (Bogo)']; // fallback to Bogo

  const districtColors = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];
  const stampRotations = [-6, 4, -9, 7, -4, 8, -7, 5];

  // Fetch active announcement
  const activeAnnouncement = await prisma.announcement.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-deep-night/60 backdrop-blur-sm text-white relative">
      <header className="bg-passport-navy p-4 shadow-md flex justify-between items-center sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <img src="/assets/Logo.png" alt="HuntPass Logo" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <ChangePasswordModal />
          <div className="w-px h-4 bg-seal-gold/30"></div>
          <Link href="/logout" className="font-mono text-xs text-seal-gold/80 hover:text-seal-gold flex items-center gap-1 transition">
            <LogOut size={16} /> Exit
          </Link>
        </div>
      </header>

      <main className="flex-grow p-4 flex flex-col items-center max-w-[430px] mx-auto w-full relative animate-passport-slide">
        
        {activeAnnouncement && (
          <div className="w-full bg-yellow-500/90 text-passport-navy rounded-xl p-3 mb-6 shadow-md border border-yellow-600 flex items-start gap-3">
            <Megaphone className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-70 mb-1">City Bulletin</p>
              <p className="font-sarabun font-bold text-sm leading-tight">{activeAnnouncement.message}</p>
            </div>
          </div>
        )}

        {/* Passport Cover Card */}
        <div className="w-full bg-passport-navy rounded-2xl shadow-xl overflow-hidden mb-6 relative p-6 pt-8 pb-8">
          <div className="absolute inset-[6px] border border-seal-gold/30 rounded-xl pointer-events-none"></div>
          {/* Left Stripe */}
          <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${houseConfig.bgClass}`}></div>
          
          <div className="text-center mb-6">
            <p className="font-playfair text-[10px] uppercase text-seal-gold tracking-[0.2em] mb-1">ANIMACODE CITY</p>
            <p className="font-mono text-[9px] text-seal-gold/70 tracking-widest">RECRUIT PASSPORT</p>
          </div>

          <div className="flex flex-col items-center">
            {/* Avatar Circle */}
            <div className="w-28 h-28 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center shadow-inner overflow-hidden border-2 border-passport-ivory ring-2 ring-seal-gold/50">
              <img src={houseConfig.image} alt={houseConfig.name} className="w-2/3 h-2/3 object-cover" />
            </div>

            <h1 className="text-2xl font-playfair font-bold text-passport-ivory mb-1 text-center">
              {participant.name} {participant.surname}
            </h1>
            <p className="text-sm font-sarabun text-seal-gold mb-4 text-center">({participant.nickname})</p>
            
            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-sarabun font-bold shadow-sm ${houseConfig.bgClass} ${houseConfig.textClass}`}>
              บ้าน {houseConfig.name}
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="w-full bg-passport-ivory paper-texture rounded-2xl shadow-md border border-paper-border mb-8 p-6 flex flex-col items-center">
          <p className="font-mono text-xs font-bold text-sepia-ink uppercase tracking-widest mb-4">BADGE ประจำตัว</p>
          <div className="border border-seal-gold/50 p-2 bg-white rounded-lg shadow-sm">
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
          </div>
          <p className="font-sarabun italic text-xs text-muted-sepia mt-4 text-center px-4 leading-relaxed">
            แสดง Badge ให้เจ้าหน้าที่ประจำสแกน
          </p>
        </div>

        {/* District Stamps */}
        <div className="w-full bg-passport-ivory paper-texture rounded-2xl shadow-md border border-paper-border mb-8 p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-paper-border flex-grow"></div>
            <h2 className="font-mono text-xs font-bold text-sepia-ink tracking-widest">DISTRICT STAMPS</h2>
            <div className="h-px bg-paper-border flex-grow"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 gap-y-6 px-2">
            {participant.hunt.checkpoints.map((cp, index) => {
              const stamp = participant.stamps.find(s => s.checkpointId === cp.id);
              const isStamped = !!stamp;
              const color = districtColors[index % districtColors.length];
              const rotation = stampRotations[index % stampRotations.length];
              
              return (
                <div key={cp.id} className="flex flex-col items-center justify-center aspect-square relative">
                  {isStamped ? (
                    <div 
                      className="relative w-[88px] h-[88px] rounded-full border-2 flex flex-col items-center justify-center p-1 stamp-edge"
                      style={{ 
                        '--stamp-rotate': `${rotation}deg`,
                        transform: 'rotate(var(--stamp-rotate))',
                        borderColor: color,
                        color: color,
                      } as React.CSSProperties}
                    >
                      {/* Inner Circle */}
                      <div className="absolute inset-1 border border-current rounded-full opacity-60"></div>
                      
                      {/* Curved Top Text (Simulated with absolute positioning for simplicity or standard text) */}
                      <div className="absolute top-2 w-full text-center px-2">
                        <span className="font-mono text-[7px] font-bold uppercase leading-tight line-clamp-1">{cp.name}</span>
                      </div>
                      
                      {/* Center Icon */}
                      <span className="text-xl mt-1 opacity-90">{cp.zootopiaIcon}</span>
                      
                      {/* Date Bottom */}
                      {stamp && (
                        <div className="absolute bottom-2 w-full text-center">
                          <span className="font-mono text-[6px] font-bold">
                            {stamp.stampedAt.toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      )}
                      
                      {/* Paper Grain overlay to make it look printed onto the paper */}
                      <div className="absolute inset-0 paper-texture opacity-10 rounded-full mix-blend-overlay pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="relative w-[88px] h-[88px] rounded-full border-2 border-dashed border-muted-sepia/40 flex flex-col items-center justify-center animate-slot-float">
                      <span className="text-2xl opacity-20 grayscale mb-1">{cp.zootopiaIcon}</span>
                      <span className="font-playfair text-xl font-bold text-muted-sepia/30 absolute">?</span>
                    </div>
                  )}
                  <div className="mt-3 text-center w-full px-1">
                     <p className="font-mono text-[8px] text-muted-sepia uppercase tracking-wider line-clamp-1">{cp.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {totalCheckpoints === 0 && (
            <p className="text-center font-sarabun text-muted-sepia py-4">ยังไม่มีฐานในระบบ</p>
          )}

          <div className="mt-10 px-4">
            <p className="font-mono text-xs font-bold text-sepia-ink text-center mb-3 tracking-widest">
              {stampsCollected} / {totalCheckpoints} DISTRICTS VISITED
            </p>
            <div className="flex h-2 w-full gap-1">
              {Array.from({ length: totalCheckpoints }).map((_, i) => {
                const isFilled = i < stampsCollected;
                const cp = participant.hunt.checkpoints[i];
                const color = isFilled ? districtColors[i % districtColors.length] : 'transparent';
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-sm border ${isFilled ? 'border-transparent' : 'border-paper-border'}`}
                    style={{ backgroundColor: color }}
                  ></div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
