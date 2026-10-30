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
  ScanLine,
  Lock
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-14 pb-20 border-b border-slate-200 bg-white">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-50 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-50 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Hackathon Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
              <Award className="w-4 h-4 text-teal-600" />
              <span>CodeVerse India National-Level Hackathon</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span className="text-slate-600">"Unlock Underused Equipment and Spaces"</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Share Knowledge. Share Resources.{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Empower Every School.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              <strong>LibShare AI</strong> unites neighboring institutions to unlock underused science laboratories, computing stations, rare books, and collaborative study pods through a trusted, transparent, and AI-optimized sharing network.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/marketplace"
                className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 group text-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Shared Marketplace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/analytics"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-300 transition-colors flex items-center gap-2 text-sm shadow-xs cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-teal-600" />
                AI Demand & Analytics
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-3xl font-black text-slate-900">3</div>
              <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Partner Institutions</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-3xl font-black text-teal-600">{platformStats.total_shared_resources}+</div>
              <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Shared Labs & Assets</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">QR Code Verified</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-3xl font-black text-cyan-600">TF-IDF</div>
              <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Curriculum Matching</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FOUR DISTINCT PORTALS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">
            <Layers className="w-4 h-4" />
            Independent Role-Based Access
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Access Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Each participating school maintains sovereign inventory controls and coordinator password authentication. Students discover cross-institutional resources seamlessly.
          </p>
        </div>

        {/* 4 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1: School A */}
          <div className="bg-white border-2 border-teal-500/20 hover:border-teal-500/60 rounded-3xl p-6 transition-all shadow-xs hover:shadow-lg group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-teal-200">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200 mb-2 uppercase">
                SCH-A PORTAL
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Greenwood High School
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Physics lab microscopes, STEM robotics laptops, and soundproof innovation arena bookings.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-200 mb-4">
                <span className="text-teal-700 font-bold">Password:</span> WeCodeCoders1
              </div>
            </div>
            <Link
              to="/school/school-a"
              className="w-full py-2.5 bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white font-bold rounded-xl text-xs text-center border border-teal-200 hover:border-teal-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Enter School A Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 2: School B */}
          <div className="bg-white border-2 border-blue-500/20 hover:border-blue-500/60 rounded-3xl p-6 transition-all shadow-xs hover:shadow-lg group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-blue-200">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 mb-2 uppercase">
                SCH-B PORTAL
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                St. Xavier Academy
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Computerized telescopes, Arduino kits, seminar pods, and algorithm textbooks.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-200 mb-4">
                <span className="text-blue-700 font-bold">Password:</span> WeCodeCoders2
              </div>
            </div>
            <Link
              to="/school/school-b"
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white font-bold rounded-xl text-xs text-center border border-blue-200 hover:border-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Enter School B Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 3: School C */}
          <div className="bg-white border-2 border-cyan-500/20 hover:border-cyan-500/60 rounded-3xl p-6 transition-all shadow-xs hover:shadow-lg group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-cyan-200">
                <School className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-50 text-cyan-800 border border-cyan-200 mb-2 uppercase">
                SCH-C PORTAL
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Delhi Model Senior Sec.
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Spectrophotometers, podcast recording studio, iPads, and graphing calculators.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-200 mb-4">
                <span className="text-cyan-700 font-bold">Password:</span> WeCodeCoders3
              </div>
            </div>
            <Link
              to="/school/school-c"
              className="w-full py-2.5 bg-cyan-50 hover:bg-cyan-600 text-cyan-800 hover:text-white font-bold rounded-xl text-xs text-center border border-cyan-200 hover:border-cyan-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Enter School C Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Portal 4: Student / User Portal */}
          <div className="bg-white border-2 border-purple-500/20 hover:border-purple-500/60 rounded-3xl p-6 transition-all shadow-xs hover:shadow-lg group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-purple-200">
                <User className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200 mb-2 uppercase">
                STUDENT & USER PORTAL
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Student Experience
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Multi-resource cart sessions, downloadable QR passes, and real-time coordinator alerts.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-200 mb-4">
                <span className="text-purple-700 font-bold">Demo:</span> student.arjun@demo.edu
              </div>
            </div>
            <Link
              to="/student"
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white font-bold rounded-xl text-xs text-center border border-purple-200 hover:border-purple-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Enter Student Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* THREE PILLARS SECTION */}
      <div className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">QR Handover & Return Protocol</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Approved bookings generate cryptographic QR passes that students can download as high-res images. Staff verify physical condition at handover and return to protect assets.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Scikit-Learn TF-IDF AI Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Mathematical vector similarity matches students to relevant peer-school apparatus, textbooks, and sensors based on syllabus context and curriculum keywords.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Institutional Isolation & Messaging</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Multi-resource carts are intelligently partitioned. School A only reviews requests for School A items. Coordinators can message students directly through the notification center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
