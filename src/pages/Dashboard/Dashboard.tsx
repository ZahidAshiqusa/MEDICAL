import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClipboardCheck, FaExclamationTriangle, FaChartBar, FaFilter, FaCheckCircle } from 'react-icons/fa';
import PasswordGate from '../../components/PasswordGate/PasswordGate';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { isToday, isThisWeek, isThisMonth, isThisYear, capitalizeFirst } from '../../utils/formatters';
import type { Appointment, AttendanceRecord, Complaint, StaffMember, TimeFilter } from '../../utils/types';
import styles from './Dashboard.module.css';

function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [apptFilter, setApptFilter] = useState<TimeFilter>('day');
  const [apptDoctor, setApptDoctor] = useState('all');
  const [attFilter, setAttFilter] = useState<TimeFilter>('day');
  const [attRoleFilter, setAttRoleFilter] = useState('all');
  const [attSearch, setAttSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/attendance').then(r => r.json()),
      fetch('/api/complaints').then(r => r.json()),
      fetch('/api/staff').then(r => r.json())
    ]).then(([a, at, c, s]) => {
      setAppointments(a);
      setAttendance(at);
      setComplaints(c);
      setDoctors(s.filter((m: StaffMember) => m.role === 'doctor'));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filterByTime = <T extends { createdAt?: string; checkIn?: string }>(items: T[], filter: TimeFilter, dateKey: 'createdAt' | 'checkIn'): T[] => {
    const fn = filter === 'day' ? isToday : filter === 'week' ? isThisWeek : filter === 'month' ? isThisMonth : isThisYear;
    return items.filter(i => {
      const dateVal = dateKey === 'createdAt' ? (i as Record<string, string>).createdAt : (i as Record<string, string>).checkIn;
      return dateVal ? fn(dateVal) : false;
    });
  };

  const filteredAppts = (() => {
    let result = filterByTime(appointments, apptFilter, 'createdAt');
    if (apptDoctor !== 'all') result = result.filter(a => a.doctor === apptDoctor);
    return result;
  })();

  const filteredAttendance = (() => {
    let result = filterByTime(attendance, attFilter, 'checkIn');
    if (attRoleFilter !== 'all') result = result.filter(r => r.role === attRoleFilter);
    if (attSearch) result = result.filter(r => r.staffName.toLowerCase().includes(attSearch.toLowerCase()));
    return result;
  })();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.resolved).length;
  const resolvePercent = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

  if (loading) return <div style={{ padding: '3rem' }}><LoadingSpinner message="Loading dashboard..." /></div>;

  return (
    <PasswordGate passwordEnvKey="VITE_DASHBOARD_PASSWORD" storageKey="dashboard_auth" title="Dashboard">
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <FaChartBar className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Analytics Dashboard</h1>
              <p className={styles.subtitle}>View hospital statistics and performance metrics</p>
            </div>
          </div>

          {/* Appointments Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><FaCalendarAlt /> Appointments</h2>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <FaFilter />
                  <select value={apptFilter} onChange={e => setApptFilter(e.target.value as TimeFilter)}>
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <select value={apptDoctor} onChange={e => setApptDoctor(e.target.value)}>
                    <option value="all">All Doctors</option>
                    <option value="Regular">Regular</option>
                    {doctors.map(d => <option key={d.id} value={d.name}>Dr. {d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statPrimary}`}>
                <span className={styles.statValue}>{filteredAppts.length}</span>
                <span className={styles.statLabel}>Total Appointments</span>
              </div>
              <div className={`${styles.statCard} ${styles.statInfo}`}>
                <span className={styles.statValue}>{filteredAppts.filter(a => a.doctor === 'Regular').length}</span>
                <span className={styles.statLabel}>Regular</span>
              </div>
              <div className={`${styles.statCard} ${styles.statAccent}`}>
                <span className={styles.statValue}>{filteredAppts.filter(a => a.doctor !== 'Regular').length}</span>
                <span className={styles.statLabel}>Specialist</span>
              </div>
            </div>
          </section>

          {/* Attendance Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><FaClipboardCheck /> Attendance</h2>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <FaFilter />
                  <select value={attFilter} onChange={e => setAttFilter(e.target.value as TimeFilter)}>
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <select value={attRoleFilter} onChange={e => setAttRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="dispensor">Dispensor</option>
                    <option value="sweeper">Sweeper</option>
                    <option value="ward_staff">Ward Staff</option>
                  </select>
                </div>
                <input type="text" placeholder="Search by name..." value={attSearch} onChange={e => setAttSearch(e.target.value)} className={styles.searchMini} />
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statPrimary}`}>
                <span className={styles.statValue}>{filteredAttendance.length}</span>
                <span className={styles.statLabel}>Total Check-ins</span>
              </div>
              <div className={`${styles.statCard} ${styles.statSuccess}`}>
                <span className={styles.statValue}>{new Set(filteredAttendance.map(r => r.staffId)).size}</span>
                <span className={styles.statLabel}>Unique Staff</span>
              </div>
            </div>
          </section>

          {/* Complaints Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><FaExclamationTriangle /> Complaints Overview</h2>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statWarning}`}>
                <span className={styles.statValue}>{totalComplaints}</span>
                <span className={styles.statLabel}>Total Complaints</span>
              </div>
              <div className={`${styles.statCard} ${styles.statSuccess}`}>
                <span className={styles.statValue}>{resolvedComplaints}</span>
                <span className={styles.statLabel}><FaCheckCircle style={{ marginRight: '0.3rem' }} />Resolved</span>
              </div>
              <div className={`${styles.statCard} ${styles.statDanger}`}>
                <span className={styles.statValue}>{totalComplaints - resolvedComplaints}</span>
                <span className={styles.statLabel}>Pending</span>
              </div>
            </div>
            {totalComplaints > 0 && (
              <div className={styles.progressWrap}>
                <div className={styles.progressInfo}>
                  <span>Resolution Rate</span>
                  <span>{resolvePercent}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${resolvePercent}%` }}></div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </PasswordGate>
  );
}

export default Dashboard;
