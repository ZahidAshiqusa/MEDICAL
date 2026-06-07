import { useState } from 'react';
import { FaUsers, FaCalendarAlt, FaExclamationTriangle, FaClipboardList, FaUserShield } from 'react-icons/fa';
import PasswordGate from '../../components/PasswordGate/PasswordGate';
import StaffManager from './StaffManager';
import AppointmentManager from './AppointmentManager';
import ComplaintManager from './ComplaintManager';
import AttendanceManager from './AttendanceManager';
import styles from './Admin.module.css';

const tabs = [
  { key: 'staff', label: 'Staff', icon: <FaUsers /> },
  { key: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
  { key: 'complaints', label: 'Complaints', icon: <FaExclamationTriangle /> },
  { key: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
];

function Admin() {
  const [activeTab, setActiveTab] = useState('staff');

  return (
    <PasswordGate
      passwordEnvKey="VITE_ADMIN_PASSWORD"
      storageKey="admin_auth"
      title="Admin Panel"
    >
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <FaUserShield className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Admin Management</h1>
              <p className={styles.subtitle}>Manage hospital staff, appointments, and more</p>
            </div>
          </div>

          <div className={styles.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'staff' && <StaffManager />}
            {activeTab === 'appointments' && <AppointmentManager />}
            {activeTab === 'complaints' && <ComplaintManager />}
            {activeTab === 'attendance' && <AttendanceManager />}
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}

export default Admin;
