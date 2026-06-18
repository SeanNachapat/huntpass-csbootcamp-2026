'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XCircle } from 'lucide-react';
import { houses } from '@/lib/houses';

type ScanStatus = 'scanning' | 'success' | 'error' | 'already_stamped';

interface CameraDevice {
  id: string;
  label: string;
}

interface RecentScan {
  id: string;
  checkpointId: string;
  participantName: string;
  nickname: string;
  house: string;
  stampedAt: string;
}

interface Checkpoint {
  id: string;
  name: string;
  zootopiaIcon: string | null;
  type: string;
  hunt: {
    id: string;
    name: string;
    checkpoints: Array<{ id: string }>;
  };
}

export default function ScannerUI({ 
  checkpoints = [], 
  initialRecentScans = []
}: { 
  checkpoints?: Checkpoint[], 
  initialRecentScans?: RecentScan[]
}) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [message, setMessage] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [house, setHouse] = useState<string>('');
  const [stampedAt, setStampedAt] = useState<string>('');

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(-1);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>(initialRecentScans);

  const activeCheckpoint = checkpoints[activeIdx] || checkpoints[0];

  const districtColors = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];
  const getCheckpointColor = (cp: any) => {
    if (!cp || !cp.hunt || !cp.hunt.checkpoints) return '#C9A84C';
    const index = cp.hunt.checkpoints.findIndex((c: any) => c.id === cp.id);
    return districtColors[Math.max(0, index) % districtColors.length];
  };

  const checkpointColor = getCheckpointColor(activeCheckpoint);
  const checkpointName = activeCheckpoint?.name || 'Scanner';
  const checkpointIcon = activeCheckpoint?.zootopiaIcon || '📍';

  const startScanner = async (cameraId: string) => {
    if (!html5QrCodeRef.current) return;
    setIsCameraLoading(true);
    try {
      // Stop scanner if already running
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (e) {}

    try {
      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          await onScanSuccess(decodedText);
        },
        () => {
          // Verbose error callback, ignore.
        }
      );
      
      setIsScannerActive(true);
      setIsTorchOn(false);

      // Check flashlight/torch capability
      try {
        const capabilities = html5QrCodeRef.current.getRunningTrackCapabilities() as any;
        setHasTorch('torch' in capabilities);
      } catch (e) {
        setHasTorch(false);
      }
    } catch (err) {
      console.error("Failed to start camera scanner", err);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (e) {}
    setIsScannerActive(false);
    setIsTorchOn(false);
  };

  const flipCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    if (isScannerActive) {
      await startScanner(cameras[nextIndex].id);
    }
  };

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !html5QrCodeRef.current.isScanning) return;
    try {
      const nextTorchState = !isTorchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorchState } as any]
      });
      setIsTorchOn(nextTorchState);
    } catch (err) {
      console.error("Failed to toggle flashlight", err);
    }
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;
    let isMounted = true;

    // Wait a brief moment to ensure container mounts
    const timeoutId = setTimeout(() => {
      Html5Qrcode.getCameras().then(devices => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          
          // Default to back/rear camera if available
          const backCamIndex = devices.findIndex(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment') ||
            device.label.toLowerCase().includes('rear')
          );
          
          const defaultIndex = backCamIndex !== -1 ? backCamIndex : 0;
          setCurrentCameraIndex(defaultIndex);
          startScanner(devices[defaultIndex].id);
        } else {
          console.warn("No camera devices found.");
          setIsCameraLoading(false);
        }
      }).catch(err => {
        console.error("Error enumerating cameras:", err);
        if (isMounted) {
          setIsCameraLoading(false);
        }
      });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current || !activeCheckpoint) return;
    isProcessingRef.current = true;

    // Stop camera feed to save resources/battery during stamp confirmation card view
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      setIsScannerActive(false);
    } catch (e) {}
    setIsTorchOn(false);

    try {
      const data = JSON.parse(decodedText);
      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: data.participantId,
          huntId: data.huntId,
          checkpointId: activeCheckpoint.id
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus('success');
        setParticipantName(result.participantName);
        setHouse(result.speciesAvatar || 'ควาย (Bogo)'); 
        setMessage('Stamp recorded successfully!');

        const newScan: RecentScan = {
          id: result.stampId || Math.random().toString(),
          checkpointId: activeCheckpoint.id,
          participantName: result.participantName,
          nickname: result.nickname || '',
          house: result.speciesAvatar || 'ควาย (Bogo)',
          stampedAt: result.stampedAt || new Date().toISOString()
        };
        setRecentScans(prev => [newScan, ...prev.slice(0, 9)]);
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
  };

  const resetScanner = () => {
    setStatus('scanning');
    setMessage('');
    setParticipantName('');
    setHouse('');
    setStampedAt('');
    isProcessingRef.current = false;
    
    // Automatically resume scanning
    if (cameras.length > 0 && currentCameraIndex !== -1) {
      startScanner(cameras[currentCameraIndex].id);
    }
  };

  // Google Wallet Carousel scroll/swipe handler
  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const clientWidth = e.currentTarget.clientWidth;
    const cardElements = e.currentTarget.children;
    if (cardElements.length <= 1) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    const containerCenter = scrollLeft + clientWidth / 2;

    for (let i = 0; i < cardElements.length; i++) {
      const child = cardElements[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIdx) {
      setActiveIdx(closestIndex);
    }
  };

  // Click card to center it
  const selectCard = (idx: number) => {
    setActiveIdx(idx);
    const container = carouselRef.current;
    if (container) {
      const card = container.children[idx] as HTMLElement;
      if (card) {
        const targetScroll = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  };

  const activeRecentScans = recentScans.filter(scan => scan.checkpointId === activeCheckpoint?.id);
  const houseConfig = houses[house] || houses['ควาย (Bogo)'];

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Google Wallet Style Carousel */}
      {status === 'scanning' && checkpoints.length > 0 && (
        <div className="w-full relative mb-4">
          <div 
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-12 py-3 w-full scrollbar-none scroll-smooth items-center min-h-[140px]"
          >
            {checkpoints.map((cp, idx) => {
              const color = getCheckpointColor(cp);
              const isActive = idx === activeIdx;
              return (
                <div 
                  key={cp.id}
                  onClick={() => selectCard(idx)}
                  className={`
                    snap-center shrink-0 w-[240px] sm:w-[270px] aspect-[1.586/1] rounded-2xl p-4 border flex flex-col justify-between relative shadow-lg transition-all duration-300 cursor-pointer select-none
                    ${isActive 
                      ? 'scale-105 bg-passport-navy text-white shadow-2xl border-[3px]' 
                      : 'scale-95 border-paper-border bg-passport-ivory paper-texture text-sepia-ink opacity-40'}
                  `}
                  style={isActive ? { borderColor: color } : {}}
                >
                  <div className="absolute inset-0 paper-texture opacity-[0.03] mix-blend-overlay pointer-events-none rounded-2xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl bg-white/10 w-9 h-9 flex items-center justify-center rounded-lg">{cp.zootopiaIcon || '📍'}</span>
                      <div className="text-left">
                        <p className={`font-playfair font-bold text-xs leading-tight truncate max-w-[120px] ${isActive ? 'text-passport-ivory' : 'text-passport-navy'}`}>{cp.name}</p>
                        <p className="font-mono text-[7px] tracking-widest text-seal-gold/80 uppercase mt-0.5">ZPD Scanner Badge</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[7px] font-sans font-bold uppercase tracking-wider ${cp.type === 'daily_attendance' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'bg-green-600/20 text-green-500 border border-green-500/30'}`}>
                      {cp.type === 'daily_attendance' ? '📅 Attendance' : '🛡️ Badge'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                    <div className="text-left">
                      <p className="text-[6px] font-sans font-bold text-muted-sepia uppercase tracking-widest leading-none mb-1">Assigned Hunt</p>
                      <p className="text-[9px] font-sarabun font-bold text-seal-gold leading-none truncate max-w-[130px]">{cp.hunt.name}</p>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-1 bg-seal-gold text-passport-navy px-2 py-0.5 rounded-full text-[8px] font-bold animate-pulse">
                        <div className="w-1 h-1 rounded-full bg-passport-navy"></div> active
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicator dots */}
          {checkpoints.length > 1 && (
            <div className="flex justify-center gap-1 mt-1.5">
              {checkpoints.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectCard(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIdx ? 'bg-seal-gold w-3.5' : 'bg-white/20'}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Camera Viewport */}
      <div className={`w-full aspect-square relative rounded-2xl overflow-hidden bg-black ${status !== 'scanning' ? 'hidden' : ''}`}>
        
        {/* Standby screen when camera stream is stopped */}
        {!isScannerActive && !isCameraLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#1a1c1e] text-passport-ivory text-center">
            <div className="absolute inset-4 border border-[#ffffff]/5 rounded-xl pointer-events-none"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-45 mb-2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="font-mono text-[10px] tracking-widest text-[#C9A84C] opacity-60 uppercase">Camera Standby</span>
          </div>
        )}

        {/* Loading Overlay */}
        {isScannerActive && isCameraLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-passport-ivory">
            <div className="w-10 h-10 border-4 border-seal-gold border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-mono text-[10px] tracking-widest text-seal-gold/70">INITIALIZING CAMERA...</p>
          </div>
        )}

        {/* Reader viewport where Html5Qrcode embeds video */}
        <div id="reader" className="w-full h-full border-none [&>div]:border-none [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
        
        {/* Custom viewport overlays */}
        {isScannerActive && !isCameraLoading && (
          <>
            {/* Animated Bracket Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 animate-viewfinder-pulse p-4" style={{ color: checkpointColor }}>
              <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-current rounded-tl-lg opacity-80"></div>
              <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-current rounded-tr-lg opacity-80"></div>
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-current rounded-bl-lg opacity-80"></div>
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-current rounded-br-lg opacity-80"></div>
              
              <div className="absolute top-2 left-2 text-xl opacity-50">{checkpointIcon}</div>
              <div className="absolute top-2 right-2 text-xl opacity-50">{checkpointIcon}</div>
              <div className="absolute bottom-2 left-2 text-xl opacity-50">{checkpointIcon}</div>
              <div className="absolute bottom-2 right-2 text-xl opacity-50">{checkpointIcon}</div>
            </div>

            {/* Scan Line */}
            <div 
              className="absolute top-0 left-0 w-full h-1 z-20 animate-scan-sweep" 
              style={{ 
                backgroundColor: checkpointColor, 
                boxShadow: `0 0 12px 4px ${checkpointColor}99`,
                opacity: 0.6 
              }}
            ></div>
          </>
        )}
      </div>

      {/* Control Bar UNDER the scanner frame */}
      {status === 'scanning' && (
        <div className="flex justify-center items-center gap-6 mt-4 px-4">
          {/* Close / Open Camera Toggle */}
          <button
            type="button"
            onClick={isScannerActive ? stopScanner : () => {
              if (cameras.length > 0 && currentCameraIndex !== -1) {
                startScanner(cameras[currentCameraIndex].id);
              }
            }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl min-w-[70px] transition active:scale-95 border cursor-pointer bg-passport-ivory paper-texture shadow-sm ${isScannerActive ? 'border-ink-red/30 text-ink-red hover:bg-ink-red/5' : 'border-seal-gold/30 text-seal-gold hover:bg-seal-gold/5'}`}
          >
            {isScannerActive ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Close</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Open</span>
              </>
            )}
          </button>

          {/* Flip Camera Button */}
          <button
            type="button"
            onClick={flipCamera}
            disabled={cameras.length <= 1 || !isScannerActive}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl min-w-[75px] bg-passport-navy text-seal-gold border border-seal-gold/30 transition active:scale-95 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none hover:bg-passport-navy/90"
            title="Flip Camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Flip</span>
          </button>

          {/* Flashlight/Torch Toggle */}
          <button
            type="button"
            onClick={toggleTorch}
            disabled={!hasTorch || !isScannerActive}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl min-w-[70px] transition active:scale-95 border cursor-pointer bg-passport-ivory paper-texture shadow-sm ${!hasTorch || !isScannerActive ? 'opacity-40 pointer-events-none border-gray-200 text-gray-400' : isTorchOn ? 'border-seal-gold text-seal-gold bg-seal-gold/5 shadow-inner' : 'border-[#8c765c]/30 text-sepia-ink hover:bg-[#8c765c]/5'}`}
            title={hasTorch ? "Toggle Flashlight" : "Flashlight Unsupported"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{isTorchOn ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div className="flex flex-col w-full">
          <div className="text-center mt-6">
            <p className="font-mono uppercase text-seal-gold/70 tracking-widest text-xs mb-4">
              SCAN RECRUIT FOR {checkpointName.toUpperCase()}
            </p>
            
            <div className="bg-passport-ivory paper-texture p-4 rounded-xl shadow-lg border border-paper-border opacity-90 mx-4">
              <p className="font-sarabun text-muted-sepia text-center italic text-xs">
                {!isScannerActive ? 'Camera is offline. Start camera to begin.' : 'Waiting for QR Code...'}
              </p>
            </div>
          </div>

          {/* Log of recently scanned recruits at this active checkpoint */}
          <div className="mt-6 px-4 w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px bg-paper-border/40 flex-grow"></span>
              <span className="font-mono text-[10px] font-bold text-seal-gold/70 tracking-widest uppercase">
                SCANS AT {checkpointName.toUpperCase()}
              </span>
              <span className="h-px bg-paper-border/40 flex-grow"></span>
            </div>

            {activeRecentScans.length > 0 ? (
              <div className="space-y-2.5">
                {activeRecentScans.map(scan => {
                  const config = houses[scan.house] || houses['ควาย (Bogo)'];
                  return (
                    <div key={scan.id} className="bg-passport-ivory paper-texture p-3 rounded-xl border border-paper-border flex items-center justify-between shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-paper-border overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-seal-gold/30">
                          <img src={config.image} alt={config.name} className="w-2/3 h-2/3 object-cover" />
                        </div>
                        <div className="text-left">
                          <div className="font-sarabun font-bold text-sepia-ink text-xs leading-none">
                            {scan.participantName}
                          </div>
                          <div className="text-[9px] font-sarabun text-muted-sepia flex items-center gap-1.5 mt-1">
                            <span className={`px-1 rounded-[3px] text-[7px] font-bold text-white uppercase ${config.bgClass}`}>
                              {config.name}
                            </span>
                            <span>({scan.nickname})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[9px] text-muted-sepia bg-passport-navy/5 px-1.5 py-0.5 rounded border border-paper-border font-bold">
                          {new Date(scan.stampedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-paper-border rounded-xl italic font-sarabun text-xs text-muted-sepia bg-white/40">
                No recent scans at this checkpoint yet.
              </div>
            )}
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
                <span className="font-sans text-xs font-bold tracking-[0.2em] absolute -top-8 left-1/2 -translate-x-1/2 w-max" style={{ color: checkpointColor }}>VERIFIED</span>
                
                <div 
                  className="w-[140px] h-[140px] rounded-full border-4 flex flex-col items-center justify-center p-2 stamp-edge animate-stamp-slam"
                  style={{ 
                    '--stamp-rotate': '-5deg', 
                    transform: 'rotate(var(--stamp-rotate))',
                    borderColor: checkpointColor,
                    color: checkpointColor
                  } as React.CSSProperties}
                >
                  <div className="absolute inset-1 border-2 border-current rounded-full opacity-60"></div>
                  <div className="absolute top-4 w-full text-center px-4">
                    <span className="font-sans text-[10px] font-bold uppercase leading-tight line-clamp-1">{checkpointName}</span>
                  </div>
                  <span className="text-5xl mt-1 opacity-90 drop-shadow-sm">{checkpointIcon}</span>
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
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-passport-navy font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-passport-navy/20 cursor-pointer"
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
                className="w-full bg-district-desert text-white font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-black/20 cursor-pointer"
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
                className="w-full bg-ink-red text-white font-sarabun font-bold text-lg py-4 rounded-full transition-all shadow-md active:scale-95 border-b-4 border-black/20 cursor-pointer"
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
