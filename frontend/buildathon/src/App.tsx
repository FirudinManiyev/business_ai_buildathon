import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LightPillar from './components/LightPillar';
import MainLayout from './layouts/MainLayout';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import Jobs from './pages/Jobs';
import Finance from './pages/Finance';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
        <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
        <Route path="/finance" element={<PageTransition><Finance /></PageTransition>} />
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