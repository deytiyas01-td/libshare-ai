import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  School,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Laptop,
  Compass,
  FlaskConical,
  Wrench,
  AlertCircle,
  Plus,
  Check,
  Zap,
  QrCode,
  X,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';

const CATEGORIES = [
  { name: 'All Categories', icon: Filter },
  { name: 'Books', icon: BookOpen },
  { name: 'Computers and laptops', icon: Laptop },
  { name: 'Study spaces', icon: Compass },
  { name: 'Science laboratory equipment', icon: FlaskConical },
  { name: 'Educational tools and devices', icon: Wrench },
];

export default function MarketplacePage() {
  const [resources, setResources] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // AI recommendations
  const [aiRecs, setAiRecs] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick 1-Click Direct Request modal state
  const [quickItem, setQuickItem] = useState(null);
  const [quickDays, setQuickDays] = useState(7);
  const [quickNotes, setQuickNotes] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(null);
  const [activeQRModalItem, setActiveQRModalItem] = useState(null);

  const handleStartQuickRequest = (item) => {
    if (!user) {
      navigate('/login?portal=student');
      return;
    }
    setQuickItem(item);
    setQuickDays(7);
    setQuickNotes('');
    setQuickSuccess(null);
  };

  const handleConfirmQuickRequest = async (e) => {
    e.preventDefault();
    if (!quickItem) return;
    setQuickSubmitting(true);
    try {
      const res = await api.bookings.create({
        items: [{ resource_id: quickItem.id, days_requested: quickDays }],
        notes: quickNotes.trim() || 'Direct borrow request submitted via Marketplace',
      });
      setQuickSuccess({
        ...res,
        item: quickItem,
      });
      fetchResources();
    } catch (err) {
      alert(err.message || 'Borrow request failed');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const isSchoolAdmin = user && user.role === 'school_admin';

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [searchTerm, selectedCategory, selectedSchool, selectedAvailability]);

  const fetchSchools = async () => {
    try {
      const data = await api.schools.getAll();
      setSchools(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedSchool !== 'all') params.school_id = selectedSchool;
      if (selectedAvailability !== 'all') params.availability = selectedAvailability;

      const data = await api.resources.getAll(params);
      setResources(data);

      if (searchTerm || selectedCategory !== 'All Categories') {
        fetchAiRecommendations(searchTerm || selectedCategory);
      }
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiRecommendations = async (queryText) => {
    setAiLoading(true);
    try {
      const res = await api.ai.getRecommendations(null, queryText, 3);
      setAiRecs(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Inter-School Sharing Catalog
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Educational Resource Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Discover and borrow laboratory equipment, laptops, study pods, and academic textbooks across School A, School B, and School C
            </p>
          </div>

          {!isSchoolAdmin && (
            <div className="flex items-center gap-3">
              <Link
                to="/cart"
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                View Multi-Resource Cart Session
              </Link>
            </div>
          )}
        </div>

        {/* AI Recommendations Banner */}
        {aiRecs.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 border border-teal-200 rounded-3xl p-5 shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    AI Semantic Affinity Recommendations
                  </h3>
                  <span className="text-[10px] text-teal-700 font-mono font-semibold">
                    Scikit-Learn TF-IDF Vectorizer + Cosine Similarity
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Curriculum affinity matching
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiRecs.map((rec) => (
                <div
                  key={rec.resource_id}
                  className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 hover:border-teal-400 transition-colors shadow-xs"
                >
                  <img
                    src={rec.image_url}
                    alt={rec.title}
                    className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{rec.title}</h4>
                    <div className="text-[10px] text-teal-700 font-mono font-semibold">
                      {rec.similarity_score}% match • {rec.owning_school_name}
                    </div>
                    <Link
                      to={`/resources/${rec.resource_id}`}
                      className="text-[10px] text-slate-600 hover:text-teal-700 underline mt-0.5 inline-block font-medium"
                    >
                      View Specs & Rules →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by equipment name, author, subject, genre, tags..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="all">All Participating Schools</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="all">All Inventory Status</option>
                <option value="available">In Stock & Available Now</option>
                <option value="borrowed">Currently Borrowed / In Use</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading inter-school catalog...
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No resources found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Categories", or clearing school filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => {
              const inCart = isInCart(item.id);
              const isAvailable = item.available_quantity > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Image with badges */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 shadow-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-md ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isAvailable ? `${item.available_quantity} Available` : 'Reserved'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                          <School className="w-3.5 h-3.5" />
                          {item.owning_school_name || item.owning_school_id}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1 group-hover:text-teal-700 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        {item.author && (
                          <div className="text-xs text-slate-500 mt-0.5">By {item.author}</div>
                        )}
                        {item.subject && (
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Subject: {item.subject}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] space-y-1.5">
                        <div className="text-slate-700">
                          <strong className="text-slate-900">Rules:</strong> {item.usage_rules}
                        </div>
                        <div className="text-slate-700">
                          <strong className="text-slate-900">Eligibility:</strong> {item.eligibility_requirements}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <Link
                      to={`/resources/${item.id}`}
                      className="py-2.5 px-3 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                    >
                      Details
                    </Link>

                    {!isSchoolAdmin && (
                      <>
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleStartQuickRequest(item)}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isAvailable
                              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" /> Request
                        </button>

                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => addToCart(item, 7)}
                          title="Add to multi-resource session cart"
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            inCart
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {inCart ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK 1-CLICK BORROW REQUEST MODAL */}
      {quickItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800">
            <button
              onClick={() => {
                setQuickItem(null);
                setQuickSuccess(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {quickSuccess ? (
              <div className="text-center space-y-4 py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Borrow Request Submitted!</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Your request for <strong>{quickItem.title}</strong> has reached <strong>{quickItem.owning_school_name || quickItem.owning_school_id}</strong>'s coordinator desk.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-1.5 text-slate-700">
                  <div className="font-bold text-teal-800">📋 Awaiting Institutional Coordinator Verification</div>
                  <p className="text-[11px] text-slate-500">
                    The school coordinator is reviewing your request and uploaded document. Once approved, your official QR Handover Pass will be automatically generated and sent to your notifications portal.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    to="/student/profile"
                    onClick={() => {
                      setQuickItem(null);
                      setQuickSuccess(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
                  >
                    View Status in My Profile →
                  </Link>
                  <button
                    onClick={() => {
                      setQuickItem(null);
                      setQuickSuccess(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs text-center border border-slate-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmQuickRequest} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xl shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Request Educational Resource</h3>
                    <p className="text-xs text-teal-700 font-semibold">{quickItem.owning_school_name || quickItem.owning_school_id}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{quickItem.title}</div>
                  <div className="text-slate-500">{quickItem.category} • Location: {quickItem.location_room || 'Main Campus'}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Borrowing Loan Duration:
                  </label>
                  <select
                    value={quickDays}
                    onChange={(e) => setQuickDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                  >
                    <option value={3}>3 Days (Short Lab Session)</option>
                    <option value={7}>7 Days (Standard Academic Loan)</option>
                    <option value={14}>14 Days (Extended Research Term)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Purpose / Notes for Institutional Staff (Optional):
                  </label>
                  <input
                    type="text"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="e.g. For National Hackathon robotics development"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {quickSubmitting ? 'Submitting to School...' : `Submit Borrow Request to ${quickItem.owning_school_name || 'School'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {activeQRModalItem && (
        <QRModal
          isOpen={!!activeQRModalItem}
          onClose={() => setActiveQRModalItem(null)}
          bookingItem={activeQRModalItem}
        />
      )}
    </div>
  );
}
