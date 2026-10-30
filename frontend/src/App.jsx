import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterStudentPage from './pages/RegisterStudentPage';
import MarketplacePage from './pages/MarketplacePage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import CartBookingPage from './pages/CartBookingPage';
import StudentProfilePage from './pages/StudentProfilePage';
import SchoolDashboardPage from './pages/SchoolDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/resources/:id" element={<ResourceDetailPage />} />
                  <Route path="/cart" element={<CartBookingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterStudentPage />} />
                  <Route path="/student" element={<StudentProfilePage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                  <Route path="/student/my-bookings" element={<StudentProfilePage />} />
                  <Route path="/school/:schoolId" element={<SchoolDashboardPage />} />
                  <Route path="/school/:schoolId/requests" element={<SchoolDashboardPage />} />
                  <Route path="/school/:schoolId/verification" element={<SchoolDashboardPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
