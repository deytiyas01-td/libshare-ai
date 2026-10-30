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

  // REQUIREMENT: Cart is not available for schools
  if (user && user.role === 'school_admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">School Coordinator Account</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The student borrowing cart is designated for students. Institutional coordinators manage and approve inventory directly within their School Portal.
          </p>
          <Link
            to={`/school/${user.school_id}`}
            className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Go to My School Portal
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            Multi-Resource Session
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Review Borrowing Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            LibShare AI automatically partitions your booking and routes requests independently to each owning institution.
          </p>
        </div>

        {/* Success Screen */}
        {successData ? (
          <div className="bg-white border-2 border-teal-500/40 rounded-3xl p-8 text-center space-y-6 animate-fadeIn shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Booking Session Dispatched!</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {successData.message}
              </p>
            </div>

            {/* School Routing Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-3">
              <div className="font-bold text-teal-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" /> Independent School Request Routing
              </div>
              <p className="text-slate-600 leading-relaxed font-normal">
                Your request has been routed to <strong>{successData.schools_notified?.length || 1} independent school coordinator(s)</strong>. Each school will review and approve its own equipment separately. You have received QR passes in your notification center and profile.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/student/my-bookings"
                className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/20"
              >
                Go to My Active Bookings & Download QR Passes →
              </Link>
              <Link
                to="/marketplace"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors border border-slate-200"
              >
                Explore More Resources
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Your session cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Browse the inter-school marketplace and select computers, science lab apparatus, books, or study spaces.
            </p>
            <Link
              to="/marketplace"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Browse Shared Resources
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List grouped by school */}
            <div className="lg:col-span-2 space-y-6">
              {/* Architecture Rule Callout */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Multi-Resource Isolation:</strong> Each school processes requests for its own assets independently. If one school approves and another declines, your approved items remain valid and ready for QR collection!
                </div>
              </div>

              {/* Grouped items */}
              {Object.entries(groupedBySchool).map(([schoolName, items]) => (
                <div
                  key={schoolName}
                  className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <School className="w-4 h-4 text-teal-600" />
                      <span>{schoolName}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600 font-bold">
                      {items.length} item(s) from this school
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                              {item.title}
                            </h4>
                            <div className="text-[10px] text-teal-700 font-semibold">{item.category}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <select
                              value={item.days_requested || 7}
                              onChange={(e) => updateItemDays(item.id, e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
                            >
                              <option value={3}>3 Days</option>
                              <option value={7}>7 Days</option>
                              <option value={14}>14 Days</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-200 cursor-pointer"
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
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Booking Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Resources:</span>
                    <span className="text-slate-900 font-bold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Participating Schools:</span>
                    <span className="text-teal-700 font-bold">
                      {Object.keys(groupedBySchool).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Inter-School Fee:</span>
                    <span className="text-emerald-700 font-bold">₹0 (Free Hackathon Sharing)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Purpose / Project Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Science Olympiad preparation, Robotics club prototype..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {user ? (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Borrower:</span>
                      <span className="text-slate-900 font-bold">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verification:</span>
                      <span
                        className={`font-black ${
                          user.verification_status === 'Verified'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {user.verification_status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-xs text-purple-800">
                    Please sign in with a verified student account to complete this request.
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
