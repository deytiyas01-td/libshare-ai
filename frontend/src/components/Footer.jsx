import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Sparkles, School } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Demo Credentials Reminder Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-cyan-950/60 border-b border-teal-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-teal-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>CodeVerse India National-Level Hackathon — Demo Access Credentials</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-300 font-mono text-[11px]">
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-teal-500/30">
              <strong className="text-teal-400">School A:</strong> WeCodeCoders1
            </span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-blue-500/30">
              <strong className="text-blue-400">School B:</strong> WeCodeCoders2
            </span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-cyan-500/30">
              <strong className="text-cyan-400">School C:</strong> WeCodeCoders3
            </span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-purple-500/30">
              <strong className="text-purple-400">Student:</strong> StudentDemo123
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                LibShare <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Multi-School Library & Educational Resource Sharing Platform.
              Empowering schools to unlock underused laboratories, books, computing hardware, and collaborative spaces.
            </p>
            <div className="text-[11px] text-teal-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Problem: "Unlock Underused Equipment and Spaces"
            </div>
          </div>

          {/* Institutional Cluster */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Pilot School Cluster
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/school/school-a" className="hover:text-teal-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-teal-400" />
                  Greenwood High (School A)
                </Link>
              </li>
              <li>
                <Link to="/school/school-b" className="hover:text-teal-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-400" />
                  St. Xavier Academy (School B)
                </Link>
              </li>
              <li>
                <Link to="/school/school-c" className="hover:text-teal-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  Delhi Model Senior Secondary (School C)
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/student" className="hover:text-teal-400 text-teal-300 font-medium">
                  → Student & Learner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Technologies & AI */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                QR Token Collection & Return
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                TF-IDF Semantic Recommendations
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Pre/Post Condition Assessments
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Independent School Request Routing
              </li>
            </ul>
          </div>

          {/* CodeVerse India Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Hackathon Evaluation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Developed for the <strong className="text-slate-200">CodeVerse India National-Level Hackathon</strong>. Built for real-world inter-school resource collaboration and zero-waste educational infrastructure.
            </p>
            <div className="text-[11px] bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-400">
              <div className="text-teal-400 font-semibold mb-0.5">Role-Based Access Enforced:</div>
              Cross-school requests are strictly routed to the owning institution without leaking student data.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 LibShare AI — Share Knowledge. Share Resources. Empower Every School.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + Vite</span>
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
