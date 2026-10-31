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

  // Direct Message to Student Modal & Dedicated Message Center
  const [messageStudentModalOpen, setMessageStudentModalOpen] = useState(false);
  const [targetStudentForMessage, setTargetStudentForMessage] = useState(null);
  const [messageTitle, setMessageTitle] = useState('Important Notice Regarding Your Borrowed Resource');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [inlineMessageItemId, setInlineMessageItemId] = useState(null);
  const [inlineMessageStudentId, setInlineMessageStudentId] = useState(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineBody, setInlineBody] = useState('');
  const [messageSuccessAlert, setMessageSuccessAlert] = useState(null);
  const [selectedMessageRecipientId, setSelectedMessageRecipientId] = useState('');

  // New Restriction Form
  const [newRestriction, setNewRestriction] = useState({
    rule_description: '',
    restricted_category: 'All',
    min_grade: 'Class 10',
    require_faculty_approval: false,
  });

  // Equipment Management: Edit & Decommission / Delete Modals
  const [editingResource, setEditingResource] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [decommissionModalOpen, setDecommissionModalOpen] = useState(false);
  const [resourceToDecommission, setResourceToDecommission] = useState(null);
  const [decommissionReason, setDecommissionReason] = useState('Out of service / Damaged');
  const [decommissionNotes, setDecommissionNotes] = useState('');
  const [decommissioning, setDecommissioning] = useState(false);
  const [updatingResource, setUpdatingResource] = useState(false);

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

        const sentData = await api.school.getSentMessages(schoolId).catch(() => []);
        setSentMessages(sentData || []);
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

  const handleSendDirectMessage = async (studentId, title, body) => {
    const sId = studentId || targetStudentForMessage?.id || selectedMessageRecipientId;
    const sTitle = (title || messageTitle || `Notice from ${currentSchoolTitle}`).trim();
    const sBody = (body || messageBody).trim();

    if (!sId) {
      alert('Please select or specify a recipient student.');
      return;
    }
    if (!sBody) {
      alert('Please enter a message text in the text field before sending.');
      return;
    }

    setSendingMessage(true);
    try {
      const res = await api.school.messageStudent(schoolId, sId, sTitle, sBody);
      setMessageStudentModalOpen(false);
      setInlineMessageItemId(null);
      setInlineMessageStudentId(null);
      setMessageBody('');
      setInlineBody('');
      setMessageSuccessAlert(`✅ Notification successfully sent to ${res.student_name || 'student'}'s notification portal!`);
      setTimeout(() => setMessageSuccessAlert(null), 6000);

      const sentData = await api.school.getSentMessages(schoolId).catch(() => []);
      setSentMessages(sentData || []);
    } catch (err) {
      alert(err.message || 'Failed to dispatch notification to student portal');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendMessageToStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await handleSendDirectMessage(targetStudentForMessage?.id, messageTitle, messageBody);
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

  const handleOpenEditModal = (item) => {
    setEditingResource({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      total_quantity: item.total_quantity,
      available_quantity: item.available_quantity,
      location_room: item.location_room || '',
      usage_rules: item.usage_rules || '',
      eligibility_requirements: item.eligibility_requirements || '',
      status: item.status || 'Available',
      image_url: item.image_url || '',
      author: item.author || '',
      subject: item.subject || '',
      genre: item.genre || '',
    });
    setEditModalOpen(true);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    setUpdatingResource(true);
    try {
      await api.resources.update(editingResource.id, editingResource);
      setEditModalOpen(false);
      setEditingResource(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update equipment details');
    } finally {
      setUpdatingResource(false);
    }
  };

  const handleOpenDecommissionModal = (item) => {
    setResourceToDecommission(item);
    setDecommissionReason('Out of service / Damaged');
    setDecommissionNotes('');
    setDecommissionModalOpen(true);
  };

  const handleConfirmDecommission = async (e) => {
    e?.preventDefault();
    if (!resourceToDecommission) return;
    setDecommissioning(true);
    try {
      await api.resources.delete(resourceToDecommission.id);
      setDecommissionModalOpen(false);
      setResourceToDecommission(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to remove equipment');
    } finally {
      setDecommissioning(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const isCurrentlyAvail = item.status === 'Available' && item.available_quantity > 0;
      const updateData = isCurrentlyAvail
        ? { status: 'Under Maintenance', available_quantity: 0 }
        : { status: 'Available', available_quantity: item.total_quantity || 1 };
      await api.resources.update(item.id, updateData);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to toggle availability status');
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
            {/* Real-time Message Dispatched Alert */}
            {messageSuccessAlert && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{messageSuccessAlert}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMessageSuccessAlert(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

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
                Equipment & Asset Allocation ({inventory.length})
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
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 pb-3.5 px-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'messages'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Message Users
                {sentMessages.length > 0 && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black rounded-full">
                    {sentMessages.length}
                  </span>
                )}
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
                            <React.Fragment key={req.id}>
                              <tr className="hover:bg-slate-50/70 transition-colors">
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
                                      onClick={() => {
                                        if (inlineMessageItemId === req.id) {
                                          setInlineMessageItemId(null);
                                        } else {
                                          setInlineMessageItemId(req.id);
                                          setInlineTitle(`Notice from ${currentSchoolTitle} regarding ${req.resource_title}`);
                                          setInlineBody('');
                                        }
                                      }}
                                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        inlineMessageItemId === req.id
                                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                          : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border-slate-200'
                                      }`}
                                      title="Click to open text field and send notification to this student"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      {inlineMessageItemId === req.id ? 'Close Message' : 'Message Student'}
                                    </button>

                                    {req.status === 'Requested' ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleApproveRequest(req.id)}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                          title="Verify student & issue QR handover pass"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Issue QR Pass
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

                              {/* INLINE MESSAGE TEXT FIELD COMPOSER (Appears directly by clicking on Message) */}
                              {inlineMessageItemId === req.id && (
                                <tr className="bg-teal-50/60 border-y-2 border-teal-500/30 animate-fadeIn">
                                  <td colSpan={5} className="p-4 sm:p-5">
                                    <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                                          <Send className="w-4 h-4 text-teal-600" />
                                          Send Notification to {req.student_name} ({req.student_email})
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setInlineMessageItemId(null)}
                                          className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                                        >
                                          ✕ Close
                                        </button>
                                      </div>

                                      <div className="space-y-2.5">
                                        <div>
                                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Notification Title / Subject:
                                          </label>
                                          <input
                                            type="text"
                                            value={inlineTitle}
                                            onChange={(e) => setInlineTitle(e.target.value)}
                                            placeholder="e.g. Notice regarding your requested resource"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Message Text Field (Delivered to Student Notification Portal):
                                          </label>
                                          <textarea
                                            rows={3}
                                            value={inlineBody}
                                            onChange={(e) => setInlineBody(e.target.value)}
                                            placeholder={`Type your official notification message to ${req.student_name} here... (e.g. Your request has been approved. Please collect it from Computer Lab B between 10:00 AM and 3:00 PM.)`}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                        <div className="flex flex-wrap gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setInlineBody(
                                                'Your borrow request has been verified and approved. Please bring your physical ID card to the department desk for pickup.'
                                              )
                                            }
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-[10px] text-slate-600 hover:text-teal-800 rounded font-medium border border-slate-200 cursor-pointer"
                                          >
                                            ⚡ Ready for Pickup
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setInlineBody(
                                                'Please submit a clearer photo of your student admission receipt or ID before we can release the equipment.'
                                              )
                                            }
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-amber-50 text-[10px] text-slate-600 hover:text-amber-800 rounded font-medium border border-slate-200 cursor-pointer"
                                          >
                                            ⚡ ID Clarification
                                          </button>
                                        </div>

                                        <div className="flex items-center gap-2 self-end">
                                          <button
                                            type="button"
                                            onClick={() => setInlineMessageItemId(null)}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            disabled={sendingMessage || !inlineBody.trim()}
                                            onClick={() =>
                                              handleSendDirectMessage(req.student_id, inlineTitle, inlineBody)
                                            }
                                            className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            {sendingMessage ? 'Sending...' : 'Send to Student Portal'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
              <div className="space-y-6">
                {/* Header Action Banner */}
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 border border-teal-200/70 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Equipment Allocation Center
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      Offer & Manage Equipment for {currentSchoolTitle}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl mt-1 leading-relaxed">
                      Publish newly available lab tools, books, computers, and spaces for partner schools to borrow. You can update quantities, mark items under maintenance, or decommission items that are no longer available.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer shrink-0 transition-transform hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" /> Offer Available Equipment
                  </button>
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {inventory.map((item) => {
                    const isAvailable = item.status === 'Available' && item.available_quantity > 0;
                    const isMaintenance = item.status === 'Under Maintenance';

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow relative"
                      >
                        <div className="space-y-3">
                          <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            {/* Status Tag Overlay */}
                            <div className="absolute top-3 right-3">
                              {isAvailable && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                  <CheckCircle2 className="w-3 h-3" /> Available ({item.available_quantity})
                                </span>
                              )}
                              {isMaintenance && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                                  <AlertTriangle className="w-3 h-3" /> Under Maintenance
                                </span>
                              )}
                              {!isAvailable && !isMaintenance && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-600 text-white shadow-xs">
                                  Fully Booked
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-teal-700 font-black uppercase tracking-wider">
                                {item.category}
                              </span>
                              <span className="text-slate-400 font-mono font-medium">{item.location_room}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 truncate mt-1">{item.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Allocation Status:</span>
                            <span className="font-extrabold text-slate-900">
                              {item.available_quantity} of {item.total_quantity} In Stock
                            </span>
                          </div>
                        </div>

                        {/* Interactive Equipment Controls */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Update description, quantity, rules, or room details"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item)}
                              className={`py-2 px-3 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                isMaintenance
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                              title="Temporarily mark available or unavailable"
                            >
                              {isMaintenance ? 'Mark Available' : 'Maintenance'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenDecommissionModal(item)}
                            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200/60"
                            title="Remove or delete if not available with decommissioning record"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Remove / Retire Equipment</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                          className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs border border-teal-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          title="Click to open message text field and send notification to student"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                          <span>Message Student</span>
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

            {/* TAB 6: DEDICATED MESSAGE USERS & COMMUNICATIONS (Direct User Requirement: "by clicking on message every school can message users the school have to fill a text field which appears by clicking on messages and clicking send it will be sent to the user notification portal") */}
            {activeTab === 'messages' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Direct Student Messaging & Notification Center
                        </h3>
                        <p className="text-xs text-slate-500">
                          Fill in the text fields below to dispatch official notifications directly to any student user's portal
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={loadDashboardData}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
                    </button>
                  </div>

                  {/* Messaging Composer Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl">
                    <div className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Send className="w-4 h-4 text-teal-600" />
                      Compose New Message to Student
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select Recipient Student User *
                      </label>
                      <select
                        value={selectedMessageRecipientId}
                        onChange={(e) => setSelectedMessageRecipientId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                      >
                        <option value="">-- Choose a Student User to Message --</option>
                        {verifications.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.email}) — {s.school_name || 'Student'} [{s.grade || 'General'}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedMessageRecipientId && (
                      <div className="bg-white border border-teal-200 rounded-xl p-3 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-teal-900">
                            Recipient: {verifications.find((s) => s.id === selectedMessageRecipientId)?.full_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {verifications.find((s) => s.id === selectedMessageRecipientId)?.email} • {verifications.find((s) => s.id === selectedMessageRecipientId)?.school_name}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Recipient Selected
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Notification Subject / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        placeholder="e.g. Action Required: Collect Your Reserved Equipment"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Notification Message Text Field *
                        </label>
                        <span className="text-[10px] text-teal-700 font-semibold">
                          Delivered directly to user's notification portal
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Type your official notification message here... (e.g. Your borrow request has been verified and approved. Please bring your physical ID card to Computer Lab B between 10:00 AM and 2:00 PM for pickup.)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 resize-none"
                      />
                    </div>

                    {/* Quick Notification Template Chips */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-600 font-bold">Quick Templates:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMessageTitle('Equipment Ready for Handover');
                            setMessageBody('Your requested equipment has been prepared and inspected. Please bring your physical ID card to the department desk for pickup.');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          ⚡ Ready for Handover
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMessageTitle('Document Verification Clarification Required');
                            setMessageBody('We need a clearer photo of your student ID card or an official admission receipt before releasing the reserved asset.');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          ⚡ ID Clarification Required
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMessageTitle('Return Schedule Reminder');
                            setMessageBody('Reminder: Your borrowed resource is scheduled for return check-in tomorrow. Please return all included cables and accessories in clean condition.');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          ⚡ Return Reminder
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={sendingMessage || !selectedMessageRecipientId || !messageBody.trim()}
                      onClick={() => handleSendDirectMessage(selectedMessageRecipientId, messageTitle, messageBody)}
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sendingMessage ? 'Sending to Student Portal...' : 'Send to Student Notification Portal'}
                    </button>
                  </div>

                  {/* Dispatched Messages History */}
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">
                      Dispatched Notifications Log ({sentMessages.length})
                    </h4>
                    {sentMessages.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                        No messages sent yet. Use the composer above or the "Message" button on any request to dispatch notifications.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                        {sentMessages.map((msg) => (
                          <div key={msg.id} className="p-4 hover:bg-white transition-colors space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">{msg.title}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-[11px] text-teal-700 font-semibold">
                              To Student: {msg.recipient_name} ({msg.recipient_email}) — {msg.recipient_school}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                              {msg.message}
                            </p>
                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered to User Notification Portal
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
            <h3 className="text-lg font-bold text-slate-900 mb-4">Offer Available Equipment to Cluster ({currentSchoolTitle})</h3>
            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Resource / Equipment Title *</label>
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

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Image URL</label>
                <input
                  type="url"
                  value={newResource.image_url}
                  onChange={(e) => setNewResource({ ...newResource, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                />
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

      {/* MODAL: EDIT EQUIPMENT DETAILS */}
      {editModalOpen && editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Equipment Details</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update inventory counts, operational room location, or usage policies.
            </p>

            <form onSubmit={handleUpdateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Equipment Title *</label>
                <input
                  type="text"
                  required
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Operational Status *</label>
                  <select
                    value={editingResource.status}
                    onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Available">Available for Sharing</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Fully Booked">Fully Booked / In Use</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <select
                    value={editingResource.category}
                    onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Books">Books</option>
                    <option value="Computers and laptops">Computers and laptops</option>
                    <option value="Study spaces">Study spaces</option>
                    <option value="Science laboratory equipment">Science laboratory equipment</option>
                    <option value="Educational tools and devices">Educational tools and devices</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Available Units</label>
                  <input
                    type="number"
                    min="0"
                    value={editingResource.available_quantity}
                    onChange={(e) => setEditingResource({ ...editingResource, available_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Total Units</label>
                  <input
                    type="number"
                    min="1"
                    value={editingResource.total_quantity}
                    onChange={(e) => setEditingResource({ ...editingResource, total_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Room / Lab</label>
                  <input
                    type="text"
                    value={editingResource.location_room}
                    onChange={(e) => setEditingResource({ ...editingResource, location_room: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Usage Rules & Conditions</label>
                <input
                  type="text"
                  value={editingResource.usage_rules}
                  onChange={(e) => setEditingResource({ ...editingResource, usage_rules: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={updatingResource}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer"
                >
                  {updatingResource ? 'Saving...' : 'Save Updated Details'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DECOMMISSION & DELETE NOT AVAILABLE EQUIPMENT */}
      {decommissionModalOpen && resourceToDecommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Decommission / Remove Equipment</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              You are removing <strong>{resourceToDecommission.title}</strong> from {currentSchoolTitle}&apos;s catalog. Please provide the status report below to complete the removal:
            </p>

            <form onSubmit={handleConfirmDecommission} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Reason for Removal / Unavailability *</label>
                <select
                  value={decommissionReason}
                  onChange={(e) => setDecommissionReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  <option value="Out of service / Damaged">Equipment damaged / Sent for repair</option>
                  <option value="No longer available / Out of stock">No longer available / Out of stock</option>
                  <option value="Reserved for internal institutional curriculum">Reserved for internal school curriculum</option>
                  <option value="Missing or incomplete parts">Missing or incomplete components</option>
                  <option value="Replaced by upgraded equipment">Replaced with upgraded model</option>
                  <option value="Permanently decommissioned">Permanently decommissioned</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Additional Notes & Condition Details</label>
                <textarea
                  rows={2}
                  value={decommissionNotes}
                  onChange={(e) => setDecommissionNotes(e.target.value)}
                  placeholder="e.g. Lens broken during lab session; unit unserviceable until replacement arrives..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={decommissioning}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  {decommissioning ? 'Removing...' : 'Confirm Removal from Cluster'}
                </button>
                <button
                  type="button"
                  onClick={() => setDecommissionModalOpen(false)}
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

      {/* DIRECT STUDENT NOTIFICATION / MESSAGE MODAL */}
      {messageStudentModalOpen && targetStudentForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800">
            {/* Close Button */}
            <button
              onClick={() => setMessageStudentModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Send Direct Notification to Student
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatched in real-time to {targetStudentForMessage.full_name}'s notification portal
                </p>
              </div>
            </div>

            {/* Recipient Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {targetStudentForMessage.full_name}
                </span>
                <span className="text-[11px] font-semibold text-teal-700">
                  {targetStudentForMessage.school_name || 'Student Account'}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {targetStudentForMessage.email} {targetStudentForMessage.grade ? `• ${targetStudentForMessage.grade}` : ''}
              </div>
              {targetStudentForMessage.resource_title && (
                <div className="text-teal-800 font-medium text-[11px] pt-1.5 border-t border-slate-200 mt-1">
                  Regarding Asset: <strong>{targetStudentForMessage.resource_title}</strong>
                </div>
              )}
            </div>

            {/* Message Form */}
            <form onSubmit={handleSendMessageToStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Title / Subject:
                </label>
                <input
                  type="text"
                  required
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="e.g. Action Required: Collect Your Reserved Equipment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Message Body:
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Type your official message here... (e.g. Your borrow request has been verified. Please bring your physical ID card to Computer Lab B between 10:00 AM and 2:00 PM for pickup.)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={sendingMessage || !messageBody.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingMessage ? 'Sending Notification...' : 'Send to Student Notification Portal'}
                </button>
                <button
                  type="button"
                  onClick={() => setMessageStudentModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
