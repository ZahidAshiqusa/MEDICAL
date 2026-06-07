import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { formatDateTime } from '../../utils/formatters';
import type { Appointment, StaffMember } from '../../utils/types';
import styles from './StaffManager.module.css';

function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingToken, setEditingToken] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ patientName: '', idCard: '', age: '', phone: '', issue: '', doctor: 'Regular' });

  const fetchData = async () => {
    try {
      const [apptRes, staffRes] = await Promise.all([fetch('/api/appointments'), fetch('/api/staff')]);
      setAppointments(await apptRes.json());
      const staff: StaffMember[] = await staffRes.json();
      setDoctors(staff.filter(s => s.role === 'doctor'));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingToken) {
        await apiPut('/api/appointments', { ...form, tokenNumber: editingToken, age: Number(form.age) });
      } else {
        await apiPost('/api/appointments', { ...form, age: Number(form.age) });
      }
      setForm({ patientName: '', idCard: '', age: '', phone: '', issue: '', doctor: 'Regular' });
      setShowForm(false);
      setEditingToken(null);
      fetchData();
    } catch { alert('Failed'); } finally { setSubmitting(false); }
  };

  const handleEdit = (a: Appointment) => {
    setForm({ patientName: a.patientName, idCard: a.idCard || '', age: String(a.age), phone: a.phone, issue: a.issue, doctor: a.doctor });
    setEditingToken(a.tokenNumber);
    setShowForm(true);
  };

  const handleDelete = async (tokenNumber: number) => {
    if (!confirm(`Delete appointment #${tokenNumber}?`)) return;
    try { await apiDelete('/api/appointments', { tokenNumber: String(tokenNumber) }); fetchData(); } catch { alert('Failed'); }
  };

  const filtered = appointments.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    String(a.tokenNumber).includes(search) ||
    a.doctor.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.tokenNumber - a.tokenNumber);

  if (loading) return <LoadingSpinner message="Loading appointments..." />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, token#, or doctor..." value={search} onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingToken(null); setForm({ patientName: '', idCard: '', age: '', phone: '', issue: '', doctor: 'Regular' }); }} className={styles.addBtn}>
          <FaPlus /> {editingToken ? 'Cancel' : 'Add Appointment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.formTitle}>{editingToken ? `Edit Appointment #${editingToken}` : 'New Appointment'}</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}><label>Patient Name *</label><input type="text" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} required /></div>
            <div className={styles.formGroup}><label>ID Card</label><input type="text" value={form.idCard} onChange={e => setForm({...form, idCard: e.target.value})} /></div>
            <div className={styles.formGroup}><label>Age *</label><input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required min="1" /></div>
            <div className={styles.formGroup}><label>Phone *</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
            <div className={styles.formGroup}><label>Doctor</label>
              <select value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}>
                <option value="Regular">Regular</option>
                {doctors.map(d => <option key={d.id} value={d.name}>Dr. {d.name}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}><label>Issue *</label><input type="text" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} required /></div>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => { setShowForm(false); setEditingToken(null); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : editingToken ? 'Update' : <><FaPlus /> Add</>}</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Token#</th><th>Patient</th><th>Age</th><th>Phone</th><th>Doctor</th><th>Issue</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No appointments found</td></tr> :
              filtered.map(a => (
                <tr key={a.tokenNumber}>
                  <td><strong>#{a.tokenNumber}</strong></td>
                  <td>{a.patientName}</td>
                  <td>{a.age}</td>
                  <td>{a.phone}</td>
                  <td>{a.doctor}</td>
                  <td>{a.issue}</td>
                  <td>{formatDateTime(a.createdAt)}</td>
                  <td style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => handleEdit(a)} className={styles.qrBtn} title="Edit"><FaEdit /></button>
                    <button onClick={() => handleDelete(a.tokenNumber)} className={styles.deleteBtn} title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className={styles.stats}>Total Appointments: <strong>{appointments.length}</strong></div>
    </div>
  );
}

export default AppointmentManager;
