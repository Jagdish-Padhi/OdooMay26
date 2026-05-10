import { useEffect } from 'react';

import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import GlobalLoader from '../components/loaders/GlobalLoader.jsx';
import LandingPage from '../pages/landing/LandingPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import DashboardHomePage from '../pages/dashboard/DashboardHomePage.jsx';
import ProfilePage from '../pages/dashboard/ProfilePage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import MyTripsPage from '../pages/trips/MyTripsPage.jsx';
import CreateTripPage from '../pages/trips/CreateTripPage.jsx';
import CitySearchPage from '../pages/search/CitySearchPage.jsx';
import ActivitySearchPage from '../pages/search/ActivitySearchPage.jsx';
import PackingPage from '../pages/trips/PackingPage.jsx';
import NotesPage from '../pages/trips/NotesPage.jsx';
import BudgetPage from '../pages/trips/BudgetPage.jsx';
import SharedTripPage from '../pages/trips/SharedTripPage.jsx';
import ItineraryBuilderPage from '../pages/trips/ItineraryBuilderPage.jsx';
import ItineraryViewPage from '../pages/trips/ItineraryViewPage.jsx';
import AiPlannerPage from '../pages/dashboard/AiPlannerPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';

import useAuthStore from '../store/auth.store.js';


function PrivateRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isTransitioning = useAuthStore((s) => s.isTransitioning);
  const isExiting = useAuthStore((s) => s.isExiting);
  const transitionShowTagline = useAuthStore((s) => s.transitionShowTagline);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);
  const setExiting = useAuthStore((s) => s.setExiting);

  useEffect(() => {
    if (isTransitioning && !isExiting) {
      const t1 = setTimeout(() => {
        setExiting(true);
        setTimeout(() => setTransitioning(false), 600);
      }, 300);
      return () => clearTimeout(t1);
    }
  }, [location.pathname, isTransitioning, isExiting]);

  if (!hydrated) return <GlobalLoader showTagline={false} />;

  return (
    <>
      {(isTransitioning || isExiting) && (
        <GlobalLoader showTagline={transitionShowTagline} isExiting={isExiting} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/trips/public/:id" element={<SharedTripPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/trips/new" element={<CreateTripPage />} />
            <Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
            <Route path="/trips/:tripId/view" element={<ItineraryViewPage />} />
            <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
            <Route path="/trips/:tripId/packing" element={<PackingPage />} />
            <Route path="/trips/:tripId/notes" element={<NotesPage />} />
            <Route path="/discover" element={<CitySearchPage />} />
            <Route path="/discover/activities" element={<ActivitySearchPage />} />
            <Route path="/dashboard/packing" element={<PackingPage />} />
            <Route path="/dashboard/notes" element={<NotesPage />} />
            <Route path="/dashboard/budget" element={<BudgetPage />} />
            <Route path="/dashboard/ai-planner" element={<AiPlannerPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
