'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XCircle } from 'lucide-react';
import { houses } from '@/lib/houses';

type ScanStatus = 'scanning' | 'success' | 'error' | 'already_stamped';

export default function ScannerUI({ checkpointName }: { checkpointName?: string }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [message, setMessage] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [house, setHouse] = useState<string>('');
  const [stampedAt, setStampedAt] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }, false);
      scannerRef.current = scanner;
      scanner.render(async (decodedText) => {
        scanner.pause(true);
        try {
          const data = JSON.parse(decodedText);
          const res = await fetch('/api/stamp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (res.ok) {
            setStatus('success');
            setParticipantName(result.participantName);
            setHouse(result.speciesAvatar || 'ควาย (Bogo)'); 
            setMessage('Stamp recorded successfully!');
          } else if (result.error === 'Already stamped') {
            setStatus('already_stamped');
            setParticipantName(result.participantName);
            setStampedAt(result.stampedAt);
            setMessage(`Already stamped`);
          } else {
            setStatus('error');
            setMessage(result.error || 'Invalid QR code.');
          }
        } catch (err) {
          setStatus('error');
          setMessage('Unrecognized QR code format.');
        }
      }, (error) => {});
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const resetScanner = () => {
    setStatus('scanning');
    setMessage('');
    setParticipantName('');
    setHouse('');
    setStampedAt('');
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const houseConfig = houses[house] || houses['ควาย (Bogo)'];

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Camera Viewport */}
      <div className={`w-full aspect-square relative rounded-2xl overflow-hidden bg-black ${status !== 'scanning' ? 'hidden' : ''}`}>
        <div id="reader" className="w-full h-full border-none [&>div]:border-none [&>video]:object-cover"></div>
        
        {/* Animated Bracket Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 animate-viewfinder-pulse p-4">
          <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-seal-gold/80 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-seal-gold/80 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-seal-gold/80 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-seal-gold/80 rounded-br-lg"></div>
        </div>

        {/* Scan Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-seal-gold/60 shadow-[0_0_12px_4px_rgba(201,168,76,0.6)] z-20 animate-scan-sweep"></div>
      </div>

      {status === 'scanning' && (
        <div className="text-center mt-8">
          <p className="font-mono uppercase text-seal-gold/70 tracking-widest text-xs mb-6">SCAN RECRUIT BADGE</p>
          
          <div className="bg-passport-ivory paper-texture p-6 rounded-2xl shadow-lg border border-paper-border opacity-90 mx-4">
            <p className="font-sarabun text-muted-sepia text-center italic text-sm">Waiting for QR Code...</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      {status !== 'scanning' && (
        <div className="flex-grow flex flex-col items-center justify-end animate-passport-slide mt-auto">
          
          {status === 'success' && (
            <div className="bg-passport-ivory paper-texture w-full p-8 rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-4 border-seal-gold flex flex-col items-center text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center shadow-inner overflow-hidden border-2 border-passport-ivory ring-2 ring-seal-gold/50">
                <img src={houseConfig.image} alt={houseConfig.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-3xl font-playfair font-bold text-sepia-ink mb-3">{participantName}</h3>
              
              <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-sarabun font-bold shadow-sm ${houseConfig.bgClass} text-white mb-8`}>
                บ้าน {houseConfig.name}
              </div>

              {/* Large Animated Stamp */}
              <div className="relative mb-8">
                <span className="font-sans text-xs font-bold text-verified-green tracking-[0.2em] absolute -top-8 left-1/2 -translate-x-1/2 w-max">VERIFIED</span>
                
                <div 
                  className="w-[140px] h-[140px] rounded-full border-4 border-verified-green flex flex-col items-center justify-center p-2 stamp-edge text-verified-green animate-stamp-slam"
                  style={{ '--stamp-rotate': '-5deg', transform: 'rotate(var(--stamp-rotate))' } as React.CSSProperties}
                >
                  <div className="absolute inset-1 border-2 border-current rounded-full opacity-60"></div>
                  <div className="absolute top-4 w-full text-center px-4">
                    <span className="font-sans text-[10px] font-bold uppercase leading-tight line-clamp-1">{checkpointName}</span>
                  </div>
                  <span className="text-5xl mt-1 opacity-90 drop-shadow-sm">✅</span>
                  <div className="absolute bottom-4 w-full text-center">
                    <span className="font-mono text-[9px] font-bold">
                      {new Date().toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="absolute inset-0 paper-texture opacity-20 rounded-full mix-blend-overlay pointer-events-none"></div>
                </div>
              </div>

              <button 
                onClick={resetScanner}
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-passport-navy font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-passport-navy/20"
              >
                ยืนยัน — Stamp Issued
              </button>
            </div>
          )}

          {status === 'already_stamped' && (
            <div className="bg-passport-ivory paper-texture w-full p-8 rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-4 border-district-desert flex flex-col items-center text-center">
              <h3 className="text-2xl font-sarabun font-bold text-district-desert mb-4">ตรวจสอบแล้ว</h3>
              
              <div className="relative mb-6">
                <div 
                  className="w-[100px] h-[100px] rounded-full border-4 border-district-desert flex flex-col items-center justify-center p-2 stamp-edge text-district-desert animate-stamp-slam"
                >
                  <span className="text-4xl font-black drop-shadow-sm">X</span>
                </div>
              </div>

              <p className="font-mono text-muted-sepia text-xs mb-8">
                Stamped at {new Date(stampedAt).toLocaleTimeString()}
              </p>

              <button 
                onClick={resetScanner}
                className="w-full bg-district-desert text-white font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-black/20"
              >
                กลับไปสแกนต่อ
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-passport-ivory paper-texture w-full p-8 rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-4 border-ink-red flex flex-col items-center text-center">
              <h3 className="text-2xl font-sarabun font-bold text-ink-red mb-4">Badge ไม่ถูกต้อง</h3>
              <XCircle className="w-20 h-20 text-ink-red mb-6" />
              <p className="font-sarabun text-sepia-ink mb-8">{message}</p>

              <button 
                onClick={resetScanner}
                className="w-full bg-ink-red text-white font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-black/20"
              >
                สแกนใหม่
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
