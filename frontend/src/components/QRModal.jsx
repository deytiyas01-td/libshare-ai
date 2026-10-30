import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Clock, ShieldCheck, Copy, Check, Download, Sparkles } from 'lucide-react';

export default function QRModal({ isOpen, onClose, item, qrTokenOverride, resourceTitleOverride }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const qrValue = qrTokenOverride || item?.qr_token || `LIBSHARE-${item?.id || 'PASS'}`;
  const resourceTitle = resourceTitleOverride || item?.resource_title || 'Educational Resource';
  const schoolName = item?.owning_school_name || item?.owning_school_id || 'Partner School';
  const isReturn = item?.qr_action === 'RETURN' || item?.status === 'Collected';
  const actionTitle = isReturn ? 'Return Handover Pass' : 'Collection Handover Pass';

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    setDownloading(true);
    try {
      // Find the SVG element in DOM
      const svg = document.getElementById('qr-pass-svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // High-resolution canvas (800x950 for crystal clear print & scan quality)
      canvas.width = 800;
      canvas.height = 950;

      img.onload = () => {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Banner
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, 120);

        // Header Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIBSHARE AI — PASS', canvas.width / 2, 60);

        ctx.fillStyle = '#14b8a6';
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText(actionTitle.toUpperCase(), canvas.width / 2, 95);

        // Draw QR Code centered (500x500)
        ctx.drawImage(img, 150, 160, 500, 500);

        // Item info text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.fillText(resourceTitle, canvas.width / 2, 710);

        ctx.fillStyle = '#0d9488';
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillText(`School: ${schoolName}`, canvas.width / 2, 750);

        // Plaintext token
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`Token: ${qrValue}`, canvas.width / 2, 800);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText('Single-use encrypted pass. Verified at school library/lab desk.', canvas.width / 2, 860);

        // Download trigger
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `libshare-qr-${qrValue}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        setDownloading(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('QR download failed:', e);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800">
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
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{actionTitle}</h3>
            <p className="text-xs text-slate-500">Present to staff at the library/lab coordinator desk</p>
          </div>
        </div>

        {/* Item Details Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Resource:</span>
            <span className="font-bold text-slate-900 truncate max-w-[210px]">
              {resourceTitle}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Owning School:</span>
            <span className="font-semibold text-teal-700">{schoolName}</span>
          </div>
          {item?.due_date && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled Due:</span>
              <span className="font-semibold text-slate-800">
                {new Date(item.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* High Contrast QR Code Canvas */}
        <div className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm mx-auto mb-4 max-w-[260px]">
          <QRCodeSVG
            id="qr-pass-svg"
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#0f172a"
          />
          <div className="text-[10px] text-slate-400 font-mono mt-2 tracking-widest font-semibold uppercase">
            LibShare Cryptographic Pass
          </div>
        </div>

        {/* Plaintext Token Code for Easy Copying */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 mb-5">
          <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-medium">Verification Token Code:</span>
            <button
              onClick={handleCopy}
              className="text-teal-700 hover:text-teal-800 flex items-center gap-1 text-[11px] font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 tracking-wider select-all break-all bg-white p-1.5 rounded border border-slate-200">
            {qrValue}
          </div>
        </div>

        {/* Download Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={downloading}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Preparing Image...' : 'Download QR Code Pass (High-Res PNG)'}
          </button>
          <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> High-contrast resolution suitable for mobile scan or paper print
          </div>
        </div>
      </div>
    </div>
  );
}
