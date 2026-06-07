import { useState, useEffect } from 'react';
import { FaSearch, FaQrcode, FaTrash, FaEdit, FaClipboardCheck, FaUserCheck, FaTimes, FaSave } from 'react-icons/fa';
import PasswordGate from '../../components/PasswordGate/PasswordGate';
import QRScanner from '../../components/QRScanner/QRScanner';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { formatDateTime, formatTime, capitalizeFirst, isToday } from '../../utils/formatters';
import type { StaffMember, AttendanceRecord } from '../../utils/types';
import styles from './Attendance.module.css';

function Attendance() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [scanNotification, setScanNotification] = useState('');

  const fetchData = async () => {
    try {
      const [sRes, aRes] = await Promise.all([fetch('/api/staff'), fetch('/api/attendance')]);
      setStaff(await sRes.json());
      setAttendance(await aRes.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const markAttendance = async (member: StaffMember) => {
    try {
      await apiPost('/api/attendance', {
        staffId: member.id,
        staffName: member.name,
        role: member.role,
        field: member.field
      });
      setScanNotification(`Attendance marked for ${member.name}`);
      setTimeout(() => setScanNotification(''), 3000);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message.includes('409')
        ? `Attendance already marked for ${member.name} today`
        : 'Failed to mark attendance';
      setScanNotification(msg);
      setTimeout(() => setScanNotification(''), 3000);
    }
  };

  const handleQrScan = (data: string) => {
    const member = staff.find(s => s.id === data);
    if (member) {
      markAttendance(member);
    } else {
      setScanNotification('Staff ID not found: ' + data);
      setTimeout(() => setScanNotification(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance record?')) return;
    try { await apiDelete('/api/attendance', { id }); fetchData(); setSelectedRecord(null); } catch { alert('Failed'); }
  };

  const handleEdit = async (record: AttendanceRecord) => {
    try { await apiPut('/api/attendance', { id: record.id, notes: editingNotes }); fetchData(); setSelectedRecord(null); } catch { alert('Failed'); }
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
  );

  const todayRecords = attendance.filter(r => isToday(r.checkIn)).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  if (loading) return <div style={{ padding: '3rem' }}><LoadingSpinner message="Loading..." /></div>;

  return (
    <PasswordGate passwordEnvKey="VITE_ATTENDANCE_PASSWORD" storageKey="attendance_auth" title="Attendance">
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Attendance Management</h1>
              <p className={styles.subtitle}>Mark and manage staff attendance</p>
            </div>
            <button onClick={() => setShowScanner(true)} className={styles.qrToggle} title="Open QR Scanner">
              <FaQrcode />
              <span>Scan QR</span>
            </button>
          </div>

          {scanNotification && (
            <div className={`${styles.notification} ${scanNotification.includes('not found') ? styles.notifError : styles.notifSuccess}`}>
              {scanNotification}
            </div>
          )}

          {/* Search by Name */}
          <div className={styles.searchSection}>
            <h3 className={styles.sectionTitle}><FaUserCheck /> Mark Attendance by Name</h3>
            <div className={styles.searchWrap}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search staff by name or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            {search && (
              <div className={styles.staffList}>
                {filteredStaff.length === 0 ? (
                  <p className={styles.noResults}>No staff members found</p>
                ) : filteredStaff.map(s => (
                  <button key={s.id} onClick={() => markAttendance(s)} className={styles.staffItem}>
                    <div className={styles.staffInfo}>
                      <span className={styles.staffName}>{s.name}</span>
                      <span className={styles.staffRole}>{capitalizeFirst(s.role)}{s.field ? ` - ${s.field}` : ''}</span>
                    </div>
                    <FaClipboardCheck className={styles.checkIcon} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Today's Attendance */}
          <div className={styles.todaySection}>
            <h3 className={styles.sectionTitle}><FaClipboardCheck /> Today's Attendance ({todayRecords.length})</h3>
            <div className={styles.recordList}>
              {todayRecords.length === 0 ? (
                <p className={styles.noResults}>No attendance records for today</p>
              ) : todayRecords.map(r => (
                <button key={r.id} onClick={() => { setSelectedRecord(r); setEditingNotes(r.notes || ''); }} className={styles.recordItem}>
                  <div className={styles.recordInfo}>
                    <span className={styles.recordName}>{r.staffName}</span>
                    <span className={styles.recordRole}>{capitalizeFirst(r.role)}</span>
                  </div>
                  <div className={styles.recordMeta}>
                    <span className={styles.recordTime}>{formatTime(r.checkIn)}</span>
                    <div className={styles.recordActions}>
                      <FaEdit className={styles.editIcon} />
                      <FaTrash className={styles.deleteIcon} onClick={e => { e.stopPropagation(); handleDelete(r.id); }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Modal */}
          {selectedRecord && (
            <div className={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>Attendance Details</h3>
                  <button onClick={() => setSelectedRecord(null)} className={styles.modalClose}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.detailRow}><span>Name:</span><strong>{selectedRecord.staffName}</strong></div>
                  <div className={styles.detailRow}><span>Role:</span><strong>{capitalizeFirst(selectedRecord.role)}</strong></div>
                  <div className={styles.detailRow}><span>Field:</span><strong>{selectedRecord.field || '-'}</strong></div>
                  <div className={styles.detailRow}><span>Check-In:</span><strong>{formatDateTime(selectedRecord.checkIn)}</strong></div>
                  <div className={styles.detailRow}><span>Staff ID:</span><strong style={{ fontFamily: 'monospace' }}>{selectedRecord.staffId}</strong></div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)} rows={3} placeholder="Add notes..." />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => handleDelete(selectedRecord.id)} className="btn btn-danger"><FaTrash /> Delete</button>
                  <button onClick={() => handleEdit(selectedRecord)} className="btn btn-primary"><FaSave /> Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* QR Scanner */}
          {showScanner && (
            <QRScanner onScan={handleQrScan} onClose={() => setShowScanner(false)} />
          )}
        </div>
      </div>
    </PasswordGate>
  );
}

export default Attendance;
