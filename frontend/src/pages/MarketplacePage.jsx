import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
                      className="flex-1 py-2.5 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                    >
                      View Details
                    </Link>

                    {!isSchoolAdmin && (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => addToCart(item, 7)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          inCart
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isAvailable
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" /> In Session
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Book
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
