import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaHospital, FaWheelchair, FaClock, FaCalendarCheck, FaArrowRight, FaStethoscope, FaHandHoldingMedical, FaCommentDots, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { apiPost } from '../../hooks/useApi';
import styles from './Home.module.css';

function Home() {
  const [complaintName, setComplaintName] = useState('');
  const [complaintIssue, setComplaintIssue] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintName.trim() || !complaintIssue.trim()) return;
    setComplaintStatus('sending');
    try {
      await apiPost('/api/complaints', { patientName: complaintName.trim(), issue: complaintIssue.trim() });
      setComplaintStatus('sent');
      setComplaintName('');
      setComplaintIssue('');
      setTimeout(() => setComplaintStatus('idle'), 4000);
    } catch {
      setComplaintStatus('error');
      setTimeout(() => setComplaintStatus('idle'), 3000);
    }
  };
  const features = [
    {
      icon: <FaUserMd />,
      title: 'Expert Medical Staff',
      description: 'Highly qualified doctors and medical professionals dedicated to your health.'
    },
    {
      icon: <FaHospital />,
      title: 'Clean & Hygienic Rooms',
      description: 'State-of-the-art facilities maintained to the highest standards of cleanliness.'
    },
    {
      icon: <FaWheelchair />,
      title: 'Wheelchair Accessibility',
      description: 'Free wheelchair service available for all patients who need assistance.'
    },
    {
      icon: <FaClock />,
      title: 'No Waiting Required',
      description: 'Efficient scheduling system ensures minimal wait times for all patients.'
    },
    {
      icon: <FaCalendarCheck />,
      title: 'Online Appointments',
      description: 'Book your appointments from home and receive instant confirmation.'
    },
    {
      icon: <FaHandHoldingMedical />,
      title: '24/7 Patient Care',
      description: 'Round-the-clock nursing and medical support for admitted patients.'
    }
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <FaStethoscope />
            <span>Trusted Healthcare Since 2020</span>
          </div>
          <h1 className={styles.heroTitle}>BANU SAEED<br />HOSPITAL</h1>
          <p className={styles.heroSubtitle}>
            Providing world-class healthcare with compassion and excellence.
            Your health is our priority.
          </p>
          <div className={styles.heroActions}>
            <Link to="/appointments" className={styles.heroCta}>
              Book Appointment <FaArrowRight />
            </Link>
            <a href="#features" className={styles.heroSecondary}>
              Learn More
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>Doctors</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Patients</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose Us</h2>
            <p className={styles.sectionSubtitle}>
              We provide comprehensive healthcare services with modern facilities and experienced professionals
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Section */}
      <section className={styles.complaint} id="complaint">
        <div className={styles.container}>
          <div className={styles.complaintCard}>
            <div className={styles.complaintHeader}>
              <FaCommentDots className={styles.complaintIcon} />
              <div>
                <h2 className={styles.complaintTitle}>Submit a Complaint</h2>
                <p className={styles.complaintDesc}>Your feedback helps us improve our services. We take every complaint seriously.</p>
              </div>
            </div>
            {complaintStatus === 'sent' ? (
              <div className={styles.complaintSuccess}>
                <FaCheckCircle />
                <p>Thank you! Your complaint has been submitted. We will look into it.</p>
              </div>
            ) : (
              <form onSubmit={handleComplaint} className={styles.complaintForm}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={complaintName}
                  onChange={e => setComplaintName(e.target.value)}
                  className={styles.complaintInput}
                  required
                />
                <textarea
                  placeholder="Describe your complaint..."
                  value={complaintIssue}
                  onChange={e => setComplaintIssue(e.target.value)}
                  rows={4}
                  className={styles.complaintTextarea}
                  required
                />
                <button type="submit" className={styles.complaintBtn} disabled={complaintStatus === 'sending'}>
                  {complaintStatus === 'sending' ? 'Submitting...' : <><FaPaperPlane /> Submit Complaint</>}
                </button>
                {complaintStatus === 'error' && <p className={styles.complaintError}>Failed to submit. Please try again.</p>}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Book Your Appointment?</h2>
            <p className={styles.ctaDesc}>
              Skip the queue and book online. Get your token number instantly.
            </p>
            <Link to="/appointments" className={styles.ctaButton}>
              <FaCalendarCheck /> Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
