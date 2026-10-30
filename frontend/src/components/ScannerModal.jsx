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
  ClipboardList
} from 'lucide-react';
import { api } from '../services/api';

export default function ScannerModal({ isOpen, onClose, schoolId, onSuccess }) {
  const [activeTab, setActiveTab] = useState('manual'); // Default to manual for reliable hackathon demo testing!
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState('handover'); // 'handover' or 'return'
  const [conditionRating, setConditionRating] = useState('Good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [missingParts, setMissingParts] = useState('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const scannerRef = useRef(null);

  // Initialize camera scanner when camera tab is selected
  useEffect(() => {
    let scanner = null;
    if (isOpen && activeTab === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            setManualCode(decodedText);
            setActiveTab('manual'); // switch to review & submit condition
            scanner.clear();
          },
          (error) => {
            // normal scan failure, ignore
          }
        );
      } catch (err) {
        console.error("Camera init error:", err);
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
    setSuccessResult(null);
    setError(null);
    setConditionNotes('');
    setMissingParts('');
    setStaffRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Staff QR Handover & Return Station</h3>
            <p className="text-xs text-slate-400">Scan or enter token to process collection or return</p>
          </div>
        </div>

        {/* Operation Mode Selector: Handover vs Return */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('handover');
              handleReset();
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'handover'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
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
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'return'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔄 Resource Return Check-in
          </button>
        </div>

        {/* Success Banner if processed */}
        {successResult ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-5 mb-5 text-center animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white mb-1">
              {mode === 'handover' ? 'Resource Handover Confirmed!' : 'Return Check-in Completed!'}
            </h4>
            <p className="text-xs text-emerald-300 mb-3">{successResult.message}</p>
            <div className="bg-slate-900/80 p-3 rounded-lg text-xs text-left space-y-1 mb-4 text-slate-300 border border-slate-800">
              <div>
                <strong>Status:</strong>{' '}
                <span className="text-emerald-400 font-semibold">{successResult.status}</span>
              </div>
              <div>
                <strong>Condition Recorded:</strong> {successResult.condition_rating}
              </div>
              {successResult.is_late && (
                <div className="text-amber-400 font-semibold">⚠️ Returned past scheduled due date.</div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Scan Another Resource
            </button>
          </div>
        ) : (
          <>
            {/* Input Method Tabs */}
            <div className="flex border-b border-slate-800 mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'manual'
                    ? 'border-teal-400 text-teal-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                Token Code Input (Fast Demo)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'camera'
                    ? 'border-teal-400 text-teal-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera Scanner
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl mb-4 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Camera Viewport */}
            {activeTab === 'camera' ? (
              <div className="mb-4">
                <div
                  id="qr-reader"
                  className="bg-black rounded-xl overflow-hidden border border-slate-700 aspect-square max-w-[280px] mx-auto"
                ></div>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Position student's QR pass inside the scanner box
                </p>
              </div>
            ) : (
              /* Manual Input */
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    QR Handover Token Code
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. QR-SECURE-COLLECT-SCHA-78912"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-teal-300 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Quick-Fill demo tokens for evaluator convenience! */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Demo Tokens:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mode === 'handover' ? (
                      <button
                        type="button"
                        onClick={() => setManualCode('QR-SECURE-COLLECT-SCHA-78912')}
                        className="px-2 py-1 bg-slate-800 hover:bg-teal-900/40 text-teal-300 rounded border border-slate-700 text-[10px] font-mono"
                      >
                        ⚡ Sample Handover Pass (School A)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setManualCode('QR-SECURE-RETURN-SCHA-43210')}
                        className="px-2 py-1 bg-slate-800 hover:bg-blue-900/40 text-blue-300 rounded border border-slate-700 text-[10px] font-mono"
                      >
                        ⚡ Sample Return Pass (School A)
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 8: Staff Condition Assessment */}
                <div className="border-t border-slate-800 pt-3 space-y-3">
                  <div className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Staff Physical Condition Inspection
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Resource Condition Rating:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Excellent', 'Good', 'Fair', 'Damaged'].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setConditionRating(rating)}
                          className={`py-1.5 text-[11px] rounded font-medium transition-colors ${
                            conditionRating === rating
                              ? rating === 'Damaged'
                                ? 'bg-rose-500 text-white'
                                : 'bg-teal-500 text-slate-950 font-semibold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {mode === 'handover' ? 'Pre-Handover Inspection Notes:' : 'Damage / Condition Notes:'}
                    </label>
                    <input
                      type="text"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder={
                        mode === 'handover'
                          ? 'e.g. Lens verified clean, power adapter included'
                          : 'e.g. Minor scratches or signs of normal usage'
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {mode === 'return' && (
                    <>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Missing Accessories / Parts (if any):
                        </label>
                        <input
                          type="text"
                          value={missingParts}
                          onChange={(e) => setMissingParts(e.target.value)}
                          placeholder="e.g. Missing USB-C cable or HDMI connector"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Staff Remarks / Incidents (Staff Review Required):
                        </label>
                        <input
                          type="text"
                          value={staffRemarks}
                          onChange={(e) => setStaffRemarks(e.target.value)}
                          placeholder="e.g. No penalty applied; student noted minor hinge wear"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  disabled={loading || !manualCode.trim()}
                  onClick={handleSubmit}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
                    mode === 'handover'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/20'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading
                    ? 'Validating Token & Recording...'
                    : mode === 'handover'
                    ? 'Confirm Handover & Release Resource'
                    : 'Confirm Return & Restore Inventory'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
