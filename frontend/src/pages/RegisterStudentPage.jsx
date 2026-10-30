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
  ShieldAlert
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
  const [fileName, setFileName] = useState('student_identity_card_scan.jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      // In web demo, read as Data URL for instant realistic preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

      // Redirect directly to student profile to see pending verification status
      navigate('/student/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Student Registration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join the LibShare AI multi-school educational resource sharing network
          </p>
        </div>

        {/* Verification Policy Alert */}
        <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl mb-6 text-xs text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Trust & Verification Protocol:</strong> All student accounts initially receive <strong>Pending</strong> verification status. Your institutional coordinator will inspect your uploaded School ID or Admission Receipt before borrow requests can be completed.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl mb-5 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.sharma@demo.edu"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Home Institution *</label>
              <select
                value={schoolId}
                onChange={(e) => {
                  setSchoolId(e.target.value);
                  if (e.target.value === 'school-a') setSchoolName('Greenwood High School (School A)');
                  if (e.target.value === 'school-b') setSchoolName('St. Xavier Academy (School B)');
                  if (e.target.value === 'school-c') setSchoolName('Delhi Model Senior Secondary (School C)');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="school-a">Greenwood High School (School A)</option>
                <option value="school-b">St. Xavier Academy (School B)</option>
                <option value="school-c">Delhi Model Senior Secondary (School C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Age *</label>
              <input
                type="number"
                min="10"
                max="25"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Class / Grade *</label>
            <input
              type="text"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Class 11 - Science (PCM + Bio)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Verification Document Upload (Section 3 Requirement) */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="text-xs font-semibold text-teal-300 flex items-center justify-between">
              <span>Verification Document Upload *</span>
              <span className="text-[10px] text-slate-400">School ID or Admission Receipt</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                >
                  <option value="School ID Card">School ID Card</option>
                  <option value="Admission Receipt">Admission Receipt</option>
                  <option value="Library Pass / Bonafide Certificate">Library Pass / Bonafide</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Upload File / Image</label>
                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs cursor-pointer transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{fileName || 'Choose File'}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleDocumentChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Document Preview Thumbnail */}
            {documentUrl && (
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <img
                  src={documentUrl}
                  alt="Identity Verification Preview"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{documentType} Selected</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Document attached for coordinator review
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Submitting Registration...' : 'Complete Registration & Access Student Portal'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login?portal=student" className="text-teal-400 hover:text-teal-300 font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
