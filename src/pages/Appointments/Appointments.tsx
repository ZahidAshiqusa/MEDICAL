import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaIdCard, FaPhone, FaStickyNote, FaUserMd, FaCheck, FaArrowLeft, FaBirthdayCake } from 'react-icons/fa';
import TokenCard from '../../components/TokenCard/TokenCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { apiPost } from '../../hooks/useApi';
import type { Appointment, StaffMember } from '../../utils/types';
import styles from './Appointments.module.css';

function Appointments() {
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState({
    patientName: '',
    idCard: '',
    age: '',
    phone: '',
    issue: '',
    doctor: 'Regular'
  });

  useEffect(() => {
    fetch('/api/staff')
      .then(r => r.json())
      .then((staff: StaffMember[]) => {
        setDoctors(staff.filter(s => s.role === 'doctor'));
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiPost<Appointment>('/api/appointments', {
        ...form,
        age: Number(form.age)
      });
      setSubmittedAppointment(result);
    } catch (err) {
      alert('Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedAppointment(null);
    setForm({ patientName: '', idCard: '', age: '', phone: '', issue: '', doctor: 'Regular' });
  };

  if (submittedAppointment) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <FaCheck />
            </div>
            <h2 className={styles.successTitle}>Appointment Booked Successfully!</h2>
            <p className={styles.successDesc}>Your token card is ready. Download it for your records.</p>
          </div>
          <TokenCard appointment={submittedAppointment} />
          <button onClick={handleReset} className={styles.backBtn}>
            <FaArrowLeft /> Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Book an Appointment</h1>
          <p className={styles.subtitle}>Fill in your details below to get your appointment token</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label><FaUser /> Patient Name *</label>
              <input
                type="text"
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label><FaIdCard /> ID Card Number (Optional)</label>
              <input
                type="text"
                name="idCard"
                value={form.idCard}
                onChange={handleChange}
                placeholder="e.g. 36102-1234567-1"
              />
            </div>

            <div className={styles.formGroup}>
              <label><FaBirthdayCake /> Age *</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="1"
                max="150"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label><FaPhone /> Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 0300-1234567"
                required
              />
            </div>

            <div className={styles.formGroupFull}>
              <label><FaUserMd /> Select Doctor (Optional)</label>
              {loadingDoctors ? (
                <input type="text" value="Loading doctors..." disabled />
              ) : (
                <select name="doctor" value={form.doctor} onChange={handleChange}>
                  <option value="Regular">Regular (General)</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>
                      Dr. {d.name} {d.field ? `(${d.field})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.formGroupFull}>
              <label><FaStickyNote /> Issue / Reason for Visit *</label>
              <textarea
                name="issue"
                value={form.issue}
                onChange={handleChange}
                placeholder="Describe your health issue or reason for visit..."
                rows={4}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? (
              <>
                <LoadingSpinner /> Processing...
              </>
            ) : (
              <>
                <FaCalendarAlt /> Submit & Get Token
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Appointments;
