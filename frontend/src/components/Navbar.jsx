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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                  LibShare <span className="text-teal-400 font-extrabold">AI</span>
                </span>
                <span className="hidden md:block text-[10px] text-teal-400/80 uppercase tracking-widest font-semibold">
                  Multi-School Resource Network
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors hover:text-teal-400 flex items-center gap-1.5 ${
                location.pathname === '/marketplace' ? 'text-teal-400 font-semibold' : 'text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Marketplace
            </Link>

            <Link
              to="/analytics"
              className={`text-sm font-medium transition-colors hover:text-teal-400 flex items-center gap-1.5 ${
                location.pathname === '/analytics' ? 'text-teal-400 font-semibold' : 'text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics & AI
            </Link>

            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPortalMenu(!showPortalMenu)}
                className="text-sm font-medium text-slate-300 hover:text-teal-400 flex items-center gap-1.5 py-2 cursor-pointer focus:outline-none"
              >
                <School className="w-4 h-4 text-teal-400" />
                Portals
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPortalMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200"
                  onMouseLeave={() => setShowPortalMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-700/60 text-xs font-semibold uppercase tracking-wider text-teal-400">
                    Institutional Portals
                  </div>
                  <Link
                    to="/school/school-a"
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-700/50 hover:text-white"
                  >
                    <span>Greenwood High (School A)</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">SCH-A</span>
                  </Link>
                  <Link
                    to="/school/school-b"
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-700/50 hover:text-white"
                  >
                    <span>St. Xavier Academy (School B)</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">SCH-B</span>
                  </Link>
                  <Link
                    to="/school/school-c"
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-700/50 hover:text-white"
                  >
                    <span>Delhi Model (School C)</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">SCH-C</span>
                  </Link>
                  <div className="my-1 border-t border-slate-700/60"></div>
                  <Link
                    to="/student"
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-700/50 hover:text-teal-300 font-medium"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    Student & User Portal
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons (Cart, Notifications, Auth) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Multi-resource Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-800"
              title="Multi-resource booking session"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 text-slate-300 hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-800 focus:outline-none"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200"
                    onMouseLeave={() => setShowNotifMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                        In-App Alerts ({unreadCount} new)
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) navigate(notif.link);
                            setShowNotifMenu(false);
                          }}
                          className={`px-4 py-3 border-b border-slate-700/40 hover:bg-slate-700/40 cursor-pointer text-xs transition-colors ${
                            !notif.is_read ? 'bg-slate-700/20' : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-teal-300">{notif.title}</span>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User State */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
                <Link
                  to={user.role === 'school_admin' ? `/school/${user.school_id}` : '/student/profile'}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 flex items-center gap-1">
                      {user.name}
                      {user.verification_status === 'Verified' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" title="Verified Student" />
                      )}
                      {user.verification_status === 'Pending' && (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" title="Pending Verification" />
                      )}
                    </div>
                    <div className="text-[10px] text-teal-400 capitalize">
                      {user.role === 'school_admin' ? 'School Coordinator' : `${user.verification_status || 'Student'}`}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-lg shadow-sm shadow-teal-500/20 transition-all font-sans"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-slate-300">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-200 font-medium"
          >
            Marketplace
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-200 font-medium"
          >
            Analytics & AI
          </Link>
          <div className="pt-2 border-t border-slate-800 text-xs uppercase text-teal-400 font-semibold">
            Institutional Portals
          </div>
          <Link
            to="/school/school-a"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm text-slate-300"
          >
            School A (Greenwood High)
          </Link>
          <Link
            to="/school/school-b"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm text-slate-300"
          >
            School B (St. Xavier Academy)
          </Link>
          <Link
            to="/school/school-c"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm text-slate-300"
          >
            School C (Delhi Model)
          </Link>
          <Link
            to="/student"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm text-teal-300"
          >
            Student / User Portal
          </Link>
          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-teal-300">{user.name}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 rounded-lg text-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-teal-500 text-slate-950 font-semibold rounded-lg text-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
