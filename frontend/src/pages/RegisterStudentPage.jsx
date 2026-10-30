import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  School,
  GraduationCap,
  FileText,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterStudentPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState(16);
  const [schoolName, setSchoolName] = useState('Greenwood High School (School A)');
  const [schoolId, setSchoolId] = useState('school-a');
  const [grade, setGrade] = useState('Class 10 - Section A');
  const [documentType, setDocumentType] = useState('School ID Card');
  const [documentUrl, setDocumentUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80');
  const [fileName, setFileName] = useState('student_id_card.jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseSample = (type, url, name) => {
    setDocumentType(type);
    setDocumentUrl(url);
    setFileName(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (age < 10 || age > 25) {
      setError('Please provide a valid student age between 10 and 25.');
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        confirm_password: confirmPassword.trim(),
        age: Number(age),
        school_name: schoolName,
        school_id: schoolId,
        grade: grade.trim(),
        document_type: documentType,
        document_url: documentUrl,
      });

      navigate('/student/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50 text-slate-800 font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 border border-teal-200 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Student Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the LibShare AI multi-school educational resource sharing platform
          </p>
        </div>

        {/* Verification Policy Alert */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl mb-6 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Trust & Verification Protocol:</strong> All accounts initially receive <strong>Pending</strong> verification. Your school administrator will inspect your uploaded School ID or Admission Receipt before borrow requests can be finalized.
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl mb-5 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.sharma@demo.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Home Institution *</label>
              <select
                value={schoolId}
                onChange={(e) => {
                  setSchoolId(e.target.value);
                  if (e.target.value === 'school-a') setSchoolName('Greenwood High School (School A)');
                  if (e.target.value === 'school-b') setSchoolName('St. Xavier Academy (School B)');
                  if (e.target.value === 'school-c') setSchoolName('Delhi Model Senior Secondary (School C)');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="school-a">Greenwood High School (School A)</option>
                <option value="school-b">St. Xavier Academy (School B)</option>
                <option value="school-c">Delhi Model Senior Secondary (School C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Age *</label>
              <input
                type="number"
                min="10"
                max="25"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Class / Grade *</label>
            <input
              type="text"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Class 11 - Science (PCM + Bio)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>

          {/* Verification Document Upload (Direct User Requirement!) */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Verification Document Upload *</span>
              <span className="text-[10px] text-teal-700 font-semibold">School ID or Admission Receipt</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                >
                  <option value="School ID Card">School ID Card</option>
                  <option value="Admission Receipt">Admission Receipt</option>
                  <option value="Library Pass / Bonafide">Library Pass / Bonafide</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select File / Image</label>
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{fileName || 'Upload Photo'}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleDocumentChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Quick Demo Pre-set Document options */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
              <span className="text-slate-600 font-semibold">Quick Sample Documents for Demo:</span>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleChooseSample(
                      'School ID Card',
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
                      'sample_school_id_card.jpg'
                    )
                  }
                  className="px-2 py-1 bg-white hover:bg-teal-50 text-teal-800 rounded border border-teal-200 text-[10px] font-bold"
                >
                  📄 Sample School ID Card
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChooseSample(
                      'Admission Receipt',
                      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
                      'sample_admission_receipt.jpg'
                    )
                  }
                  className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-800 rounded border border-blue-200 text-[10px] font-bold"
                >
                  📄 Sample Admission Receipt
                </button>
              </div>
            </div>

            {/* Document Preview Thumbnail */}
            {documentUrl && (
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={documentUrl}
                  alt="Identity Verification Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{documentType} Selected</div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Document ready for coordinator verification
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Submitting Registration...' : 'Complete Registration & Access Student Portal'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login?portal=student" className="text-teal-700 hover:text-teal-800 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
