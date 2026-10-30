import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  School,
  Inbox,
  Package,
  QrCode,
  Users,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  BarChart3,
  RefreshCw,
  Eye,
  Sliders,
  Lock,
  Mail,
  Send,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScannerModal from '../components/ScannerModal';

export default function SchoolDashboardPage() {
  const { schoolId } = useParams();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [conditionReports, setConditionReports] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Password Login state for School Portal Gate (Direct User Requirement!)
  const [schoolPassword, setSchoolPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);

  // Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);

  // Add Resource Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Science laboratory equipment',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    author: '',
    subject: '',
    genre: '',
    total_quantity: 2,
    available_quantity: 2,
    location_room: 'Main Facility',
    usage_rules: 'Standard 7-day borrowing. Return in pristine condition.',
    eligibility_requirements: 'Verified partner school students.',
  });

  // Rejection Dialog
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Equipment currently reserved for faculty classes.');

  // Student Document Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);

  // Direct Message to Student Modal (Direct User Requirement!)
  const [messageStudentModalOpen, setMessageStudentModalOpen] = useState(false);
  const [targetStudentForMessage, setTargetStudentForMessage] = useState(null);
  const [messageTitle, setMessageTitle] = useState('Important Notice Regarding Your Borrowed Resource');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // New Restriction Form
  const [newRestriction, setNewRestriction] = useState({
    rule_description: '',
    restricted_category: 'All',
    min_grade: 'Class 10',
    require_faculty_approval: false,
  });

  const isCurrentAdmin = user && user.role === 'school_admin' && user.school_id === schoolId;

  const schoolNames = {
    'school-a': 'Greenwood High School (School A)',
    'school-b': 'St. Xavier Academy (School B)',
    'school-c': 'Delhi Model Senior Secondary (School C)',
  };

  const defaultPasswords = {
    'school-a': 'WeCodeCoders1',
    'school-b': 'WeCodeCoders2',
    'school-c': 'WeCodeCoders3',
  };

  const currentSchoolTitle = schoolNames[schoolId] || 'Institutional Portal';
  const expectedDemoPassword = defaultPasswords[schoolId] || 'WeCodeCoders1';

  useEffect(() => {
    loadDashboardData();
  }, [schoolId, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Analytics for this school
      const statsData = await api.analytics.getSchool(schoolId);
      setStats(statsData);

      // 2. Fetch inventory
      const invData = await api.resources.getAll({ school_id: schoolId });
      setInventory(invData);

      // If logged in as this school's admin, fetch requests, verifications, reports
      if (isCurrentAdmin) {
        const reqData = await api.school.getRequests(schoolId);
        setRequests(reqData);

        const verifData = await api.school.getVerifications(schoolId);
        setVerifications(verifData);

        const condData = await api.school.getConditionReports(schoolId);
        setConditionReports(condData);
      }

      // 3. Fetch restrictions
      const restrData = await api.school.getRestrictions(schoolId);
      setRestrictions(restrData);
    } catch (err) {
      setError(err.message || 'Failed to load school dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolPasswordLogin = async (e) => {
    e?.preventDefault();
    if (!schoolPassword.trim()) {
      setAuthError('Please enter the school coordinator password.');
      return;
    }

    setAuthenticating(true);
    setAuthError(null);

    try {
      await login({
        portal_type: 'school',
        email_or_school: schoolId,
        school_id: schoolId,
        password: schoolPassword.trim(),
      });
      setSchoolPassword('');
      loadDashboardData();
    } catch (err) {
      setAuthError(err.message || 'Invalid administrator password.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleApproveRequest = async (itemId) => {
    try {
      await api.school.decideRequest(schoolId, itemId, 'APPROVE');
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Approval failed');
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectingItem) return;
    try {
      await api.school.decideRequest(schoolId, rejectingItem.id, 'REJECT', rejectionReason);
      setRejectingItem(null);
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Rejection failed');
    }
  };

  const handleVerifyStudent = async (studentId, status, notes = '') => {
    try {
      await api.school.updateVerification(schoolId, studentId, status, notes);
      loadDashboardData();
      if (previewStudent) setPreviewStudent(null);
    } catch (e) {
      alert(e.message || 'Student verification update failed');
    }
  };

  const handleOpenMessageModal = (student) => {
    setTargetStudentForMessage(student);
    setMessageTitle(`Message from ${currentSchoolTitle}`);
    setMessageBody('');
    setMessageStudentModalOpen(true);
  };

  const handleSendMessageToStudent = async (e) => {
    e.preventDefault();
    if (!targetStudentForMessage || !messageBody.trim()) return;

    setSendingMessage(true);
    try {
      await api.school.messageStudent(
        schoolId,
        targetStudentForMessage.id,
        messageTitle.trim(),
        messageBody.trim()
      );
      setMessageStudentModalOpen(false);
      alert(`Notification sent directly to ${targetStudentForMessage.full_name || 'student'}'s notification center!`);
    } catch (err) {
      alert(err.message || 'Failed to send notification');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.resources.create(newResource);
      setAddModalOpen(false);
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm('Are you sure you want to remove this resource from the catalog?')) return;
    try {
      await api.resources.delete(id);
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleCreateRestriction = async (e) => {
    e.preventDefault();
    if (!newRestriction.rule_description.trim()) return;
    try {
      await api.school.createRestriction(schoolId, newRestriction);
      setNewRestriction({
        rule_description: '',
        restricted_category: 'All',
        min_grade: 'Class 10',
        require_faculty_approval: false,
      });
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Failed to save restriction rule');
    }
  };

  const handleDeleteRestriction = async (ruleId) => {
    try {
      await api.school.deleteRestriction(schoolId, ruleId);
      loadDashboardData();
    } catch (e) {
      alert(e.message || 'Failed to delete restriction');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* School Header Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-2xl shadow-xs">
                <School className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 mb-1">
                  OFFICIAL INSTITUTIONAL DASHBOARD
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentSchoolTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Sovereign inventory management, incoming student requests, ID card verification, and QR station
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            {isCurrentAdmin && (
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Staff QR Handover & Return Station
              </button>
            )}
          </div>

          {/* Quick KPI Strip */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Assets</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total_resources}</div>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Available</div>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">{stats.available_resources}</div>
              </div>
              <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200">
                <div className="text-[10px] text-blue-800 uppercase tracking-wider font-bold">Active Loans</div>
                <div className="text-2xl font-black text-blue-700 mt-0.5">{stats.borrowed_resources}</div>
              </div>
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                <div className="text-[10px] text-amber-800 uppercase tracking-wider font-bold">Pending Requests</div>
                <div className="text-2xl font-black text-amber-700 mt-0.5">{stats.pending_requests}</div>
              </div>
              <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200">
                <div className="text-[10px] text-rose-800 uppercase tracking-wider font-bold">Overdue Items</div>
                <div className="text-2xl font-black text-rose-700 mt-0.5">{stats.overdue_items}</div>
              </div>
              <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200">
                <div className="text-[10px] text-teal-800 uppercase tracking-wider font-bold">Utilization %</div>
                <div className="text-2xl font-black text-teal-700 mt-0.5">{stats.utilization_rate}%</div>
              </div>
            </div>
          )}
        </div>

        {/* PASSWORD LOGIN GATE FOR THIS SCHOOL (Direct User Requirement: "there is no field of password login for schools where i need to give password to access schools portal it should be included") */}
        {!isCurrentAdmin ? (
          <div className="bg-white border-2 border-teal-500/30 rounded-3xl p-8 max-w-xl mx-auto shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Coordinator Password Required</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Please enter the institutional password to access <strong>{currentSchoolTitle}</strong>'s private requests, verifications, and inventory controls.
              </p>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-700 flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSchoolPasswordLogin} className="space-y-4 text-left max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Institutional Coordinator Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Demo Password Pill */}
              <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-center justify-between">
                <span>Public Demo Password:</span>
                <button
                  type="button"
                  onClick={() => setSchoolPassword(expectedDemoPassword)}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 font-mono font-bold rounded-lg border border-teal-200 text-xs shadow-xs"
                >
                  ⚡ Fill "{expectedDemoPassword}"
                </button>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {authenticating ? 'Verifying...' : 'Unlock Coordinator Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED SCHOOL DASHBOARD TABS */
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'requests'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Incoming Requests
                {requests.filter((r) => r.status === 'Requested').length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                    {requests.filter((r) => r.status === 'Requested').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                Inventory & Assets ({inventory.length})
              </button>

              <button
                onClick={() => setActiveTab('verifications')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'verifications'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Student ID Verifications ({verifications.length})
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'reports'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Condition & Inspection Reports
              </button>

              <button
                onClick={() => setActiveTab('restrictions')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'restrictions'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Borrowing Restrictions ({restrictions.length})
              </button>
            </div>

            {/* TAB 1: INCOMING REQUESTS (Shows Student ID Card + Actions + Message Button) */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Incoming Resource Borrow Requests
                    </h3>
                    <p className="text-xs text-slate-500">
                      Requests routed strictly to {currentSchoolTitle}. Student ID cards can be inspected before approval.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadDashboardData}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-teal-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                  </button>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No incoming requests currently queued for this school.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="py-3.5 px-4">Resource Requested</th>
                            <th className="py-3.5 px-4">Borrower Student</th>
                            <th className="py-3.5 px-4">Student ID Card</th>
                            <th className="py-3.5 px-4">Request Status</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900">{req.resource_title}</div>
                                <div className="text-[11px] text-teal-700 font-semibold">{req.resource_category}</div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900">{req.student_name}</div>
                                <div className="text-[11px] text-slate-500">
                                  {req.student_school} • {req.student_grade}
                                </div>
                                <div className="text-[10px] text-slate-400">{req.student_email}</div>
                              </td>

                              {/* Student ID Card Preview (Direct User Requirement!) */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={req.student_document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                                    alt="Student ID"
                                    className="w-12 h-12 object-cover rounded-lg border border-slate-300 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() =>
                                      setPreviewStudent({
                                        full_name: req.student_name,
                                        document_type: req.student_document_type || 'School ID Card',
                                        document_url: req.student_document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                                        grade: req.student_grade,
                                        school_name: req.student_school,
                                      })
                                    }
                                  />
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewStudent({
                                          full_name: req.student_name,
                                          document_type: req.student_document_type || 'School ID Card',
                                          document_url: req.student_document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                                          grade: req.student_grade,
                                          school_name: req.student_school,
                                        })
                                      }
                                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Inspect ID
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                                    req.status === 'Requested'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : req.status === 'Ready for Collection'
                                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                      : req.status === 'Collected'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : req.status === 'Returned'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Direct Notification Message Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenMessageModal({
                                        id: req.student_id,
                                        full_name: req.student_name,
                                        email: req.student_email,
                                      })
                                    }
                                    className="p-1.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Send direct notification to this student"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> Message
                                  </button>

                                  {req.status === 'Requested' ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveRequest(req.id)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRejectingItem(req)}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                      </button>
                                    </>
                                  ) : req.status === 'Ready for Collection' ? (
                                    <button
                                      type="button"
                                      onClick={() => setScannerOpen(true)}
                                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <QrCode className="w-3.5 h-3.5" /> Handover Desk
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INVENTORY & ASSETS */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Registered Equipment & Facilities ({inventory.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage quantities, availability status, and add new assets to the shared cluster
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Asset
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-[10px] text-teal-700 font-black uppercase tracking-wider">
                            {item.category}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Stock Status:</span>
                          <span className="font-extrabold text-slate-900">
                            {item.available_quantity} of {item.total_quantity} Available
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">{item.location_room}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STUDENT ID VERIFICATIONS (Inspection & ID Card display) */}
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Student Identity Card Verification Desk
                    </h3>
                    <p className="text-xs text-slate-500">
                      Inspect uploaded School ID cards & admission receipts to grant verified status for borrowing
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {verifications.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              s.verification_status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : s.verification_status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {s.verification_status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">{s.grade}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{s.full_name}</h4>
                          <div className="text-xs text-slate-500">{s.email}</div>
                          <div className="text-[11px] text-teal-700 font-semibold mt-1">
                            {s.school_name || 'Partner Institution'}
                          </div>
                        </div>

                        {/* ID Card Display Card */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                              alt="ID Document"
                              className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewStudent(s)}
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{s.document_type}</div>
                              <div className="text-[10px] text-teal-700 font-semibold">Ready for Review</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPreviewStudent(s)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-teal-700 font-bold border border-slate-300 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Inspect
                          </button>
                        </div>
                      </div>

                      {/* Verification & Messaging Actions */}
                      <div className="pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleVerifyStudent(s.id, 'Verified', 'Verified against institutional admission records.')
                          }
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve ID
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMessageModal(s)}
                          className="py-2 px-3 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold rounded-xl text-xs border border-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Message this student"
                        >
                          <Mail className="w-3.5 h-3.5 text-teal-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CONDITION & INCIDENT REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Physical Condition & Inspection Log</h3>
                    <p className="text-xs text-slate-500">
                      Audit records of physical conditions recorded by staff at collection and return
                    </p>
                  </div>
                </div>

                {conditionReports.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
                    No physical condition reports recorded yet. Handover and return scans will populate this log.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-3.5 px-4">Resource</th>
                          <th className="py-3.5 px-4">Stage</th>
                          <th className="py-3.5 px-4">Condition Rating</th>
                          <th className="py-3.5 px-4">Inspector Remarks</th>
                          <th className="py-3.5 px-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {conditionReports.map((cr) => (
                          <tr key={cr.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{cr.resource_title}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  cr.stage === 'Pre-Collection'
                                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {cr.stage}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">{cr.condition_rating}</td>
                            <td className="py-3.5 px-4 text-slate-600">{cr.damage_details || 'Standard verification'}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(cr.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SCHOOL RESTRICTIONS */}
            {activeTab === 'restrictions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    School-Specific Borrowing Policies ({currentSchoolTitle})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rules enforced only for this institution's resources without impacting partner schools.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {restrictions.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">{r.rule_description}</div>
                        <div className="text-[11px] text-teal-700 font-semibold font-mono">
                          Category: {r.restricted_category} • Min Grade: {r.min_grade || 'None'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRestriction(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleCreateRestriction}
                  className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 max-w-xl shadow-xs"
                >
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Add School Policy Rule</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rule Description *</label>
                    <input
                      type="text"
                      required
                      value={newRestriction.rule_description}
                      onChange={(e) =>
                        setNewRestriction({ ...newRestriction, rule_description: e.target.value })
                      }
                      placeholder="e.g. Science lab equipment requires Class 11+ student verification"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Category</label>
                      <select
                        value={newRestriction.restricted_category}
                        onChange={(e) =>
                          setNewRestriction({ ...newRestriction, restricted_category: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      >
                        <option value="All">All Categories</option>
                        <option value="Science laboratory equipment">Science Laboratory Equipment</option>
                        <option value="Computers and laptops">Computers and Laptops</option>
                        <option value="Study spaces">Study Spaces</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Student Grade</label>
                      <input
                        type="text"
                        value={newRestriction.min_grade}
                        onChange={(e) =>
                          setNewRestriction({ ...newRestriction, min_grade: e.target.value })
                        }
                        placeholder="e.g. Class 11"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    Save Institutional Rule
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* SCANNER MODAL */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        schoolId={schoolId}
        onSuccess={() => loadDashboardData()}
      />

      {/* MODAL: DIRECT MESSAGE TO STUDENT (Direct User Requirement: "all schools able to message seperately to users through notification center") */}
      {messageStudentModalOpen && targetStudentForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setMessageStudentModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Message Student Directly</h3>
                <p className="text-xs text-slate-500">Delivered directly to {targetStudentForMessage.full_name}'s notification center</p>
              </div>
            </div>

            <form onSubmit={handleSendMessageToStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Notification Subject / Title</label>
                <input
                  type="text"
                  required
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="e.g. Your compound microscope is ready at Science Lab Room 102. Please bring your student ID card."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingMessage ? 'Sending...' : 'Send to Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setMessageStudentModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STUDENT ID CARD INSPECTION (Direct User Requirement: "if i give an input as id card any of the school portal cannot see the id card, this should be fixed") */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-slate-900">
            <button
              onClick={() => setPreviewStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-1">
              {previewStudent.full_name} — {previewStudent.document_type || 'Student ID Card'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Institution: {previewStudent.school_name} • Grade: {previewStudent.grade}
            </p>

            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-96 flex items-center justify-center mb-5 border-2 border-slate-200">
              <img
                src={previewStudent.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                alt="Student ID Card Inspection"
                className="max-h-96 object-contain"
              />
            </div>

            <div className="flex gap-2">
              {previewStudent.id && (
                <button
                  type="button"
                  onClick={() =>
                    handleVerifyStudent(
                      previewStudent.id,
                      'Verified',
                      'ID photo & enrollment verified by institutional coordinator.'
                    )
                  }
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Mark Verified
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="py-2.5 px-5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RESOURCE */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Asset to {currentSchoolTitle}</h3>
            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g. Compound Binocular Research Microscope 1000x"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category *</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Books">Books</option>
                    <option value="Computers and laptops">Computers and laptops</option>
                    <option value="Study spaces">Study spaces</option>
                    <option value="Science laboratory equipment">Science laboratory equipment</option>
                    <option value="Educational tools and devices">Educational tools and devices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Subject / Discipline</label>
                  <input
                    type="text"
                    value={newResource.subject}
                    onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                    placeholder="e.g. Physics, Chemistry, CS"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Key capabilities, components, and educational usage..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Total Units *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newResource.total_quantity}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        total_quantity: Number(e.target.value),
                        available_quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Room / Laboratory</label>
                  <input
                    type="text"
                    value={newResource.location_room}
                    onChange={(e) => setNewResource({ ...newResource, location_room: e.target.value })}
                    placeholder="e.g. Biology Lab 202"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Publish Asset to Cluster
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reject Borrow Request</h3>
            <p className="text-xs text-slate-500 mb-3">
              State the reason for not approving <strong>{rejectingItem.resource_title}</strong>:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 mb-4 focus:outline-none focus:border-rose-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRejectRequest}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
