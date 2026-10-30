import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  School,
  User,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Building2,
  ScanLine
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState({
    total_schools: 3,
    total_shared_resources: 15,
    available_resources: 11,
    active_cross_school_bookings: 3,
  });

  useEffect(() => {
    api.analytics.getPlatform()
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Hackathon Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-medium tracking-wide">
              <Award className="w-4 h-4 text-teal-400" />
              <span>CodeVerse India National-Level Hackathon</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span className="text-slate-300">"Unlock Underused Equipment and Spaces"</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Share Knowledge. Share Resources.{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                Empower Every School.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              <strong>LibShare AI</strong> unlocks high-value science laboratories, computing stations, rare books, and collaborative study spaces across neighboring schools through a trusted, transparent, and AI-optimized sharing network.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/marketplace"
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 group text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Shared Marketplace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/analytics"
                className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Cpu className="w-4 h-4 text-teal-400" />
                AI Demand & Analytics
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-3xl font-extrabold text-teal-400">3</div>
              <div className="text-xs text-slate-400 mt-1">Partner Institutions</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-3xl font-extrabold text-cyan-400">{platformStats.total_shared_resources}+</div>
              <div className="text-xs text-slate-400 mt-1">Shared Resources & Labs</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">QR Handover Verified</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-3xl font-extrabold text-teal-300">TF-IDF</div>
              <div className="text-xs text-slate-400 mt-1">AI Curriculum Matching</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FOUR DISTINCT PORTALS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-widest mb-2">
            <Layers className="w-4 h-4" />
            Role-Based Access
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Choose Your Access Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Each participating school maintains an isolated inventory and independent approval workflow. Students discover cross-institutional resources seamlessly.
          </p>
        </div>

        {/* 4 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1: School A */}
          <div className="bg-slate-900 border border-teal-500/30 hover:border-teal-400/70 rounded-2xl p-6 transition-all shadow-xl hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-teal-500/30">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 mb-2">
                SCH-A PORTAL
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Greenwood High School
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Independent dashboard for Greenwood High inventory, student verifications, and incoming requests.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 mb-4">
                <span className="text-teal-400">Demo Password:</span> WeCodeCoders1
              </div>
            </div>
            <Link
              to="/school/school-a"
              className="w-full py-2.5 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-semibold rounded-xl text-xs text-center border border-teal-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              Enter School A Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 2: School B */}
          <div className="bg-slate-900 border border-blue-500/30 hover:border-blue-400/70 rounded-2xl p-6 transition-all shadow-xl hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-blue-500/30">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 mb-2">
                SCH-B PORTAL
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                St. Xavier Academy
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Manage astronomy equipment, coding workstations, acoustics pods, and approve student requests.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 mb-4">
                <span className="text-blue-400">Demo Password:</span> WeCodeCoders2
              </div>
            </div>
            <Link
              to="/school/school-b"
              className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-white font-semibold rounded-xl text-xs text-center border border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              Enter School B Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 3: School C */}
          <div className="bg-slate-900 border border-cyan-500/30 hover:border-cyan-400/70 rounded-2xl p-6 transition-all shadow-xl hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-cyan-500/30">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 mb-2">
                SCH-C PORTAL
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Delhi Model Senior Sec.
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Control spectrophotometers, digital podcast media rooms, math labs, and return handovers.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 mb-4">
                <span className="text-cyan-400">Demo Password:</span> WeCodeCoders3
              </div>
            </div>
            <Link
              to="/school/school-c"
              className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold rounded-xl text-xs text-center border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              Enter School C Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 4: Student / User Portal */}
          <div className="bg-slate-900 border border-purple-500/30 hover:border-purple-400/70 rounded-2xl p-6 transition-all shadow-xl hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-purple-500/30">
                <User className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 mb-2">
                STUDENT & USER PORTAL
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Student Experience
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Search multi-school catalog, submit multi-item cart bookings, view QR passes, and monitor return history.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 mb-4">
                <span className="text-purple-400">Demo Login:</span> student.arjun@demo.edu
              </div>
            </div>
            <Link
              to="/student"
              className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white font-semibold rounded-xl text-xs text-center border border-purple-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              Enter Student Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION: PROBLEM STATEMENT & HOW LIBSHARE AI SOLVES IT */}
      <div className="bg-slate-900/60 border-t border-b border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <ScanLine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">QR Handover & Return Protocol</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every approved item receives a unique cryptographic QR token. School coordinators inspect condition before release and upon return to prevent damage disputes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Scikit-Learn TF-IDF AI Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mathematical vector similarity matches students to relevant peer-school apparatus, textbooks, and sensors based on syllabus context and curriculum keywords.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Institutional Isolation & Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-resource carts are intelligently split. School A only reviews requests for School A items. Verified students only; no unauthorized data leakage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
