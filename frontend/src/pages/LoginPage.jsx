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
        await login({
          portal_type: 'school',
          email_or_school: selectedSchool,
          school_id: selectedSchool,
          password: password.trim(),
        });
        navigate(`/school/${selectedSchool}`);
      } else {
        await login({
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Sign In to LibShare AI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your sovereign school dashboard or student station
          </p>
        </div>

        {/* Portal Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setPortalType('school');
              setPassword('WeCodeCoders1');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              portalType === 'school'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            School Coordinator
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalType('student');
              setEmail('student.arjun@demo.edu');
              setPassword('StudentDemo123');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              portalType === 'student'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Student / User
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl mb-4 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {portalType === 'school' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="school-a">Greenwood High School (School A)</option>
                <option value="school-b">St. Xavier Academy (School B)</option>
                <option value="school-c">Delhi Model Senior Secondary (School C)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student.arjun@demo.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              portalType === 'school'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
            } disabled:opacity-50`}
          >
            {loading ? 'Authenticating...' : portalType === 'school' ? 'Access School Portal' : 'Sign In as Student'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick 1-Click Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] text-slate-600 font-bold mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            1-Click Demo Fill:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleFillSchool('school-a', 'WeCodeCoders1')}
              className="p-2 bg-slate-50 hover:bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-left font-bold"
            >
              ⚡ School A Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillSchool('school-b', 'WeCodeCoders2')}
              className="p-2 bg-slate-50 hover:bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-left font-bold"
            >
              ⚡ School B Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillSchool('school-c', 'WeCodeCoders3')}
              className="p-2 bg-slate-50 hover:bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-900 text-left font-bold"
            >
              ⚡ School C Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleFillStudent('student.arjun@demo.edu', 'StudentDemo123')}
              className="p-2 bg-slate-50 hover:bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-left font-bold"
            >
              ⚡ Verified Student (Arjun)
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium">
          New student without an account?{' '}
          <Link to="/register" className="text-teal-700 hover:text-teal-800 font-bold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
