import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FaHospital, FaDownload, FaCalendarAlt, FaUserMd, FaClock } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';
import type { Appointment } from '../../utils/types';
import styles from './TokenCard.module.css';

interface TokenCardProps {
  appointment: Appointment;
}

function TokenCard({ appointment }: TokenCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `BANU_SAEED_Token_${appointment.tokenNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div ref={cardRef} className={styles.card}>
        <div className={styles.header}>
          <FaHospital className={styles.hospitalIcon} />
          <div>
            <h2 className={styles.hospitalName}>BANU SAEED HOSPITAL</h2>
            <p className={styles.hospitalTag}>Appointment Token</p>
          </div>
        </div>

        <div className={styles.tokenSection}>
          <span className={styles.tokenLabel}>TOKEN NUMBER</span>
          <span className={styles.tokenNumber}>{String(appointment.tokenNumber).padStart(4, '0')}</span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <FaCalendarAlt className={styles.detailIcon} />
            <span className={styles.detailLabel}>Date & Time</span>
            <span className={styles.detailValue}>{formatDateTime(appointment.createdAt)}</span>
          </div>
          <div className={styles.detailRow}>
            <FaUserMd className={styles.detailIcon} />
            <span className={styles.detailLabel}>Patient Name</span>
            <span className={styles.detailValue}>{appointment.patientName}</span>
          </div>
          <div className={styles.detailRow}>
            <FaClock className={styles.detailIcon} />
            <span className={styles.detailLabel}>Age</span>
            <span className={styles.detailValue}>{appointment.age} years</span>
          </div>
          <div className={styles.detailRow}>
            <FaUserMd className={styles.detailIcon} />
            <span className={styles.detailLabel}>Doctor</span>
            <span className={styles.detailValue}>{appointment.doctor}</span>
          </div>
          {appointment.idCard && (
            <div className={styles.detailRow}>
              <FaClock className={styles.detailIcon} />
              <span className={styles.detailLabel}>ID Card</span>
              <span className={styles.detailValue}>{appointment.idCard}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <FaClock className={styles.detailIcon} />
            <span className={styles.detailLabel}>Issue</span>
            <span className={styles.detailValue}>{appointment.issue}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <p>Please keep this token for your records</p>
        </div>
      </div>

      <button onClick={handleDownload} className={styles.downloadBtn}>
        <FaDownload /> Download Token Card (HD)
      </button>
    </div>
  );
}

export default TokenCard;
