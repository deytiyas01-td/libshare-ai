import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  School,
  User,
  ShoppingBag,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import QRModal from './QRModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeQRItem, setActiveQRItem] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenQRFromNotif = (notif) => {
    setActiveQRItem({
      qr_token: notif.qr_token,
      resource_title: notif.title.replace('Booking QR Pass: ', '').replace('Request Approved: ', ''),
      owning_school_name: notif.sender_name || 'Partner School',
    });
    setQrModalOpen(true);
    setShowNotifMenu(false);
  };

  // Requirement: Cart section is NOT available for schools!
  const isSchoolAdmin = user && user.role === 'school_admin';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    LibShare <span className="text-teal-600 font-black">AI</span>
                  </span>
                  <span className="hidden md:block text-[10px] text-teal-700 uppercase tracking-widest font-bold">
                    Multi-School Resource Network
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/marketplace"
                className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                  location.pathname === '/marketplace' ? 'text-teal-600' : 'text-slate-600'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Marketplace
              </Link>

              <Link
                to="/analytics"
                className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                  location.pathname === '/analytics' ? 'text-teal-600' : 'text-slate-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics & AI
              </Link>

              {/* Portals Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPortalMenu(!showPortalMenu)}
                  className="text-sm font-semibold text-slate-600 hover:text-teal-600 flex items-center gap-1.5 py-2 cursor-pointer focus:outline-none"
                >
                  <School className="w-4 h-4 text-teal-600" />
                  Portals
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showPortalMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-700 animate-fadeIn"
                    onMouseLeave={() => setShowPortalMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-teal-700">
                      Institutional Portals
                    </div>
                    <Link
                      to="/school/school-a"
                      onClick={() => setShowPortalMenu(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 hover:text-teal-700"
                    >
                      <span>Greenwood High (School A)</span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 font-bold">SCH-A</span>
                    </Link>
                    <Link
                      to="/school/school-b"
                      onClick={() => setShowPortalMenu(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 hover:text-blue-700"
                    >
                      <span>St. Xavier Academy (School B)</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold">SCH-B</span>
                    </Link>
                    <Link
                      to="/school/school-c"
                      onClick={() => setShowPortalMenu(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 hover:text-cyan-700"
                    >
                      <span>Delhi Model (School C)</span>
                      <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200 font-bold">SCH-C</span>
                    </Link>
                    <div className="my-1 border-t border-slate-100"></div>
                    <Link
                      to="/student"
                      onClick={() => setShowPortalMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-teal-50 hover:text-teal-800 font-bold text-teal-700"
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      Student / User Portal
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Icons (Cart only for non-schools, Notifications, Auth) */}
            <div className="hidden md:flex items-center gap-3">
              {/* REQUIREMENT: Cart section is NOT available for schools! */}
              {!isSchoolAdmin && (
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-600 hover:text-teal-600 transition-colors rounded-xl hover:bg-slate-100"
                  title="Multi-resource booking session"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 text-slate-600 hover:text-teal-600 transition-colors rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
                    title="In-App Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div
                      className="absolute right-0 mt-2 w-88 max-h-[28rem] overflow-y-auto bg-white border border-slate-200 rounded-3xl shadow-2xl py-2 z-50 text-slate-800 animate-fadeIn"
                      onMouseLeave={() => setShowNotifMenu(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                          Notification Center ({unreadCount} new)
                        </span>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                              !notif.is_read ? 'bg-teal-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900">{notif.title}</span>
                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1"></span>
                              )}
                            </div>

                            {notif.sender_name && (
                              <div className="text-[10px] font-semibold text-teal-700 mt-0.5">
                                From: {notif.sender_name}
                              </div>
                            )}

                            <p className="text-slate-600 mt-1 text-xs leading-relaxed font-sans">
                              {notif.message}
                            </p>

                            {/* REQUIREMENT: Download & View QR Code directly in Notifications! */}
                            {notif.qr_token && (
                              <div className="mt-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenQRFromNotif(notif)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  View & Download QR Code
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User Account State */}
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <Link
                    to={user.role === 'school_admin' ? `/school/${user.school_id}` : '/student/profile'}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 border border-teal-300 flex items-center justify-center font-black text-xs uppercase shadow-xs">
                      {user.name ? user.name.slice(0, 2) : 'US'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 flex items-center gap-1">
                        {user.name}
                        {user.verification_status === 'Verified' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified" />
                        )}
                      </div>
                      <div className="text-[10px] text-teal-700 font-semibold capitalize">
                        {user.role === 'school_admin' ? 'School Coordinator' : `${user.verification_status || 'Student'}`}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl shadow-xs transition-all"
                  >
                    Student Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center gap-3">
              {!isSchoolAdmin && (
                <Link to="/cart" className="relative p-2 text-slate-700">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2.5">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-800"
            >
              Marketplace
            </Link>
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-800"
            >
              Analytics & AI
            </Link>
            <div className="pt-2 border-t border-slate-100 text-[11px] uppercase text-teal-700 font-extrabold">
              Institutional Portals
            </div>
            <Link
              to="/school/school-a"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs text-slate-600 font-medium"
            >
              School A (Greenwood High)
            </Link>
            <Link
              to="/school/school-b"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs text-slate-600 font-medium"
            >
              School B (St. Xavier Academy)
            </Link>
            <Link
              to="/school/school-c"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs text-slate-600 font-medium"
            >
              School C (Delhi Model)
            </Link>
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs text-teal-700 font-bold"
            >
              Student & User Portal
            </Link>
          </div>
        )}
      </nav>

      {/* QR Code Modal for Notifications & Passes */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        item={activeQRItem}
        qrTokenOverride={activeQRItem?.qr_token}
        resourceTitleOverride={activeQRItem?.resource_title}
      />
    </>
  );
}
