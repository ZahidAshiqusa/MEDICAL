import { FaDownload, FaTimes } from 'react-icons/fa';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import styles from './InstallPrompt.module.css';

function InstallPrompt() {
  const { isInstallable, promptInstall, dismiss } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <FaDownload className={styles.icon} />
        <div className={styles.text}>
          <p className={styles.title}>Install BANU SAEED HOSPITAL</p>
          <p className={styles.desc}>Add to your home screen for quick access</p>
        </div>
        <button onClick={promptInstall} className={styles.installBtn}>
          Install
        </button>
        <button onClick={dismiss} className={styles.closeBtn} aria-label="Dismiss">
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
