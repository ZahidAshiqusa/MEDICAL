import { useState, useEffect, ReactNode } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './PasswordGate.module.css';

interface PasswordGateProps {
  passwordEnvKey: string;
  storageKey: string;
  title: string;
  children: ReactNode;
}

function PasswordGate({ passwordEnvKey, storageKey, title, children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = (import.meta.env as Record<string, string>)[passwordEnvKey];
    if (password === correctPassword) {
      sessionStorage.setItem(storageKey, 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(storageKey);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <FaLock /> Logout
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${error ? styles.shake : ''}`}>
        <div className={styles.iconWrap}>
          <FaLock className={styles.lockIcon} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>Enter password to continue</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeBtn}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className={styles.errorText}>Incorrect password. Please try again.</p>}
          <button type="submit" className={styles.submitBtn}>
            <FaLock /> Access {title}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordGate;
