import { FaHeart, FaPhone, FaWhatsapp, FaCode } from 'react-icons/fa';
import styles from './Footer.module.css';

function Footer() {
  const phone = '+923291001302';
  const waLink = `https://wa.me/923291001302`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>BANU SAEED HOSPITAL</h3>
            <p className={styles.tagline}>Professional Healthcare Management System</p>
          </div>
          <div className={styles.contact}>
            <h4 className={styles.contactTitle}>Contact Developer</h4>
            <p className={styles.devName}>DANISH RASOOL JOIYA</p>
            <div className={styles.contactLinks}>
              <a href={`tel:${phone}`} className={styles.contactLink}>
                <FaPhone />
                <span>{phone}</span>
              </a>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} BANU SAEED HOSPITAL. All rights reserved.
          </p>
          <p className={styles.credits}>
            <FaCode className={styles.codeIcon} />
            Developed with <FaHeart className={styles.heart} /> by DANISH RASOOL JOIYA
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
