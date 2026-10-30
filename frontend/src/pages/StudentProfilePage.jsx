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
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';

export default function StudentProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
        </div>

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
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs"
                >
                  <div className="text-[10px] text-teal-700 font-bold uppercase">{item.owning_school_name}</div>
                  <h4 className="font-bold text-slate-900 truncate">{item.resource_title}</h4>
                  <div className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Coordinator Review Pending</span>
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

      {/* QR Code Pass Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        item={selectedQRItem}
      />
    </div>
  );
}
