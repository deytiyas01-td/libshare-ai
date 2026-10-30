import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Sparkles, School } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 text-sm mt-auto">
      {/* Demo Credentials Reminder Banner */}
      <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-cyan-900/90 border-b border-teal-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
            <span>CodeVerse India National-Level Hackathon — Public Demo Credentials</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-slate-200 font-mono text-[11px]">
            <span className="bg-slate-800/90 px-2.5 py-1 rounded-lg border border-teal-500/40">
              <strong className="text-teal-300">School A:</strong> WeCodeCoders1
            </span>
            <span className="bg-slate-800/90 px-2.5 py-1 rounded-lg border border-blue-500/40">
              <strong className="text-blue-300">School B:</strong> WeCodeCoders2
            </span>
            <span className="bg-slate-800/90 px-2.5 py-1 rounded-lg border border-cyan-500/40">
              <strong className="text-cyan-300">School C:</strong> WeCodeCoders3
            </span>
            <span className="bg-slate-800/90 px-2.5 py-1 rounded-lg border border-purple-500/40">
              <strong className="text-purple-300">Student:</strong> StudentDemo123
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                LibShare <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Smart Multi-School Library & Educational Resource Sharing Platform.
              Empowering schools to unlock underused laboratories, books, computing hardware, and collaborative spaces.
            </p>
            <div className="text-[11px] text-teal-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Problem: "Unlock Underused Equipment and Spaces"
            </div>
          </div>

          {/* Institutional Cluster */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Pilot School Cluster
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/school/school-a" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors">
                  <School className="w-3.5 h-3.5 text-teal-400" />
                  Greenwood High (School A)
                </Link>
              </li>
              <li>
                <Link to="/school/school-b" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors">
                  <School className="w-3.5 h-3.5 text-blue-400" />
                  St. Xavier Academy (School B)
                </Link>
              </li>
              <li>
                <Link to="/school/school-c" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  Delhi Model Senior Secondary (School C)
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/student" className="hover:text-teal-300 text-teal-400 font-bold">
                  → Student & Learner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Technologies & AI */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                QR Token Collection & Downloadable Passes
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                TF-IDF Semantic Recommendations
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Pre/Post Condition Assessments & ID Verification
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Independent School Request Routing & Messaging
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Hackathon Security Guardrails
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Multi-school requests are strictly partitioned on the backend. Only the owning school staff can inspect and approve their assets.
            </p>
            <div className="text-[11px] bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-300">
              <strong className="text-teal-400">Institutional Sovereignty:</strong> Coordinator passwords isolate School A, B, and C dashboards.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 LibShare AI — Share Knowledge. Share Resources. Empower Every School.
          </div>
          <div className="flex items-center gap-3 text-slate-300 font-medium">
            <span>FastAPI</span>
            <span>•</span>
            <span>React 19 + Vite</span>
            <span>•</span>
            <span>Scikit-Learn TF-IDF</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
