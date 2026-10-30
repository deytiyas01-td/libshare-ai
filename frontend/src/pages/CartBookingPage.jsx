import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Clock,
  School,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CartBookingPage() {
  const { cartItems, removeFromCart, updateItemDays, clearCart } = useCart();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  // Group items by owning school
  const groupedBySchool = cartItems.reduce((acc, item) => {
    const schoolKey = item.owning_school_name || item.owning_school_id;
    if (!acc[schoolKey]) {
      acc[schoolKey] = [];
    }
    acc[schoolKey].push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?portal=student');
      return;
    }

    if (user.role !== 'student') {
      setError('Please log in with a verified student account to complete bookings.');
      return;
    }

    if (user.verification_status !== 'Verified') {
      setError(
        `Borrowing is blocked: Your student account verification status is '${user.verification_status}'. An institutional coordinator must verify your uploaded documents before you can borrow equipment.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const itemsPayload = cartItems.map((item) => ({
        resource_id: item.id,
        days_requested: item.days_requested || 7,
      }));

      const res = await api.bookings.create({
        items: itemsPayload,
        notes: notes.trim(),
      });

      setSuccessData(res);
      clearCart();
    } catch (err) {
      setError(err.message || 'Booking submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase tracking-widest mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            Multi-Resource Session
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Review Borrowing Request
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            LibShare AI automatically partitions your booking and routes requests independently to each owning institution.
          </p>
        </div>

        {/* Success Confirmation Screen */}
        {successData ? (
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 text-center space-y-6 animate-fadeIn shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Booking Session Dispatched!</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                {successData.message}
              </p>
            </div>

            {/* School Routing Notice */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-3">
              <div className="font-semibold text-teal-300 flex items-center gap-2">
                <Info className="w-4 h-4" /> Independent School Request Routing
              </div>
              <p className="text-slate-400 leading-relaxed">
                Your request has been routed to <strong>{successData.schools_notified?.length || 1} independent school coordinator(s)</strong>. Each school will review and approve its own equipment separately. You will receive real-time notifications and QR passes as each is authorized.
              </p>
              {successData.anomaly_signal && successData.anomaly_signal.flagged && (
                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-lg text-amber-300 text-[11px]">
                  <strong>AI Borrowing Velocity Advisory:</strong> {successData.anomaly_signal.message}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/student/my-bookings"
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20"
              >
                Go to My Active Bookings & QR Passes →
              </Link>
              <Link
                to="/marketplace"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Explore More Resources
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Your session cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Browse the inter-school marketplace and select computers, science lab apparatus, books, or study spaces.
            </p>
            <Link
              to="/marketplace"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Browse Shared Resources
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List grouped by school */}
            <div className="lg:col-span-2 space-y-6">
              {/* Architecture Rule Callout */}
              <div className="bg-teal-950/30 border border-teal-500/30 rounded-2xl p-4 text-xs text-teal-300 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Multi-Resource Isolation:</strong> Each school processes requests for its own assets independently. If one school approves and another declines, your approved items remain valid and ready for QR collection!
                </div>
              </div>

              {/* Grouped items */}
              {Object.entries(groupedBySchool).map(([schoolName, items]) => (
                <div
                  key={schoolName}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <School className="w-4 h-4 text-teal-400" />
                      <span>{schoolName}</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {items.length} item(s) from this school
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                              {item.title}
                            </h4>
                            <div className="text-[10px] text-teal-400">{item.category}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <select
                              value={item.days_requested || 7}
                              onChange={(e) => updateItemDays(item.id, e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none"
                            >
                              <option value={3}>3 Days</option>
                              <option value={7}>7 Days</option>
                              <option value={14}>14 Days</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
                            title="Remove from session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Summary & Checkout */}
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                  Booking Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Resources:</span>
                    <span className="text-white font-semibold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Participating Schools:</span>
                    <span className="text-teal-300 font-semibold">
                      {Object.keys(groupedBySchool).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Inter-School Fee:</span>
                    <span className="text-emerald-400 font-semibold">₹0 (Free Hackathon Sharing)</span>
                  </div>
                </div>

                {/* Optional Purpose Notes */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Purpose / Project Notes (Shared with school staff):
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Science Olympiad preparation, Robotics club prototype..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Student Verification Status Box */}
                {user ? (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Borrower:</span>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification:</span>
                      <span
                        className={`font-semibold ${
                          user.verification_status === 'Verified'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {user.verification_status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl text-xs text-purple-300">
                    Please sign in with a verified student account to complete this request.
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Routing Requests...' : 'Submit Multi-School Request'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
