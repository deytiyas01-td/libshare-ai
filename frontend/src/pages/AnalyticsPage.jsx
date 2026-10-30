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

const COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

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
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 text-center text-sm">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Synthesizing multi-school cluster telemetry & AI models...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase tracking-widest mb-1">
              <Cpu className="w-3.5 h-3.5" />
              Machine Learning & Telemetry
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Cluster Analytics & AI Demand Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data intelligence powering the "Unlock Underused Equipment and Spaces" mission
            </p>
          </div>

          {/* School Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">View Scope:</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400"
            >
              <option value="all">Entire Multi-School Cluster</option>
              <option value="school-a">Greenwood High (School A)</option>
              <option value="school-b">St. Xavier Academy (School B)</option>
              <option value="school-c">Delhi Model Senior Sec (School C)</option>
            </select>
          </div>
        </div>

        {/* AI GENERATED EXECUTIVE SUMMARY (Section 9 Requirement) */}
        {demandInsights && demandInsights.ai_generated_summary && (
          <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/40 border border-teal-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span>AI Cluster Utilization & Demand Digest</span>
                  <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded text-[10px] font-mono">
                    Scikit-Learn TF-IDF + Anomaly Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {demandInsights.ai_generated_summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOP LEVEL KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-semibold uppercase">Cluster Shared Assets</div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {schoolData ? schoolData.total_resources : platformData?.total_shared_resources}
            </div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Indexed & cataloged
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-semibold uppercase">Cross-School Bookings</div>
            <div className="text-3xl font-extrabold text-cyan-400 mt-1">
              {schoolData ? schoolData.borrowed_resources : platformData?.active_cross_school_bookings}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Inter-institutional loans
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-semibold uppercase">Available for Circulation</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">
              {schoolData ? schoolData.available_resources : platformData?.available_resources}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Ready for pickup</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-semibold uppercase">Resource Utilization</div>
            <div className="text-3xl font-extrabold text-teal-300 mt-1">
              {schoolData ? `${schoolData.utilization_rate}%` : '38.5%'}
            </div>
            <div className="text-[11px] text-teal-400 mt-1">Surplus unlocking index</div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
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
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inter-School Sharing Growth Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Cross-School Borrowing Activity Timeline
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformData?.sharing_timeline || []}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cross_loans"
                    name="Inter-School Loans"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="equipments"
                    name="Assets Shared"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI SECTION: UNDERUTILIZED RESOURCES DISCOVERY (Section 9 Requirement) */}
        {demandInsights && demandInsights.underutilized_resources && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    AI Underutilized Asset Detection
                  </h3>
                  <p className="text-xs text-slate-400">
                    High inventory assets with low utilization eligible for inter-school promotion
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">
                {demandInsights.underutilized_resources.length} Idle Assets Identified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demandInsights.underutilized_resources.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-teal-400 font-semibold">{item.school_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {item.utilization_pct}% utilization
                    </span>
                  </div>
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <div className="text-slate-400">
                    Inventory: {item.available_quantity} of {item.total_quantity} idle
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 italic">
                    💡 {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 9 & 10: DEMAND SURGES & SURPLUS ANALYSIS */}
        {demandInsights && demandInsights.category_analysis && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Curriculum Category Capacity Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Total Inventory</th>
                    <th className="py-2.5 px-4 font-semibold">Active Loans</th>
                    <th className="py-2.5 px-4 font-semibold">Utilization %</th>
                    <th className="py-2.5 px-4 font-semibold">Cluster Supply Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {demandInsights.category_analysis.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-white">{cat.category}</td>
                      <td className="py-3 px-4">{cat.total_inventory} units</td>
                      <td className="py-3 px-4">{cat.active_loans}</td>
                      <td className="py-3 px-4 font-mono">{cat.utilization_rate}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cat.demand_status === 'High'
                              ? 'bg-rose-500/20 text-rose-300'
                              : cat.demand_status === 'Surplus'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-blue-500/20 text-blue-300'
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
