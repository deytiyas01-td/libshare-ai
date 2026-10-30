import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  X,
  Camera,
  Keyboard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ClipboardList,
  User,
  GraduationCap,
  School,
  FileText,
  Search,
  Eye
} from 'lucide-react';
import { api } from '../services/api';

export default function ScannerModal({ isOpen, onClose, schoolId, onSuccess }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState('handover'); // 'handover' or 'return'
  const [conditionRating, setConditionRating] = useState('Good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [missingParts, setMissingParts] = useState('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Scanned Student Profile state
  const [scannedData, setScannedData] = useState(null);
  const [idPreviewOpen, setIdPreviewOpen] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (isOpen && activeTab === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            setManualCode(decodedText);
            setActiveTab('manual');
            handleLookup(decodedText);
            scanner.clear();
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera init error:', err);
      }
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleLookup = async (tokenToLookup = manualCode) => {
    const token = (tokenToLookup || '').trim();
    if (!token) return;

    setLookupLoading(true);
    setError(null);
    try {
      const data = await api.qr.lookup(token);
      setScannedData(data);
      // Automatically detect mode from QR action
      if (data.booking_item?.qr_action === 'RETURN' || data.booking_item?.status === 'Collected') {
        setMode('return');
      } else {
        setMode('handover');
      }
    } catch (err) {
      setError(err.message || 'Could not find booking record for this QR token.');
      setScannedData(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!manualCode.trim()) {
      setError('Please enter or scan a valid QR token.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      let result;
      if (mode === 'handover') {
        result = await api.qr.verifyHandover(
          manualCode.trim(),
          conditionRating,
          conditionNotes
        );
      } else {
        result = await api.qr.verifyReturn(
          manualCode.trim(),
          conditionRating,
          conditionNotes,
          missingParts,
          staffRemarks
        );
      }

      setSuccessResult(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Operation failed. Verify token authenticity.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setManualCode('');
    setScannedData(null);
    setSuccessResult(null);
    setError(null);
    setConditionNotes('');
    setMissingParts('');
    setStaffRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Staff QR Handover & Return Station</h3>
            <p className="text-xs text-slate-500">Scan QR pass to open student profile, verify identity & confirm dispatch</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('handover');
              handleReset();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'handover'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Resource Handover (Collection)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('return');
              handleReset();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'return'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔄 Resource Return Check-in
          </button>
        </div>

        {/* Success Banner */}
        {successResult ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-fadeIn mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {mode === 'handover' ? 'Resource Handover Confirmed!' : 'Return Check-in Completed!'}
            </h4>
            <p className="text-xs text-emerald-800 font-medium mb-4">{successResult.message}</p>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs text-left space-y-1 mb-4 text-slate-700">
              <div>
                <strong>Status:</strong>{' '}
                <span className="text-emerald-700 font-bold">{successResult.status}</span>
              </div>
              <div>
                <strong>Physical Inspection:</strong> {successResult.condition_rating}
              </div>
              {successResult.is_late && (
                <div className="text-amber-700 font-semibold">⚠️ Returned past scheduled due date.</div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Scan Another Pass
            </button>
          </div>
        ) : (
          <>
            {/* Input Method Tabs */}
            <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === 'manual'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                Token Code Input (Fast Verification)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === 'camera'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera Scanner
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'camera' ? (
              <div className="mb-4">
                <div
                  id="qr-reader"
                  className="bg-black rounded-2xl overflow-hidden border border-slate-300 aspect-square max-w-[280px] mx-auto shadow-sm"
                ></div>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                  Scan the student's QR pass from their phone or printed badge
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    QR Handover / Return Token Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. QR-SECURE-COLLECT-SCHA-78912"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      disabled={lookupLoading || !manualCode.trim()}
                      onClick={() => handleLookup()}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Search className="w-3.5 h-3.5" />
                      {lookupLoading ? 'Finding...' : 'Find Profile'}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Tokens */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                  <span className="text-slate-600 font-semibold">Quick Demo Tokens:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManualCode('QR-SECURE-COLLECT-SCHA-78912');
                        handleLookup('QR-SECURE-COLLECT-SCHA-78912');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 rounded-lg border border-teal-200 text-[11px] font-mono font-medium shadow-sm"
                    >
                      ⚡ Handover Pass (Arjun - Modern Physics)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualCode('QR-SECURE-RETURN-SCHA-43210');
                        handleLookup('QR-SECURE-RETURN-SCHA-43210');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-[11px] font-mono font-medium shadow-sm"
                    >
                      ⚡ Return Pass (Rohan - Dell Laptop)
                    </button>
                  </div>
                </div>

                {/* SCANNED STUDENT FULL PROFILE VIEW (Direct User Requirement!) */}
                {scannedData && (
                  <div className="bg-gradient-to-br from-teal-50/60 to-cyan-50/60 border-2 border-teal-500/40 rounded-2xl p-4 space-y-3.5 shadow-md animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Verified Student Profile
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          scannedData.student?.verification_status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {scannedData.student?.verification_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{scannedData.student?.full_name}</div>
                        <div className="text-slate-600 text-[11px]">{scannedData.student?.email}</div>
                        <div className="text-slate-700 font-medium mt-1 flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-teal-700" />
                          {scannedData.student?.school_name}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          Grade: {scannedData.student?.grade} • Age: {scannedData.student?.age}
                        </div>
                      </div>

                      {/* Student ID Card Preview */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
                        <img
                          src={scannedData.student?.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                          alt="Student ID Card"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-300 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setIdPreviewOpen(true)}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-900 truncate">
                            {scannedData.student?.document_type}
                          </div>
                          <div className="text-[10px] text-teal-700 font-medium">Uploaded by Student</div>
                          <button
                            type="button"
                            onClick={() => setIdPreviewOpen(true)}
                            className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline mt-1 flex items-center gap-0.5"
                          >
                            <Eye className="w-3 h-3" /> Enlarge ID Card
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booked Item Details */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
                      <img
                        src={scannedData.resource?.image_url}
                        alt={scannedData.resource?.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-teal-700 font-semibold">{scannedData.resource?.category}</div>
                        <div className="font-bold text-slate-900 truncate">{scannedData.resource?.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Facility: {scannedData.resource?.location_room} • Due: {new Date(scannedData.booking_item?.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Physical Condition Inspection */}
                <div className="border-t border-slate-200 pt-3.5 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Staff Physical Inspection & Checklist
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Resource Physical Condition:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Excellent', 'Good', 'Fair', 'Damaged'].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setConditionRating(rating)}
                          className={`py-1.5 text-xs rounded-xl font-bold transition-all ${
                            conditionRating === rating
                              ? rating === 'Damaged'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-teal-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {mode === 'handover' ? 'Pre-Handover Inspection Notes:' : 'Damage / Return Condition Notes:'}
                    </label>
                    <input
                      type="text"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder={
                        mode === 'handover'
                          ? 'e.g. Lens verified clean, power adapter included'
                          : 'e.g. Returned clean, battery charged'
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  {mode === 'return' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Missing Accessories (if any):
                        </label>
                        <input
                          type="text"
                          value={missingParts}
                          onChange={(e) => setMissingParts(e.target.value)}
                          placeholder="e.g. Missing USB cable or protective case"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Staff Remarks / Incident Resolution:
                        </label>
                        <input
                          type="text"
                          value={staffRemarks}
                          onChange={(e) => setStaffRemarks(e.target.value)}
                          placeholder="e.g. Coordinator verified normal classroom wear"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  disabled={loading || !manualCode.trim()}
                  onClick={handleSubmit}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-md ${
                    mode === 'handover'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading
                    ? 'Recording Inspection & Updating Inventory...'
                    : mode === 'handover'
                    ? 'Confirm Handover & Release Resource'
                    : 'Confirm Return & Restore Inventory'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ID CARD FULL PREVIEW MODAL */}
      {idPreviewOpen && scannedData?.student && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl text-slate-900">
            <button
              onClick={() => setIdPreviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-base font-bold mb-1">
              {scannedData.student.full_name} — {scannedData.student.document_type}
            </h4>
            <p className="text-xs text-slate-500 mb-3">{scannedData.student.school_name} • {scannedData.student.grade}</p>
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-96 flex items-center justify-center border border-slate-200">
              <img
                src={scannedData.student.document_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                alt="Enlarged ID Card"
                className="max-h-96 object-contain"
              />
            </div>
            <button
              onClick={() => setIdPreviewOpen(false)}
              className="w-full mt-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              Close ID Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
