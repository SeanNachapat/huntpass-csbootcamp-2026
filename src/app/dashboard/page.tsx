import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { ShieldCheck, LogOut, CheckCircle, MapPin, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { houses } from '@/lib/houses';
import { logout } from '@/app/actions';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import CheckpointGrid from '@/components/CheckpointGrid';
import EditNicknameModal from '@/components/EditNicknameModal';

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
      stamps: {
        include: { checkpoint: true }
      }
    }
  });

  if (!participant || !participant.hunt) {
    redirect('/');
  }

  // 6 AM Daily Reset/Assignment Logic
  const now = new Date();
  const threshold = new Date(now);
  threshold.setHours(6, 0, 0, 0);
  if (now < threshold) {
    threshold.setDate(threshold.getDate() - 1);
  }

  let assignedRoom = participant.assignedRoom;
  let roomAssignedAt = participant.roomAssignedAt;

  if (!assignedRoom || !roomAssignedAt || new Date(roomAssignedAt) < threshold) {
    assignedRoom = Math.random() < 0.4 ? '210' : '211';
    roomAssignedAt = now;
    await prisma.participant.update({
      where: { id: participant.id },
      data: {
        assignedRoom,
        roomAssignedAt
      }
    });
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
  const allCheckpoints = participant.hunt.checkpoints;
  const badgeCheckpoints = allCheckpoints.filter(cp => cp.type === 'badge' || !cp.type);
  const attendanceCheckpoints = allCheckpoints.filter(cp => cp.type === 'daily_attendance');

  const totalBadges = badgeCheckpoints.length;
  const badgeStamps = participant.stamps.filter(s => s.checkpoint.type === 'badge' || !s.checkpoint.type);
  const badgesCollected = badgeStamps.length;

  const totalAttendance = attendanceCheckpoints.length;
  const attendanceStamps = participant.stamps.filter(s => s.checkpoint.type === 'daily_attendance');
  const attendanceCollected = attendanceStamps.length;

  // Get House Config
  const houseConfig = houses[participant.house] || houses['ควาย (Bogo)']; // fallback to Bogo

  const districtColors = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];

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
          <form action={logout}>
            <button type="submit" className="font-mono text-xs text-seal-gold/80 hover:text-seal-gold flex items-center gap-1 transition cursor-pointer">
              <LogOut size={16} /> Exit
            </button>
          </form>
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
            <div className="flex items-center justify-center gap-1.5 mb-4 group/nick">
              <span className="text-sm font-sarabun text-seal-gold text-center">{participant.nickname}</span>
              <EditNicknameModal initialNickname={participant.nickname} />
            </div>
            
            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-sarabun font-bold shadow-sm ${houseConfig.bgClass} ${houseConfig.textClass}`}>
              บ้าน {houseConfig.name}
            </div>
          </div>
        </div>

        {/* Assigned Room Card */}
        <div className="w-full bg-passport-ivory paper-texture rounded-2xl shadow-md border border-paper-border mb-6 p-5 relative overflow-hidden">
          {/* Subtle gold badge border */}
          <div className="absolute inset-[4px] border border-seal-gold/25 rounded-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="bg-passport-navy/10 text-passport-navy p-2 rounded-lg border border-seal-gold/30">
              <ShieldCheck className="text-seal-gold w-5 h-5" />
            </div>
            <div>
              <p className="font-playfair font-bold text-passport-navy text-sm">ZPD ASSIGNED ROOM</p>
              <p className="text-[9px] font-mono text-muted-sepia uppercase tracking-widest">ห้องปฏิบัติการประจำวัน</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center relative z-10 pt-2 border-t border-paper-border/40">
            <div>
              <span className="text-[10px] font-sans font-bold text-muted-sepia uppercase tracking-wider block">Assigned Room</span>
              <span className="text-3xl font-playfair font-bold text-passport-navy">{assignedRoom}</span>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] font-sans font-bold text-muted-sepia uppercase tracking-wider block">Randomized At</span>
              <span className="text-xs font-mono font-bold text-sepia-ink">
                {roomAssignedAt ? new Date(roomAssignedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) + ' (' + new Date(roomAssignedAt).toLocaleDateString('en-GB') + ')' : 'N/A'}
              </span>
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

        {/* Daily Attendance Stamps */}
        <div className="w-full bg-passport-ivory paper-texture rounded-2xl shadow-md border border-paper-border mb-6 p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-paper-border flex-grow"></div>
            <h2 className="font-mono text-xs font-bold text-sepia-ink tracking-widest">DAILY ATTENDANCE</h2>
            <div className="h-px bg-paper-border flex-grow"></div>
          </div>

          <CheckpointGrid 
            checkpoints={JSON.parse(JSON.stringify(attendanceCheckpoints))} 
            stamps={JSON.parse(JSON.stringify(attendanceStamps))} 
          />
          
          {totalAttendance === 0 && (
            <p className="text-center font-sarabun text-muted-sepia py-4 text-xs italic">ยังไม่มีจุดเช็คอินรายวัน</p>
          )}

          {totalAttendance > 0 && (
            <div className="mt-4 px-4">
              <p className="font-mono text-[9px] text-muted-sepia text-center mb-1 tracking-widest">
                ATTENDANCE RECORD: {attendanceCollected} / {totalAttendance} DAYS PRESENT
              </p>
            </div>
          )}
        </div>

        {/* Badge Stamps */}
        <div className="w-full bg-passport-ivory paper-texture rounded-2xl shadow-md border border-paper-border mb-8 p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-paper-border flex-grow"></div>
            <h2 className="font-mono text-xs font-bold text-sepia-ink tracking-widest">BADGES COLLECTED</h2>
            <div className="h-px bg-paper-border flex-grow"></div>
          </div>

          <CheckpointGrid 
            checkpoints={JSON.parse(JSON.stringify(badgeCheckpoints))} 
            stamps={JSON.parse(JSON.stringify(badgeStamps))} 
          />
          
          {totalBadges === 0 && (
            <p className="text-center font-sarabun text-muted-sepia py-4 text-xs italic">ยังไม่มีเหรียญรางวัลในระบบ</p>
          )}

          {totalBadges > 0 && (
            <div className="mt-8 px-4">
              <p className="font-mono text-xs font-bold text-sepia-ink text-center mb-3 tracking-widest">
                {badgesCollected} / {totalBadges} BADGES EARNED
              </p>
              <div className="flex h-2 w-full gap-1">
                {Array.from({ length: totalBadges }).map((_, i) => {
                  const isFilled = i < badgesCollected;
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
          )}
        </div>

      </main>
    </div>
  );
}
