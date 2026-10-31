import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  School,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  RotateCcw,
  FileText,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Download,
  Eye,
  Bell,
  MessageSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import QRModal from '../components/QRModal';

export default function StudentProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'bookings' | 'idcard'
  const [selectedQRItem, setSelectedQRItem] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?portal=student');
      return;
    }
    if (user) {
      fetchMyBookings();
      fetchNotifications();
    }
  }, [user, authLoading]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQR = (item) => {
    setSelectedQRItem(item);
    setQrModalOpen(true);
  };

  const handleOpenQRFromNotif = (notif) => {
    setSelectedQRItem({
      qr_token: notif.qr_token,
      resource_title: notif.title.replace('Booking QR Pass: ', '').replace('Request Approved: ', ''),
      owning_school_name: notif.sender_name || 'Partner School',
    });
    setQrModalOpen(true);
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Authenticating student station...
      </div>
    );
  }

  const activeLoans = bookings.filter((b) => b.status === 'Collected');
  const readyForCollection = bookings.filter((b) => b.status === 'Ready for Collection' || b.status === 'Approved');
  const pendingRequests = bookings.filter((b) => b.status === 'Requested');
  const pastReturns = bookings.filter((b) => b.status === 'Returned' || b.status === 'Rejected');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 font-extrabold text-2xl flex items-center justify-center shadow-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                  {user.verification_status === 'Verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Student
                    </span>
                  )}
                  {user.verification_status === 'Pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                  {user.verification_status === 'Rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                  <span className="flex items-center gap-1 text-teal-700 font-bold">
                    <School className="w-3.5 h-3.5" /> {user.school_name || 'Independent Student'}
                  </span>
                  <span>•</span>
                  <span>{user.grade}</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/marketplace"
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Catalog
              </Link>
            </div>
          </div>

          {/* Pending Verification Notice */}
          {user.verification_status === 'Pending' && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Institutional Identity Verification in Progress:</strong> Your school administrator is reviewing your uploaded {user.document_type || 'student document'}. You can explore the marketplace, but borrowing checkout is locked until your status is approved as <strong>Verified</strong>.
              </div>
            </div>
          )}

          {user.verification_notes && (
            <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 font-medium">
              <strong className="text-slate-800">Coordinator Notes:</strong> {user.verification_notes}
            </div>
          )}

          {/* Student Portal Navigation Tabs */}
          <div className="flex border-b border-slate-200 mt-6 -mb-2 gap-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 pb-3.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notification Portal & Messages
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 pb-3.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Bookings & QR Passes ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('idcard')}
              className={`flex items-center gap-2 pb-3.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'idcard'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              My ID Verification Document
            </button>
          </div>
        </div>

        {/* TAB 1: NOTIFICATION PORTAL & MESSAGES FROM SCHOOLS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-teal-600" />
                  Student Notification Portal & Direct School Messages
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time communications, QR collection passes, and notices dispatched by school coordinators
                </p>
              </div>

              <button
                type="button"
                onClick={fetchNotifications}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" /> Refresh Inbox
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">No Notifications Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When schools verify your booking requests or send direct messages, they will appear here in your official student notification portal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-2.5 ${
                      !notif.is_read
                        ? 'border-teal-400/80 bg-teal-50/20 shadow-teal-500/5'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        {notif.type === 'direct_message' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Direct School Message
                          </span>
                        ) : notif.qr_token ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> QR Pass Issued
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {notif.type || 'Notice'}
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-900">{notif.title}</span>

                        {!notif.is_read && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full uppercase">
                            New
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>

                    {notif.sender_name && (
                      <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-teal-600" />
                        From Institutional Coordinator: {notif.sender_name}
                      </div>
                    )}

                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 font-sans">
                      {notif.message}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Attached QR Code Pass */}
                      {notif.qr_token ? (
                        <button
                          type="button"
                          onClick={() => handleOpenQRFromNotif(notif)}
                          className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-teal-600/20 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>View & Download Handover QR Code</span>
                        </button>
                      ) : (
                        <div></div>
                      )}

                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notif.id)}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                        >
                          ✓ Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BOOKINGS & QR PASSES */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 1: Ready for Collection with Downloadable QR Passes */}
            {readyForCollection.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Ready for Collection ({readyForCollection.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readyForCollection.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-teal-500/40 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.resource_image}
                          alt={item.resource_title}
                          className="w-14 h-14 object-cover rounded-2xl border border-teal-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                            {item.owning_school_name}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                            {item.resource_title}
                          </h4>
                          <div className="text-xs text-slate-500 mt-0.5 font-medium">
                            Return Due: {new Date(item.due_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenQR(item)}
                        className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-teal-600/20 shrink-0 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        QR Pass & Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Active Borrowed Items */}
            {activeLoans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Currently Borrowed Equipment ({activeLoans.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLoans.map((item) => {
                    const isLate = new Date() > new Date(item.due_date);
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-blue-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.resource_image}
                            alt={item.resource_title}
                            className="w-14 h-14 object-cover rounded-2xl border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                              {item.owning_school_name}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                              {item.resource_title}
                            </h4>
                            <div className={`text-xs mt-0.5 font-bold ${isLate ? 'text-rose-600' : 'text-slate-500'}`}>
                              {isLate ? '⚠️ Overdue' : `Due: ${new Date(item.due_date).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenQR(item)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return QR Pass
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Pending School Approval */}
            {pendingRequests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800">
                  Awaiting Institutional Approval ({pendingRequests.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingRequests.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-amber-200/80 rounded-2xl p-4 space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-teal-700 font-bold uppercase">{item.owning_school_name}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          Requested
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 truncate">{item.resource_title}</h4>
                      <div className="text-slate-500 flex items-center gap-1 font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Awaiting Institutional Coordinator Review</span>
                      </div>
                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> School Verification In Progress
                        </div>
                        <p className="text-slate-600 text-[10px] leading-tight">
                          Coordinator is reviewing your request & school ID document. Your official QR Handover Pass will be issued and sent to your notification center once approved.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Return History Archive */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Borrowing History & Return Condition Archive
              </h2>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-3 px-4">Resource</th>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Handover / Return Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{b.resource_title}</td>
                          <td className="py-3.5 px-4 text-teal-700 font-semibold">{b.owning_school_name}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'Returned'
                                  ? 'bg-slate-100 text-slate-700'
                                  : b.status === 'Collected'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'Ready for Collection'
                                  ? 'bg-teal-100 text-teal-800'
                                  : b.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b.post_return_condition
                              ? `Returned: ${b.post_return_condition}`
                              : b.pre_collection_condition
                              ? `Handover: ${b.pre_collection_condition}`
                              : 'Standard inspection'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY STUDENT ID CARD DOCUMENT */}
        {activeTab === 'idcard' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Uploaded Verification Document: {user.document_type || 'School ID Card'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    This official document is inspected by partner schools before releasing reserved resources.
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.verification_status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {user.verification_status}
                </span>
              </div>

              <div className="max-w-md mx-auto bg-slate-50 border border-slate-300 rounded-2xl p-4 text-center space-y-3">
                <img
                  src={user.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                  alt="Student ID Card"
                  className="w-full max-h-80 object-contain rounded-xl border border-slate-300 shadow-sm mx-auto"
                />
                <div className="text-xs font-semibold text-slate-700">
                  {user.name} • {user.school_name || 'Partner School'} ({user.grade || 'Student'})
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Pass Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        item={selectedQRItem}
      />
    </div>
  );
}
