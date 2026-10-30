import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Clock, ShieldCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QRModal({ isOpen, onClose, item }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const isReturn = item.qr_action === 'RETURN' || item.status === 'Collected';
  const actionTitle = isReturn ? 'Return Handover Pass' : 'Collection Handover Pass';
  const qrValue = item.qr_token || `LIBSHARE-${item.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{actionTitle}</h3>
            <p className="text-xs text-slate-400">Present this QR code to the school staff coordinator</p>
          </div>
        </div>

        {/* Item Info Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 mb-5 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Resource:</span>
            <span className="font-semibold text-white truncate max-w-[200px]">
              {item.resource_title || 'Equipment / Book'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Owning School:</span>
            <span className="font-semibold text-teal-300">{item.owning_school_name || item.owning_school_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300">
              {item.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Due Date:</span>
            <span className="font-medium text-slate-200">
              {item.due_date ? new Date(item.due_date).toLocaleDateString() : '7 Days'}
            </span>
          </div>
        </div>

        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-inner mx-auto mb-5 max-w-[240px]">
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#0f172a"
          />
          <div className="text-[10px] text-slate-500 font-mono mt-2 tracking-wider">
            LIBSHARE-AUTHENTICATED
          </div>
        </div>

        {/* Plaintext Token Fallback for Manual Entry */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Manual Verification Token:</span>
            <button
              onClick={handleCopy}
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-[10px] font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="font-mono text-xs font-bold text-teal-300 tracking-wide select-all break-all">
            {qrValue}
          </div>
        </div>

        {/* Security & Expiration Notes */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-teal-950/20 border border-teal-500/20 p-2.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            Single-use cryptographic token. Does not expose your private student identity. Upon scan, staff will inspect resource condition before authorization.
          </span>
        </div>
      </div>
    </div>
  );
}
