import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  School,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Check,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7);

  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSchoolAdmin = user && user.role === 'school_admin';

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.resources.getDetail(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Resource details could not be retrieved');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading resource specifications...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 max-w-xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Resource Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This resource may have been relocated or archived.'}</p>
        <Link to="/marketplace" className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const { resource, ai_recommendations } = data;
  const inCart = isInCart(resource.id);
  const isAvailable = resource.available_quantity > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace Catalog
        </Link>

        {/* Main Resource Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-72 sm:h-96 lg:h-full bg-slate-100">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-xs">
                {resource.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {isAvailable ? `${resource.available_quantity} Units Available` : 'Reserved'}
              </span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                <School className="w-4 h-4" />
                <span>{resource.owning_school_name || resource.owning_school_id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {resource.title}
              </h1>

              {resource.author && (
                <div className="text-sm text-slate-600 font-medium">
                  Author / Manufacturer: <span className="text-slate-900 font-bold">{resource.author}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                {resource.subject && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium border border-slate-200">
                    Subject: {resource.subject}
                  </span>
                )}
                {resource.genre && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium border border-slate-200">
                    Genre: {resource.genre}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium border border-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {resource.location_room}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {resource.description}
              </p>

              {/* Rules & Requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Borrowing Rules:</strong> {resource.usage_rules}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Eligibility Criteria:</strong>{' '}
                    {resource.eligibility_requirements}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Controls */}
            {!isSchoolAdmin && (
              <div className="border-t border-slate-200 pt-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Request Duration:</span>
                  <select
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                  >
                    <option value={3}>3 Days (Short Lab Session)</option>
                    <option value={7}>7 Days (Standard Academic Loan)</option>
                    <option value={14}>14 Days (Extended Research Term)</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => addToCart(resource, selectedDays)}
                    className={`flex-1 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      inCart
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isAvailable
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700" /> Added to Session Cart
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Add to Session Cart
                      </>
                    )}
                  </button>

                  {inCart && (
                    <button
                      onClick={() => navigate('/cart')}
                      className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Cart →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Section */}
        {ai_recommendations && ai_recommendations.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Complementary Inter-School Curriculum Resources
                </h3>
                <p className="text-xs text-teal-700 font-mono font-semibold">
                  Scikit-Learn TF-IDF Semantic Matcher
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ai_recommendations.map((rec) => (
                <div
                  key={rec.resource_id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-400 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={rec.image_url}
                      alt={rec.title}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{rec.title}</h4>
                      <div className="text-[11px] text-teal-700 font-semibold mt-0.5">{rec.owning_school_name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {rec.similarity_score}% similarity score
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/resources/${rec.resource_id}`}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 text-center rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Inspect Asset
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
