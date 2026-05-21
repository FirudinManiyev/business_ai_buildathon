import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LightPillar from './components/LightPillar';
import MainLayout from './layouts/MainLayout';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Recommendations from './pages/Recommendations';
import Finance from './pages/Finance';
import Products from './pages/user/Products';
import UserJobs from './pages/user/UserJobs';
import AdminJobs from './pages/admin/AdminJobs';

function PT({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PT><Home /></PT>} />
        <Route path="/login" element={<PT><Login /></PT>} />
        <Route path="/register" element={<PT><Register /></PT>} />
        <Route path="/dashboard" element={<PT><Dashboard /></PT>} />
        <Route path="/unauthorized" element={<PT><Unauthorized /></PT>} />
        <Route path="/recommendations" element={<PT><Recommendations /></PT>} />

        {/* User only */}
        <Route path="/products" element={<PT><ProtectedRoute role="user"><Products /></ProtectedRoute></PT>} />
        <Route path="/jobs" element={<PT><ProtectedRoute role="user"><UserJobs /></ProtectedRoute></PT>} />

        {/* Admin only */}
        <Route path="/admin/jobs" element={<PT><ProtectedRoute role="admin"><AdminJobs /></ProtectedRoute></PT>} />
        <Route path="/finance" element={<PT><ProtectedRoute role="admin"><Finance /></ProtectedRoute></PT>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundColor: '#0a0505' }}>
        <LightPillar
          topColor="#EAB308"
          bottomColor="#e25bdb"
          intensity={0.95}
          rotationSpeed={0.6}
          glowAmount={0.005}
          pillarWidth={5.9}
          pillarHeight={0.3}
          noiseIntensity={0.08}
          pillarRotation={65}
          interactive={false}
          mixBlendMode="normal"
          quality="medium"
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MainLayout>
          <AnimatedRoutes />
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}

export default App;