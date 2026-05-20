import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LightPillar from './components/LightPillar';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import Jobs from './pages/Jobs';
import Finance from './pages/Finance';

function App() {
  return (
    <BrowserRouter>
      {/* Fixed background — bütün səhifələrdə eyni qalır, scroll etmir */}
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

      {/* Scrollable content — z-index 1 ilə background üzərindədir */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/finance" element={<Finance />} />
          </Routes>
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}

export default App;