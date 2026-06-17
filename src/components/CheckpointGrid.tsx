'use client';

import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import Portal from './Portal';

interface Checkpoint {
  id: string;
  name: string;
  zootopiaIcon: string | null;
  hint: string | null;
  type?: string | null;
}

interface Stamp {
  id: string;
  checkpointId: string;
  stampedAt: Date | string;
}

interface CheckpointGridProps {
  checkpoints: Checkpoint[];
  stamps: Stamp[];
}

export default function CheckpointGrid({ checkpoints, stamps }: CheckpointGridProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);

  const districtColors = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];
  const stampRotations = [-6, 4, -9, 7, -4, 8, -7, 5];

  const handleCardClick = (cp: Checkpoint) => {
    setSelectedCheckpoint(cp);
  };

  const getStampForCheckpoint = (cpId: string) => {
    return stamps.find(s => s.checkpointId === cpId);
  };

  const formatStampDate = (dateVal: Date | string) => {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    return d.toLocaleDateString('en-GB');
  };

  const activeStamp = selectedCheckpoint ? getStampForCheckpoint(selectedCheckpoint.id) : null;
  const isStamped = !!activeStamp;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 gap-y-6 px-2">
        {checkpoints.map((cp, index) => {
          const stamp = getStampForCheckpoint(cp.id);
          const isStamped = !!stamp;
          const color = districtColors[index % districtColors.length];
          const rotation = stampRotations[index % stampRotations.length];
          
          return (
            <button
              key={cp.id}
              onClick={() => handleCardClick(cp)}
              className="flex flex-col items-center justify-center aspect-square relative focus:outline-none group active:scale-95 transition-transform cursor-pointer"
            >
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
                  
                  {/* Curved Top Text */}
                  <div className="absolute top-2 w-full text-center px-2">
                    <span className="font-mono text-[7px] font-bold uppercase leading-tight line-clamp-1">{cp.name}</span>
                  </div>
                  
                  {/* Center Icon */}
                  <span className="text-xl mt-1 opacity-90">{cp.zootopiaIcon}</span>
                  
                  {/* Date Bottom */}
                  {stamp && (
                    <div className="absolute bottom-2 w-full text-center">
                      <span className="font-mono text-[6px] font-bold">
                        {formatStampDate(stamp.stampedAt)}
                      </span>
                    </div>
                  )}
                  
                  {/* Paper Grain overlay */}
                  <div className="absolute inset-0 paper-texture opacity-10 rounded-full mix-blend-overlay pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative w-[88px] h-[88px] rounded-full border-2 border-dashed border-muted-sepia/40 flex flex-col items-center justify-center animate-slot-float group-hover:border-seal-gold/60 transition-colors">
                  <span className="text-2xl opacity-20 grayscale mb-1 group-hover:opacity-35 transition-opacity">{cp.zootopiaIcon}</span>
                  <span className="font-playfair text-xl font-bold text-muted-sepia/30 absolute group-hover:text-seal-gold/45 transition-colors">?</span>
                </div>
              )}
              <div className="mt-3 text-center w-full px-1">
                 <p className="font-mono text-[8px] text-muted-sepia uppercase tracking-wider line-clamp-1 group-hover:text-sepia-ink transition-colors">{cp.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Parchment Scroll Hint Popup Modal */}
      {selectedCheckpoint && (
        <Portal>
          <div className="fixed inset-0 bg-passport-navy/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-300 relative text-left flex flex-col max-h-[85vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCheckpoint(null)}
                className="absolute -top-3 -right-3 bg-passport-ivory hover:bg-white text-passport-navy rounded-full p-1.5 border border-paper-border shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer z-30"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              {/* Rolled Paper Top rod */}
              <div className="h-6 bg-gradient-to-b from-[#d2c09c] via-[#eae0c8] to-[#cbb78d] rounded-t-xl shadow-md border-b border-[#a8956b] relative z-20 flex justify-between px-6 shrink-0">
                <div className="w-3 h-full bg-amber-900/40 rounded-l shadow-inner"></div>
                <div className="w-3 h-full bg-amber-900/40 rounded-r shadow-inner"></div>
              </div>

              {/* Scroll Body */}
              <div className="bg-[#fdf6e2] paper-texture border-l-8 border-r-8 border-double border-[#8b5a2b] px-8 py-10 shadow-2xl relative text-[#4A3B2C] z-10 overflow-y-auto custom-scrollbar flex flex-col justify-between flex-grow">
                {/* Subtle background graphics */}
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
                  <HelpCircle size={180} />
                </div>

                <div>
                  {/* Header */}
                  <div className="text-center mb-6 pb-3 border-b border-[#e1d5ba]/80 relative z-10">
                    <div className="text-3xl mb-1 filter drop-shadow-sm select-none">{selectedCheckpoint.zootopiaIcon}</div>
                    <h3 className="font-playfair font-bold text-[#2c1d11] text-2xl tracking-wide select-text">
                      {selectedCheckpoint.name}
                    </h3>
                    <p className="font-mono text-[9px] text-[#8c765c] tracking-widest mt-1">
                      {selectedCheckpoint.type === 'daily_attendance' ? 'ZPD ATTENDANCE RECORD' : 'ZPD CASE FILE'}
                    </p>
                  </div>

                  {/* Hint Content */}
                  <div className="space-y-3 relative z-10 text-center px-2">
                    <p className="font-playfair italic text-[#8c765c] text-xs font-bold uppercase tracking-wider">
                      {selectedCheckpoint.type === 'daily_attendance' ? 'Attendance Status / สถานะการเช็คอิน' : 'Badge Clue / คำใบ้'}
                    </p>
                    <p className="font-sarabun font-medium text-sm leading-relaxed text-[#4e3c2b] whitespace-pre-wrap select-text">
                      {selectedCheckpoint.hint || (selectedCheckpoint.type === 'daily_attendance' ? 'รายงานตัวกับเจ้าหน้าที่เพื่อสแกนเช็คอินเข้างานประจำวัน (Scan QR code with officers to check-in daily)' : 'No clue has been provided for this badge yet. Keep searching!')}
                    </p>
                  </div>
                </div>

                {/* Optional verified stamp */}
                {isStamped && activeStamp && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 animate-stamp-slam"
                    style={{
                      transform: 'rotate(-10deg)',
                    }}
                  >
                    <div className="border-4 border-double border-ink-red/80 px-6 py-3 rounded-xl flex flex-col items-center justify-center bg-transparent text-ink-red/85 uppercase font-sans font-black tracking-widest border-spacing-2 stamp-edge max-w-[200px] text-center shadow-sm">
                      <span className="text-[9px] tracking-[0.2em] font-mono opacity-80">CASE CLOSED</span>
                      <span className="text-lg font-extrabold mt-0.5 leading-none">VERIFIED</span>
                      <span className="text-[8px] font-mono mt-1 opacity-70">
                        {formatStampDate(activeStamp.stampedAt)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Indicator at the bottom */}
                <div className="mt-8 pt-4 border-t border-[#e1d5ba]/60 flex items-center justify-center relative z-10">
                  {isStamped ? (
                    <span className="text-emerald-700 font-sarabun font-bold text-xs flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-sm">
                      ✓ Clue Solved (ไขคดีแล้ว)
                    </span>
                  ) : (
                    <span className="text-[#8c765c] font-sarabun font-bold text-xs flex items-center gap-1.5 bg-white/50 border border-[#e1d5ba]/80 px-3 py-1 rounded-full">
                      🔎 Pending Investigation (กำลังสืบสวน)
                    </span>
                  )}
                </div>

              </div>

              {/* Rolled Paper Bottom rod */}
              <div className="h-6 bg-gradient-to-t from-[#d2c09c] via-[#eae0c8] to-[#cbb78d] rounded-b-xl shadow-md border-t border-[#a8956b] relative z-20 flex justify-between px-6 shrink-0">
                <div className="w-3 h-full bg-amber-900/40 rounded-l shadow-inner"></div>
                <div className="w-3 h-full bg-amber-900/40 rounded-r shadow-inner"></div>
              </div>

            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
