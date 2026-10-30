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
  Sliders
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

  // New Restriction Form
  const [newRestriction, setNewRestriction] = useState({
    rule_description: '',
    restricted_category: 'All',
    min_grade: 'Class 10',
    require_faculty_approval: false,
  });

  const isCurrentAdmin = user && user.role === 'school_admin' && user.school_id === schoolId;

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

  const handleQuickLoginAsThisSchool = async () => {
    let password = 'WeCodeCoders1';
    if (schoolId === 'school-b') password = 'WeCodeCoders2';
    if (schoolId === 'school-c') password = 'WeCodeCoders3';

    try {
      await login({
        portal_type: 'school',
        email_or_school: schoolId,
        school_id: schoolId,
        password: password,
      });
      loadDashboardData();
    } catch (e) {
      setError(e.message || 'Login failed');
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

  const schoolNames = {
    'school-a': 'Greenwood High School (School A)',
    'school-b': 'St. Xavier Academy (School B)',
    'school-c': 'Delhi Model Senior Secondary (School C)',
  };

  const currentSchoolTitle = schoolNames[schoolId] || 'Institutional Portal';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* School Header & Role Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-2xl shadow-lg">
                <School className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 mb-1">
                  OFFICIAL INSTITUTIONAL DASHBOARD
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentSchoolTitle}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Isolated inventory management, independent request approvals, and QR handover desk
                </p>
              </div>
            </div>

            {/* Admin Authentication Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {!isCurrentAdmin ? (
                <button
                  type="button"
                  onClick={handleQuickLoginAsThisSchool}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Click Sign In as {schoolId.toUpperCase()} Staff
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Open QR Handover & Return Station
                </button>
              )}
            </div>
          </div>

          {/* Quick KPI Strip */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Assets</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{stats.total_resources}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Available</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{stats.available_resources}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Borrowed</div>
                <div className="text-xl font-extrabold text-blue-400 mt-0.5">{stats.borrowed_resources}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Pending Requests</div>
                <div className="text-xl font-extrabold text-amber-400 mt-0.5">{stats.pending_requests}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Overdue</div>
                <div className="text-xl font-extrabold text-rose-400 mt-0.5">{stats.overdue_items}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold">Utilization</div>
                <div className="text-xl font-extrabold text-teal-400 mt-0.5">{stats.utilization_rate}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'requests'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Incoming Requests
            {requests.filter((r) => r.status === 'Requested').length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full">
                {requests.filter((r) => r.status === 'Requested').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'inventory'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory & Asset Management ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'verifications'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Student Verifications
            {verifications.filter((v) => v.verification_status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.2 bg-teal-500 text-slate-950 text-[10px] font-bold rounded-full">
                {verifications.filter((v) => v.verification_status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'reports'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Condition & Incident Reports
          </button>

          <button
            onClick={() => setActiveTab('restrictions')}
            className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors shrink-0 ${
              activeTab === 'restrictions'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            School Restrictions ({restrictions.length})
          </button>
        </div>

        {/* TAB 1: INCOMING REQUESTS (Section 5 & 6) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Borrow Requests Routed to {schoolNames[schoolId] || 'This Institution'}
              </h3>
              <button
                type="button"
                onClick={loadDashboardData}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-teal-400 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {!isCurrentAdmin ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                🔒 You must sign in as <strong>{currentSchoolTitle}</strong> administrator to approve or reject requests.
                <div className="mt-3">
                  <button
                    onClick={handleQuickLoginAsThisSchool}
                    className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    1-Click Coordinator Sign In
                  </button>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                No incoming requests currently queued for this school.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Resource Requested</th>
                        <th className="py-3 px-4 font-semibold">Student / School</th>
                        <th className="py-3 px-4 font-semibold">Verification Status</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{req.resource_title}</div>
                            <div className="text-[10px] text-teal-400">{req.resource_category}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">{req.student_name}</div>
                            <div className="text-[10px] text-slate-400">
                              {req.student_school} • {req.student_grade}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.student_verification_status === 'Verified'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {req.student_verification_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'Requested'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : req.status === 'Ready for Collection'
                                  ? 'bg-teal-500/20 text-teal-300'
                                  : req.status === 'Collected'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : req.status === 'Returned'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'Requested' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingItem(req)}
                                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            ) : req.status === 'Ready for Collection' ? (
                              <button
                                type="button"
                                onClick={() => setScannerOpen(true)}
                                className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto"
                              >
                                <QrCode className="w-3.5 h-3.5" /> Handover Desk
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">Processed</span>
                            )}
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

        {/* TAB 2: INVENTORY & ASSET MANAGEMENT (Add/Edit/Remove) */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Equipment & Spaces Registered to {currentSchoolTitle}
              </h3>
              {isCurrentAdmin && (
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Resource
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-950">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[10px] text-teal-400 font-bold uppercase">{item.category}</div>
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs flex justify-between">
                      <span className="text-slate-400">Inventory Stock:</span>
                      <span className="font-semibold text-white">
                        {item.available_quantity} / {item.total_quantity} Available
                      </span>
                    </div>
                  </div>

                  {isCurrentAdmin && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">{item.location_room}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT VERIFICATIONS (Section 3 Requirement) */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Student Verification Queue ({verifications.length} Registered)
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect submitted School ID cards and Admission Receipts to verify student authenticity
                </p>
              </div>
            </div>

            {!isCurrentAdmin ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                🔒 You must sign in as this school's coordinator to verify students.
              </div>
            ) : verifications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                No students currently pending verification.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {verifications.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.verification_status === 'Verified'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : s.verification_status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {s.verification_status}
                        </span>
                        <span className="text-[10px] text-slate-400">{s.grade}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{s.full_name}</h4>
                        <div className="text-xs text-slate-400">{s.email}</div>
                        <div className="text-[11px] text-slate-400 mt-1">Age: {s.age} years</div>
                      </div>

                      {/* Verification Document Thumbnail & Preview Trigger */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                            alt="Document"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                          />
                          <div className="text-[11px]">
                            <div className="font-semibold text-slate-200">{s.document_type}</div>
                            <div className="text-[10px] text-teal-400">Attached by Student</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewStudent(s)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-[11px] flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyStudent(s.id, 'Verified', 'Verified against institutional admission records.')
                        }
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyStudent(s.id, 'Rejected', 'Invalid or unreadable document provided.')
                        }
                        className="py-1.5 px-3 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONDITION & INCIDENT REPORTS (Section 8 Requirement) */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Physical Condition & Incident Log</h3>
                <p className="text-xs text-slate-400">
                  Pre-handover and post-return inspection reports recorded by coordinators
                </p>
              </div>
            </div>

            {conditionReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                No physical condition reports recorded yet. Handover and return scans will populate this log.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Resource</th>
                      <th className="py-3 px-4 font-semibold">Inspection Stage</th>
                      <th className="py-3 px-4 font-semibold">Condition Rating</th>
                      <th className="py-3 px-4 font-semibold">Inspector Remarks</th>
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {conditionReports.map((cr) => (
                      <tr key={cr.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-white">{cr.resource_title}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cr.stage === 'Pre-Collection'
                                ? 'bg-teal-500/20 text-teal-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {cr.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-400">{cr.condition_rating}</td>
                        <td className="py-3 px-4 text-slate-400">{cr.damage_details || 'Normal inspection'}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
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

        {/* TAB 5: SCHOOL RESTRICTIONS (Section 6 Requirement) */}
        {activeTab === 'restrictions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Institutional Borrowing Policies ({currentSchoolTitle})
                </h3>
                <p className="text-xs text-slate-400">
                  Custom policies enforced strictly for this school's resources without impacting partner schools.
                </p>
              </div>
            </div>

            {/* Existing Restrictions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restrictions.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white">{r.rule_description}</div>
                    <div className="text-[11px] text-teal-400 font-mono">
                      Category: {r.restricted_category} • Min Grade: {r.min_grade || 'None'}
                    </div>
                  </div>
                  {isCurrentAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRestriction(r.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Restriction Form */}
            {isCurrentAdmin && (
              <form
                onSubmit={handleCreateRestriction}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-xl"
              >
                <h4 className="text-xs font-bold text-teal-300 uppercase">Add School-Specific Rule</h4>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rule Description *</label>
                  <input
                    type="text"
                    required
                    value={newRestriction.rule_description}
                    onChange={(e) =>
                      setNewRestriction({ ...newRestriction, rule_description: e.target.value })
                    }
                    placeholder="e.g. Science lab equipment requires Class 11+ student verification"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Category</label>
                    <select
                      value={newRestriction.restricted_category}
                      onChange={(e) =>
                        setNewRestriction({ ...newRestriction, restricted_category: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                    >
                      <option value="All">All Categories</option>
                      <option value="Science laboratory equipment">Science Laboratory Equipment</option>
                      <option value="Computers and laptops">Computers and Laptops</option>
                      <option value="Study spaces">Study Spaces</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Minimum Student Grade</label>
                    <input
                      type="text"
                      value={newRestriction.min_grade}
                      onChange={(e) =>
                        setNewRestriction({ ...newRestriction, min_grade: e.target.value })
                      }
                      placeholder="e.g. Class 11"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Policy Rule
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: QR HANDOVER & RETURN STATION */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        schoolId={schoolId}
        onSuccess={() => loadDashboardData()}
      />

      {/* MODAL 2: ADD RESOURCE */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Add New Resource to {schoolNames[schoolId]}</h3>
            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g. Van de Graaff High Voltage Generator"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category *</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Books">Books</option>
                    <option value="Computers and laptops">Computers and laptops</option>
                    <option value="Study spaces">Study spaces</option>
                    <option value="Science laboratory equipment">Science laboratory equipment</option>
                    <option value="Educational tools and devices">Educational tools and devices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Subject / Area</label>
                  <input
                    type="text"
                    value={newResource.subject}
                    onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                    placeholder="e.g. Physics, Chemistry, CS"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Key specifications, capabilities, and pedagogical purpose..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Total Quantity *</label>
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Facility / Room</label>
                  <input
                    type="text"
                    value={newResource.location_room}
                    onChange={(e) => setNewResource({ ...newResource, location_room: e.target.value })}
                    placeholder="e.g. Physics Lab Room 302"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl"
                >
                  Publish Asset to Cluster
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECTION REASON DIALOG */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-base font-bold text-white mb-2">Reject Request</h3>
            <p className="text-xs text-slate-400 mb-4">
              State the reason for not approving request for <strong>{rejectingItem.resource_title}</strong>:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 mb-4 focus:outline-none focus:border-rose-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRejectRequest}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: STUDENT ID DOCUMENT INSPECTION */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-base font-bold text-white mb-1">
              Verify Student Identity: {previewStudent.full_name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Document: {previewStudent.document_type} • Grade: {previewStudent.grade}
            </p>
            <div className="rounded-xl overflow-hidden bg-black max-h-72 flex items-center justify-center mb-4 border border-slate-800">
              <img
                src={previewStudent.document_url}
                alt="Student Document"
                className="max-h-72 object-contain"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleVerifyStudent(
                    previewStudent.id,
                    'Verified',
                    'ID photo & grade verified by institutional registrar.'
                  )
                }
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Mark Verified
              </button>
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
