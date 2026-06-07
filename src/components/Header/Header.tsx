import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHospital, FaBars, FaTimes, FaHome, FaCalendarAlt, FaUserShield, FaChartBar, FaClipboardCheck } from 'react-icons/fa';
import styles from './Header.module.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: <FaHome /> },
    { to: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { to: '/admin', label: 'Admin', icon: <FaUserShield /> },
    { to: '/dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { to: '/attendance', label: 'Attendance', icon: <FaClipboardCheck /> },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <FaHospital className={styles.logoIcon} />
          <span className={styles.logoText}>BANU SAEED HOSPITAL</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.navIcon}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
