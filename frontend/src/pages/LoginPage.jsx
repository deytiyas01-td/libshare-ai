import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { School, User, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const defaultPortal = searchParams.get('portal') === 'school' ? 'school' : 'student';
  const defaultSchool = searchParams.get('school') || 'school-a';

  const [portalType, setPortalType] = useState(defaultPortal);
  const [selectedSchool, setSelectedSchool] = useState(defaultSchool);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Quick demo autofill handlers
  const handleFillSchool = (schoolId, pass) => {
    setPortalType('school');
    setSelectedSchool(schoolId);
    setPassword(pass);
    setError(null);
  };

  const handleFillStudent = (studentEmail, pass) => {
    setPortalType('student');
    setEmail(studentEmail);
    setPassword(pass);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (portalType === 'school') {
        const user = await login({
          portal_type: 'school',
          email_or_school: selectedSchool,
          school_id: selectedSchool,
          password: password.trim(),
        });
        navigate(`/school/${selectedSchool}`);
      } else {
        const user = await login({
          portal_type: 'student',
          email_or_school: email.trim(),
          password: password.trim(),
        });
        navigate('/student/profile');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        {/* Portal Switcher Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Sign In to LibShare AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your institution dashboard or student resource station
          </p>
        </div>

        {/* Portal Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setPortalType('school');
              setPassword('WeCodeCoders1');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              portalType === 'school'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            School Admin Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalType('student');
              setEmail('student.arjun@demo.edu');
              setPassword('StudentDemo123');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              portalType === 'student'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Student / User Portal
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl mb-4 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {portalType === 'school' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Participating School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  if (e.target.value === 'school-a') setPassword('WeCodeCoders1');
                  if (e.target.value === 'school-b') setPassword('WeCodeCoders2');
                  if (e.target.value === 'school-c') setPassword('WeCodeCoders3');
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="school-a">Greenwood High School (School A)</option>
                <option value="school-b">St. Xavier Academy (School B)</option>
                <option value="school-c">Delhi Model Senior Secondary (School C)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Student Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student.arjun@demo.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              portalType === 'school'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/20'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/20'
            } disabled:opacity-50`}
          >
            {loading ? 'Authenticating...' : portalType === 'school' ? 'Enter School Dashboard' : 'Sign In as Student'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Demo Buttons for Hackathon Evaluators! */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Evaluator 1-Click Quick Demo Login:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => handleFillSchool('school-a', 'WeCodeCoders1')}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-teal-500/30 text-teal-300 text-left"
            >
              ⚡ School A Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillSchool('school-b', 'WeCodeCoders2')}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-blue-500/30 text-blue-300 text-left"
            >
              ⚡ School B Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillSchool('school-c', 'WeCodeCoders3')}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-cyan-500/30 text-cyan-300 text-left"
            >
              ⚡ School C Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillStudent('student.arjun@demo.edu', 'StudentDemo123')}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-purple-500/30 text-purple-300 text-left"
            >
              ⚡ Verified Student (Arjun)
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-5 text-center text-xs text-slate-400">
          New student without an account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
