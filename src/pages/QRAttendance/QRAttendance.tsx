import { useState, useEffect } from 'react';
import { FaQrcode, FaUserCheck, FaClipboardCheck, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import PasswordGate from '../../components/PasswordGate/PasswordGate';
import QRScanner from '../../components/QRScanner/QRScanner';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost } from '../../hooks/useApi';
import { formatTime, capitalizeFirst } from '../../utils/formatters';
import type { StaffMember, AttendanceRecord } from '../../utils/types';
import styles from './QRAttendance.module.css';

interface ScanResult {
  type: 'success' | 'error' | 'duplicate';
  message: string;
  name?: string;
  time?: string;
}

function QRAttendance() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayCount, setTodayCount] = useState(0);

  const fetchData = async () => {
    try {
      const [sRes, aRes] = await Promise.all([fetch('/api/staff'), fetch('/api/attendance')]);
      const staffData = await sRes.json();
      const attData = await aRes.json();
      setStaff(staffData);
      setAttendance(attData);
      const today = new Date().toDateString();
      setTodayCount(attData.filter((r: AttendanceRecord) => new Date(r.checkIn).toDateString() === today).length);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleQrScan = async (data: string) => {
    const member = staff.find(s => s.id === data);
    if (!member) {
      setScanResult({ type: 'error', message: `Staff ID not found: ${data}` });
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    // Check if already marked today
    const today = new Date().toDateString();
    const alreadyMarked = attendance.some(
      r => r.staffId === member.id && new Date(r.checkIn).toDateString() === today
    );
    if (alreadyMarked) {
      setScanResult({ type: 'duplicate', message: `${member.name} already checked in today` });
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    try {
      const record = await apiPost<AttendanceRecord>('/api/attendance', {
        staffId: member.id,
        staffName: member.name,
        role: member.role,
        field: member.field
      });
      setScanResult({
        type: 'success',
        message: 'Attendance marked successfully',
        name: member.name,
        time: formatTime(record.checkIn)
      });
      setTimeout(() => setScanResult(null), 3000);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message.includes('409')
        ? `${member.name} already checked in today`
        : 'Failed to mark attendance';
      setScanResult({ type: 'error', message: msg });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const todayRecords = attendance
    .filter(r => new Date(r.checkIn).toDateString() === new Date().toDateString())
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  if (loading) return <div style={{ padding: '3rem' }}><LoadingSpinner message="Loading..." /></div>;

  return (
    <PasswordGate passwordEnvKey="VITE_ATTENDANCE_PASSWORD" storageKey="qr_attendance_auth" title="QR Attendance">
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>QR Code Attendance</h1>
              <p className={styles.subtitle}>Scan staff QR codes to mark attendance</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.counterBadge}>
                <FaUserCheck />
                <span>{todayCount} checked in today</span>
              </div>
            </div>
          </div>

          {/* Scan Result Notification */}
          {scanResult && (
            <div className={`${styles.resultBanner} ${styles[scanResult.type]}`}>
              {scanResult.type === 'success' && <FaCheckCircle className={styles.resultIcon} />}
              {scanResult.type === 'error' && <FaExclamationTriangle className={styles.resultIcon} />}
              {scanResult.type === 'duplicate' && <FaExclamationTriangle className={styles.resultIcon} />}
              <div>
                <p className={styles.resultMessage}>{scanResult.message}</p>
                {scanResult.name && (
                  <p className={styles.resultDetail}>{scanResult.name} - {scanResult.time}</p>
                )}
              </div>
              <button onClick={() => setScanResult(null)} className={styles.resultClose}><FaTimes /></button>
            </div>
          )}

          {/* Scanner Section */}
          <div className={styles.scannerSection}>
            {!scannerOpen ? (
              <div className={styles.scannerPlaceholder}>
                <FaQrcode className={styles.bigQrIcon} />
                <p>Camera is off</p>
                <button onClick={() => setScannerOpen(true)} className={styles.startBtn}>
                  <FaQrcode /> Start Scanning
                </button>
              </div>
            ) : (
              <div className={styles.scannerWrapper}>
                <QRScanner onScan={handleQrScan} onClose={() => setScannerOpen(false)} />
              </div>
            )}
          </div>

          {/* Today's Records */}
          <div className={styles.recordsSection}>
            <h3 className={styles.sectionTitle}>
              <FaClipboardCheck /> Today's Check-ins ({todayRecords.length})
            </h3>
            <div className={styles.recordList}>
              {todayRecords.length === 0 ? (
                <p className={styles.noRecords}>No one has checked in today</p>
              ) : todayRecords.map(r => (
                <div key={r.id} className={styles.recordItem}>
                  <div className={styles.recordLeft}>
                    <div className={styles.recordAvatar}>
                      {r.staffName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className={styles.recordName}>{r.staffName}</span>
                      <span className={styles.recordRole}>{capitalizeFirst(r.role)}</span>
                    </div>
                  </div>
                  <span className={styles.recordTime}>{formatTime(r.checkIn)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}

export default QRAttendance;
