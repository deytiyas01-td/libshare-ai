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
  ShoppingBag
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
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Authenticating student station...
      </div>
    );
  }

  // Group by status
  const activeLoans = bookings.filter((b) => b.status === 'Collected');
  const readyForCollection = bookings.filter((b) => b.status === 'Ready for Collection' || b.status === 'Approved');
  const pendingRequests = bookings.filter((b) => b.status === 'Requested');
  const pastReturns = bookings.filter((b) => b.status === 'Returned' || b.status === 'Rejected');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  {user.verification_status === 'Verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                  {user.verification_status === 'Pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                  {user.verification_status === 'Rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {user.verification_status === 'Additional Info Required' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Action Required
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1 text-teal-300 font-medium">
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
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Catalog
              </Link>
            </div>
          </div>

          {/* Verification Status Banner if Pending */}
          {user.verification_status === 'Pending' && (
            <div className="mt-6 bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Institutional Identity Verification in Progress:</strong> Your school administrator is reviewing your uploaded {user.document_type || 'student document'}. You can explore the marketplace, but borrowing completion is locked until status switches to <strong>Verified</strong>.
              </div>
            </div>
          )}

          {user.verification_notes && (
            <div className="mt-4 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-slate-300">Staff Registrar Notes:</strong> {user.verification_notes}
            </div>
          )}
        </div>

        {/* Section 1: Ready for Collection (QR Pass Active!) */}
        {readyForCollection.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
              <h2 className="text-lg font-bold text-white">
                Ready for Collection ({readyForCollection.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyForCollection.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-teal-500/40 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.resource_image}
                      alt={item.resource_title}
                      className="w-14 h-14 object-cover rounded-xl border border-teal-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-teal-400 font-medium">
                        {item.owning_school_name}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                        {item.resource_title}
                      </h4>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Due: {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQR(item)}
                    className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 shrink-0"
                  >
                    <QrCode className="w-4 h-4" />
                    Show QR Pass
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Active Borrowed Items (In Possession, QR Return Pass Available) */}
        {activeLoans.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              Currently Borrowed ({activeLoans.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoans.map((item) => {
                const isLate = new Date() > new Date(item.due_date);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.resource_image}
                        alt={item.resource_title}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] text-blue-400 font-medium">
                          {item.owning_school_name}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                          {item.resource_title}
                        </h4>
                        <div className={`text-xs mt-0.5 ${isLate ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                          {isLate ? '⚠️ Overdue' : `Due: ${new Date(item.due_date).toLocaleDateString()}`}
                        </div>
                        {item.pre_collection_condition && (
                          <div className="text-[10px] text-slate-500 truncate">
                            Condition: {item.pre_collection_condition}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenQR(item)}
                      className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 shrink-0"
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
            <h2 className="text-base font-bold text-slate-300">
              Awaiting Institutional Approval ({pendingRequests.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="text-[10px] text-teal-400">{item.owning_school_name}</div>
                  <h4 className="font-bold text-white truncate">{item.resource_title}</h4>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Coordinator Review Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Return History & Condition Reports */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-white">
            Borrowing History & Return Condition Archive
          </h2>

          {pastReturns.length === 0 && readyForCollection.length === 0 && activeLoans.length === 0 && pendingRequests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No borrowing activity yet. Head over to the Marketplace to request learning equipment!
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Resource</th>
                      <th className="py-3 px-4 font-semibold">School</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Handover / Return Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-white">{b.resource_title}</td>
                        <td className="py-3 px-4 text-teal-400">{b.owning_school_name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'Returned'
                                ? 'bg-slate-800 text-slate-300'
                                : b.status === 'Collected'
                                ? 'bg-blue-500/20 text-blue-300'
                                : b.status === 'Ready for Collection'
                                ? 'bg-teal-500/20 text-teal-300'
                                : b.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {b.post_return_condition
                            ? `Returned: ${b.post_return_condition}`
                            : b.pre_collection_condition
                            ? `Handover: ${b.pre_collection_condition}`
                            : 'Standard verification'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
