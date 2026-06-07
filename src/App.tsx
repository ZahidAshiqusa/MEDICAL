import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Dashboard/Dashboard';
import Appointments from './pages/Appointments/Appointments';
import Attendance from './pages/Attendance/Attendance';
import QRAttendance from './pages/QRAttendance/QRAttendance';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/qr-attendance" element={<QRAttendance />} />
        </Routes>
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}

export default App;
