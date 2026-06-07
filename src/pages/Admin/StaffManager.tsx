import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSearch, FaQrcode, FaIdBadge } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost, apiDelete } from '../../hooks/useApi';
import { formatStaffId, capitalizeFirst, formatDate } from '../../utils/formatters';
import type { StaffMember } from '../../utils/types';
import styles from './StaffManager.module.css';

function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQr, setShowQr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: 'doctor', field: '', phone: '' });

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      setStaff(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPost('/api/staff', form);
      setForm({ name: '', role: 'doctor', field: '', phone: '' });
      setShowForm(false);
      fetchStaff();
    } catch { alert('Failed to add staff'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await apiDelete('/api/staff', { id });
      fetchStaff();
    } catch { alert('Failed to delete'); }
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search)
  );

  if (loading) return <LoadingSpinner message="Loading staff..." />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, role, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
          <FaPlus /> Add Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className={styles.form}>
          <h3 className={styles.formTitle}>Add New Staff Member</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Enter name" />
            </div>
            <div className={styles.formGroup}>
              <label>Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="dispensor">Dispensor</option>
                <option value="sweeper">Sweeper</option>
                <option value="ward_staff">Ward Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Field / Specialization</label>
              <input type="text" value={form.field} onChange={e => setForm({...form, field: e.target.value})} placeholder="e.g. Cardiology" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Adding...' : <><FaPlus /> Add Staff</>}
            </button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Field</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>QR</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No staff members found
              </td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td><span className={styles.staffId}><FaIdBadge /> {formatStaffId(s.id)}</span></td>
                <td><strong>{s.name}</strong></td>
                <td><span className={`${styles.roleBadge} ${styles[`role_${s.role}`] || ''}`}>{capitalizeFirst(s.role)}</span></td>
                <td>{s.field || '-'}</td>
                <td>{s.phone || '-'}</td>
                <td>{formatDate(s.joined)}</td>
                <td>
                  <button onClick={() => setShowQr(showQr === s.id ? null : s.id)} className={styles.qrBtn} title="Show QR Code">
                    <FaQrcode />
                  </button>
                  {showQr === s.id && (
                    <div className={styles.qrPopup}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${s.id}`} alt="QR Code" />
                      <p>Staff ID: {s.id}</p>
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(s.id, s.name)} className={styles.deleteBtn} title="Delete">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.stats}>
        Total Staff: <strong>{staff.length}</strong>
      </div>
    </div>
  );
}

export default StaffManager;
