import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaSearch, FaExclamationCircle } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { formatDateTime } from '../../utils/formatters';
import type { Complaint } from '../../utils/types';
import styles from './StaffManager.module.css';

function ComplaintManager() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ patientName: '', issue: '' });

  const fetchComplaints = async () => {
    try { const r = await fetch('/api/complaints'); setComplaints(await r.json()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await apiPost('/api/complaints', form); setForm({ patientName: '', issue: '' }); setShowForm(false); fetchComplaints(); } catch { alert('Failed'); } finally { setSubmitting(false); }
  };

  const toggleResolved = async (c: Complaint) => {
    try { await apiPut('/api/complaints', { id: c.id, resolved: !c.resolved }); fetchComplaints(); } catch { alert('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this complaint?')) return;
    try { await apiDelete('/api/complaints', { id }); fetchComplaints(); } catch { alert('Failed'); }
  };

  const filtered = complaints.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()) || c.issue.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) return <LoadingSpinner message="Loading complaints..." />;

  const total = complaints.length;
  const resolved = complaints.filter(c => c.resolved).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
        </div>
        <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}><FaPlus /> Add Complaint</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className={styles.form}>
          <h3 className={styles.formTitle}>New Complaint</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}><label>Patient Name *</label><input type="text" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} required /></div>
            <div className={styles.formGroup}><label>Issue *</label><input type="text" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} required /></div>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Adding...' : <><FaPlus /> Add</>}</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Patient</th><th>Issue</th><th>Status</th><th>Date</th><th>Resolved At</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No complaints found</td></tr> :
              filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.patientName}</strong></td>
                  <td>{c.issue}</td>
                  <td>
                    <span className={c.resolved ? `${styles.roleBadge} ${styles.role_doctor}` : `${styles.roleBadge} ${styles.role_admin}`}>
                      <FaExclamationCircle style={{ marginRight: '0.3rem' }} />
                      {c.resolved ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDateTime(c.createdAt)}</td>
                  <td>{c.resolvedAt ? formatDateTime(c.resolvedAt) : '-'}</td>
                  <td style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => toggleResolved(c)} className={styles.qrBtn} title={c.resolved ? 'Mark Unresolved' : 'Mark Resolved'}>
                      {c.resolved ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className={styles.deleteBtn} title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className={styles.stats}>
        Total: <strong>{total}</strong> | Resolved: <strong>{resolved}</strong> | Pending: <strong>{total - resolved}</strong>
      </div>
    </div>
  );
}

export default ComplaintManager;
