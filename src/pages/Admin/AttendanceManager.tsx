import { useState, useEffect } from 'react';
import { FaTrash, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiDelete } from '../../hooks/useApi';
import { formatDateTime, capitalizeFirst } from '../../utils/formatters';
import type { AttendanceRecord } from '../../utils/types';
import styles from './StaffManager.module.css';

function AttendanceManager() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    try { const r = await fetch('/api/attendance'); setRecords(await r.json()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance record?')) return;
    try { await apiDelete('/api/attendance', { id }); fetchRecords(); } catch { alert('Failed'); }
  };

  const filtered = records.filter(r =>
    r.staffName.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  if (loading) return <LoadingSpinner message="Loading attendance..." />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Staff Name</th><th>Role</th><th>Field</th><th>Check-In</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No attendance records found</td></tr> :
              filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.staffName}</strong></td>
                  <td><span className={`${styles.roleBadge} ${styles[`role_${r.role}`] || ''}`}>{capitalizeFirst(r.role)}</span></td>
                  <td>{r.field || '-'}</td>
                  <td>{formatDateTime(r.checkIn)}</td>
                  <td>{r.notes || '-'}</td>
                  <td><button onClick={() => handleDelete(r.id)} className={styles.deleteBtn} title="Delete"><FaTrash /></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className={styles.stats}>Total Records: <strong>{records.length}</strong></div>
    </div>
  );
}

export default AttendanceManager;
