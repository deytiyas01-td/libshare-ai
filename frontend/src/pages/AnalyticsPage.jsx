import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2,
  Share2
} from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#0d9488', '#0284c7', '#4f46e5', '#9333ea', '#db2777'];

export default function AnalyticsPage() {
  const [platformData, setPlatformData] = useState(null);
  const [demandInsights, setDemandInsights] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  useEffect(() => {
    if (selectedSchool !== 'all') {
      api.analytics.getSchool(selectedSchool)
        .then((data) => setSchoolData(data))
        .catch(console.error);
    } else {
      setSchoolData(null);
    }
  }, [selectedSchool]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [plat, insights] = await Promise.all([
        api.analytics.getPlatform(),
        api.ai.getDemandInsights(),
      ]);
      setPlatformData(plat);
      setDemandInsights(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Synthesizing multi-school cluster telemetry & AI models...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">
              <Cpu className="w-3.5 h-3.5" />
              Machine Learning & Telemetry
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Cluster Analytics & AI Demand Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Data intelligence powering the "Unlock Underused Equipment and Spaces" mission
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">View Scope:</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 shadow-xs"
            >
              <option value="all">Entire Multi-School Cluster</option>
              <option value="school-a">Greenwood High (School A)</option>
              <option value="school-b">St. Xavier Academy (School B)</option>
              <option value="school-c">Delhi Model Senior Sec (School C)</option>
            </select>
          </div>
        </div>

        {/* AI SUMMARY DIGEST */}
        {demandInsights && demandInsights.ai_generated_summary && (
          <div className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 border border-teal-200 rounded-3xl p-6 shadow-xs relative overflow-hidden animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-2">
                  <span>AI Cluster Utilization & Demand Digest</span>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full text-[10px] font-mono border border-teal-200">
                    Scikit-Learn TF-IDF + Anomaly Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
                  {demandInsights.ai_generated_summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOP LEVEL KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cluster Shared Assets</div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {schoolData ? schoolData.total_resources : platformData?.total_shared_resources}
            </div>
            <div className="text-xs text-teal-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Indexed & cataloged
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cross-School Bookings</div>
            <div className="text-3xl font-black text-cyan-700 mt-1">
              {schoolData ? schoolData.borrowed_resources : platformData?.active_cross_school_bookings}
            </div>
            <div className="text-xs text-cyan-700 font-semibold mt-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Inter-institutional loans
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Available for Circulation</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              {schoolData ? schoolData.available_resources : platformData?.available_resources}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">Ready for pickup</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Resource Utilization</div>
            <div className="text-3xl font-black text-teal-700 mt-1">
              {schoolData ? `${schoolData.utilization_rate}%` : '38.5%'}
            </div>
            <div className="text-xs text-teal-700 font-semibold mt-1">Surplus unlocking index</div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Category Distribution */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              Shared Equipment by Category
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData?.category_distribution || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {(platformData?.category_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inter-School Sharing Growth Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              Cross-School Borrowing Activity Timeline
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformData?.sharing_timeline || []}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cross_loans"
                    name="Inter-School Loans"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ fill: '#0d9488', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="equipments"
                    name="Assets Shared"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* UNDERUTILIZED ASSETS DISCOVERY */}
        {demandInsights && demandInsights.underutilized_resources && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Underutilized Asset Detection
                  </h3>
                  <p className="text-xs text-slate-500">
                    High inventory assets with low utilization eligible for inter-school promotion
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {demandInsights.underutilized_resources.length} Idle Assets Identified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demandInsights.underutilized_resources.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-teal-700 font-bold">{item.school_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      {item.utilization_pct}% utilization
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                  <div className="text-slate-600">
                    Inventory: {item.available_quantity} of {item.total_quantity} idle
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-slate-700 italic">
                    💡 {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEMAND SURGES & CAPACITY STATUS */}
        {demandInsights && demandInsights.category_analysis && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Curriculum Category Capacity Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Total Inventory</th>
                    <th className="py-3 px-4">Active Loans</th>
                    <th className="py-3 px-4">Utilization %</th>
                    <th className="py-3 px-4">Cluster Supply Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {demandInsights.category_analysis.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cat.category}</td>
                      <td className="py-3.5 px-4">{cat.total_inventory} units</td>
                      <td className="py-3.5 px-4">{cat.active_loans}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{cat.utilization_rate}%</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            cat.demand_status === 'High'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : cat.demand_status === 'Surplus'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {cat.demand_status} Capacity
                        </span>
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
  );
}
