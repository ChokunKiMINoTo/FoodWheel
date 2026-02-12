import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import bellIcon from './assets/jingle-bell.png';

const WheelPage = lazy(() => import('./pages/WheelPage'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'));

function CloudsBg() {
  return (
    <div className="clouds-bg" aria-hidden="true">
      <div className="cloud" />
      <div className="cloud" />
      <div className="cloud" />
      <div className="cloud" />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spin-button" style={{ pointerEvents: 'none', opacity: 0.6 }}>Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <CloudsBg />
      <nav className="nav-bar" role="navigation" aria-label="Main navigation">
        <div className="nav-logo">
          <img src={bellIcon} alt="" className="bell-icon" />
          FoodWheel
        </div>
        <div className="nav-tabs">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
          >
            🎡 Wheel
          </NavLink>
          <NavLink
            to="/restaurants"
            className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
          >
            🍽️ Restaurants
          </NavLink>
        </div>
      </nav>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<WheelPage />} />
          <Route path="/restaurants" element={<RestaurantPage />} />
        </Routes>
      </Suspense>
    </RestaurantProvider>
  );
}
