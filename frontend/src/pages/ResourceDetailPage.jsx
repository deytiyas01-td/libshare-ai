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
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading resource specifications...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 max-w-xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'This resource may have been relocated or archived.'}</p>
        <Link to="/marketplace" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-teal-300">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const { resource, ai_recommendations } = data;
  const inCart = isInCart(resource.id);
  const isAvailable = resource.available_quantity > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace Catalog
        </Link>

        {/* Main Resource Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-72 sm:h-96 lg:h-full bg-slate-950">
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-950/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                {resource.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md ${
                  isAvailable
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isAvailable ? `${resource.available_quantity} Units Available` : 'Reserved'}
              </span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Institution */}
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                <School className="w-4 h-4" />
                <span>{resource.owning_school_name || resource.owning_school_id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {resource.title}
              </h1>

              {resource.author && (
                <div className="text-sm text-slate-300">
                  Author / Manufacturer: <span className="text-white font-medium">{resource.author}</span>
                </div>
              )}

              {/* Location & Subject tags */}
              <div className="flex flex-wrap gap-2 text-xs">
                {resource.subject && (
                  <span className="px-2.5 py-1 bg-slate-950 rounded-lg text-slate-300 border border-slate-800">
                    Subject: {resource.subject}
                  </span>
                )}
                {resource.genre && (
                  <span className="px-2.5 py-1 bg-slate-950 rounded-lg text-slate-300 border border-slate-800">
                    Genre: {resource.genre}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg text-slate-300 border border-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  {resource.location_room}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {resource.description}
              </p>

              {/* Rules & Requirements */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Borrowing Rules:</strong> {resource.usage_rules}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Eligibility Criteria:</strong>{' '}
                    {resource.eligibility_requirements}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Controls */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Request Duration:</span>
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                >
                  <option value={3}>3 Days (Short Lab Trial)</option>
                  <option value={7}>7 Days (Standard Academic Loan)</option>
                  <option value={14}>14 Days (Extended Research Term)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => addToCart(resource, selectedDays)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    inCart
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isAvailable
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Multi-Resource Session
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add to Multi-Resource Session
                    </>
                  )}
                </button>

                {inCart && (
                  <button
                    onClick={() => navigate('/cart')}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold border border-slate-700"
                  >
                    View Cart →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {ai_recommendations && ai_recommendations.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Complementary Inter-School Resources
                  </h3>
                  <p className="text-xs text-teal-400 font-mono">
                    Scikit-Learn TF-IDF Semantic Matcher
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ai_recommendations.map((rec) => (
                <div
                  key={rec.resource_id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={rec.image_url}
                      alt={rec.title}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-800"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{rec.title}</h4>
                      <div className="text-[10px] text-teal-400 mt-0.5">{rec.owning_school_name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {rec.similarity_score}% similarity score
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/resources/${rec.resource_id}`}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 text-center rounded-lg text-[11px] font-medium border border-slate-800 transition-colors"
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
