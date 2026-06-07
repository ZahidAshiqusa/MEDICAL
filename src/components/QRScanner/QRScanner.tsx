import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaTimes, FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCamera, setActiveCamera] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScanRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSuccessSound = useCallback(() => {
    // Create a short beep using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const startScanner = useCallback(async (cameraIndex: number) => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }

    try {
      const availableCameras = await Html5Qrcode.getCameras();
      if (availableCameras.length === 0) {
        setErrorMsg('No cameras found');
        return;
      }
      setCameras(availableCameras);

      const camIdx = Math.min(cameraIndex, availableCameras.length - 1);
      const scanner = new Html5Qrcode('qr-reader', { verbose: false });

      await scanner.start(
        availableCameras[camIdx].id,
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (decodedText === lastScanRef.current) return;
          lastScanRef.current = decodedText;
          playSuccessSound();
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            lastScanRef.current = '';
          }, 2000);
          onScan(decodedText);
        },
        () => {} // ignore scan errors
      );

      scannerRef.current = scanner;
      setScanning(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to start camera. Please grant camera permissions.');
    }
  }, [onScan, playSuccessSound]);

  useEffect(() => {
    startScanner(activeCamera);
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const next = (activeCamera + 1) % cameras.length;
    setActiveCamera(next);
    await startScanner(next);
  };

  const handleClose = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.scanner} onClick={e => e.stopPropagation()}>
        <div className={styles.topBar}>
          <h3 className={styles.title}>Scan QR Code</h3>
          <div className={styles.controls}>
            {cameras.length > 1 && (
              <button onClick={switchCamera} className={styles.controlBtn} title="Switch Camera">
                <FaSyncAlt />
              </button>
            )}
            <button onClick={handleClose} className={styles.controlBtn} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className={styles.viewer}>
          <div id="qr-reader" className={styles.reader}></div>
          <div className={styles.scanLine}></div>
          
          {success && (
            <div className={styles.successOverlay}>
              <FaCheckCircle className={styles.successIcon} />
              <p className={styles.successText}>Scanned Successfully!</p>
            </div>
          )}
        </div>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        <p className={styles.hint}>Point the camera at a staff QR code to mark attendance</p>
      </div>
    </div>
  );
}

export default QRScanner;
