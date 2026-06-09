'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

type ScanStatus = 'scanning' | 'success' | 'error' | 'already_stamped';

export default function ScannerUI() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [message, setMessage] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  
  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }, false);

    scannerRef.current = scanner;

    scanner.render(async (decodedText) => {
      // Pause scanner while processing
      scanner.pause(true);
      
      try {
        const data = JSON.parse(decodedText);
        
        // Call API
        const res = await fetch('/api/stamp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok) {
          setStatus('success');
          setParticipantName(result.participantName);
          setAvatar(result.speciesAvatar);
          setMessage('Stamp recorded successfully!');
        } else if (result.error === 'Already stamped') {
          setStatus('already_stamped');
          setParticipantName(result.participantName);
          setMessage(`Already stamped on ${new Date(result.stampedAt).toLocaleTimeString()}`);
        } else {
          setStatus('error');
          setMessage(result.error || 'Invalid QR code.');
        }

      } catch (err) {
        setStatus('error');
        setMessage('Unrecognized QR code format.');
      }
    }, (error) => {
      // ignore scanning errors during active scan
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const resetScanner = () => {
    setStatus('scanning');
    setMessage('');
    setParticipantName('');
    setAvatar('');
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200 text-center">
        <h2 className="font-bold text-zpd-navy text-lg">Verify Recruit</h2>
        <p className="text-sm text-slate-500">Scan participant badge</p>
      </div>
      
      <div className={`w-full aspect-square relative ${status !== 'scanning' ? 'hidden' : ''}`}>
        <div id="reader" className="w-full h-full border-none [&>div]:border-none"></div>
      </div>

      {status !== 'scanning' && (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white aspect-square">
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
              <div className="text-4xl mb-2">{avatar}</div>
              <h3 className="text-2xl font-bold text-zpd-navy mb-1">{participantName}</h3>
              <p className="text-green-600 font-bold mb-6">{message}</p>
            </>
          )}

          {status === 'already_stamped' && (
            <>
              <AlertCircle className="w-20 h-20 text-zoo-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-zpd-navy mb-1">{participantName}</h3>
              <p className="text-zoo-amber-600 font-bold mb-6">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-600 mb-2">Scan Failed</h3>
              <p className="text-slate-600 font-medium mb-6">{message}</p>
            </>
          )}

          <button 
            onClick={resetScanner}
            className="flex items-center gap-2 bg-zpd-navy hover:bg-zoo-blue-900 text-white px-6 py-3 rounded-full font-bold transition-transform hover:scale-105"
          >
            <RefreshCw size={18} />
            Scan Next Recruit
          </button>
        </div>
      )}
    </div>
  );
}
