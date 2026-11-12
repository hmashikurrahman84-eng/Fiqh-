import React, { useRef } from 'react';
import { UserPhotoState } from '../types';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders,
  CheckCircle,
} from 'lucide-react';

interface ToolbarProps {
  userPhoto: UserPhotoState;
  onUpdatePhoto: (updater: (prev: UserPhotoState) => UserPhotoState) => void;
  onFileSelected: (file: File) => void;
  onDownload: () => void;
  isDownloading: boolean;
  downloadSuccess: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  userPhoto,
  onUpdatePhoto,
  onFileSelected,
  onDownload,
  isDownloading,
  downloadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleZoomIn = () => {
    onUpdatePhoto((prev) => ({
      ...prev,
      zoom: Math.min(4, parseFloat((prev.zoom + 0.15).toFixed(2))),
    }));
  };

  const handleZoomOut = () => {
    onUpdatePhoto((prev) => ({
      ...prev,
      zoom: Math.max(0.5, parseFloat((prev.zoom - 0.15).toFixed(2))),
    }));
  };

  const handleReset = () => {
    onUpdatePhoto((prev) => ({
      ...prev,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
    }));
  };

  const handleRotate = () => {
    onUpdatePhoto((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleNudge = (dx: number, dy: number) => {
    onUpdatePhoto((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3.5 px-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main 5 Required Action Buttons in Bengali */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* 1. ছবি আপলোড করুন */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/30 active:scale-95 transition-all cursor-pointer border border-blue-400/30"
          title="গ্যালারি বা ফাইল থেকে ছবি নির্বাচন করুন"
        >
          <Upload className="w-4 h-4 text-blue-200" />
          <span>ছবি আপলোড করুন</span>
        </button>

        {/* 2. ছবি বড় করুন */}
        <button
          onClick={handleZoomIn}
          disabled={!userPhoto.image}
          className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-semibold text-sm transition-all border ${
            userPhoto.image
              ? 'bg-[#142145] hover:bg-[#1E3060] text-sky-100 border-sky-500/40 active:scale-95 cursor-pointer shadow-md'
              : 'bg-[#142145]/40 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
          }`}
          title="ছবি জুম ইন করুন"
        >
          <ZoomIn className="w-4 h-4 text-emerald-400" />
          <span>ছবি বড় করুন</span>
        </button>

        {/* 3. ছবি ছোট করুন */}
        <button
          onClick={handleZoomOut}
          disabled={!userPhoto.image}
          className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-semibold text-sm transition-all border ${
            userPhoto.image
              ? 'bg-[#142145] hover:bg-[#1E3060] text-sky-100 border-sky-500/40 active:scale-95 cursor-pointer shadow-md'
              : 'bg-[#142145]/40 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
          }`}
          title="ছবি জুম আউট করুন"
        >
          <ZoomOut className="w-4 h-4 text-amber-400" />
          <span>ছবি ছোট করুন</span>
        </button>

        {/* 4. আবার ঠিক করুন */}
        <button
          onClick={handleReset}
          disabled={!userPhoto.image}
          className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-semibold text-sm transition-all border ${
            userPhoto.image
              ? 'bg-[#142145] hover:bg-[#1E3060] text-sky-100 border-sky-500/40 active:scale-95 cursor-pointer shadow-md'
              : 'bg-[#142145]/40 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
          }`}
          title="ছবির প্রাথমিক অবস্থান ও জুমে ফিরিয়ে আনুন"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>আবার ঠিক করুন</span>
        </button>

        {/* 5. ছবি ডাউনলোড করুন */}
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer border border-emerald-400/40"
          title="সম্পূর্ণ হাই কোয়ালিটি ফটোকার্ড ডাউনলোড করুন"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : downloadSuccess ? (
            <CheckCircle className="w-4 h-4 text-emerald-200" />
          ) : (
            <Download className="w-4 h-4 text-emerald-200" />
          )}
          <span>{isDownloading ? 'প্রসেসিং...' : 'ছবি ডাউনলোড'}</span>
        </button>
      </div>

      {/* Advanced Fine-Tuning Drawer Toggle */}
      {userPhoto.image && (
        <div className="bg-[#111C38]/95 border border-sky-500/30 rounded-xl p-3.5 flex flex-col gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              সূক্ষ্ম সমন্বয় ও নিয়ন্ত্রণ
            </span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-sky-300 hover:text-white transition-colors font-medium cursor-pointer"
            >
              {showAdvanced ? 'সংক্ষেপ করুন' : 'তীরচিহ্ন ও ঘূর্ণন দেখান'}
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={userPhoto.zoom}
              onChange={(e) =>
                onUpdatePhoto((prev) => ({
                  ...prev,
                  zoom: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-sky-400 h-2 bg-[#1C2C55] rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-xs font-mono font-medium text-sky-200 w-12 text-right">
              {Math.round(userPhoto.zoom * 100)}%
            </span>
          </div>

          {/* Micro Pan & Rotate Controls */}
          {showAdvanced && (
            <div className="pt-2 border-t border-sky-500/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-sky-300 font-medium mr-1">সরান:</span>
                <button
                  onClick={() => handleNudge(0, -10)}
                  className="p-1.5 rounded-lg bg-[#18264C] hover:bg-[#203468] text-sky-100 border border-sky-500/30 cursor-pointer"
                  title="উপরে সরান"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNudge(0, 10)}
                  className="p-1.5 rounded-lg bg-[#18264C] hover:bg-[#203468] text-sky-100 border border-sky-500/30 cursor-pointer"
                  title="নিচে সরান"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNudge(-10, 0)}
                  className="p-1.5 rounded-lg bg-[#18264C] hover:bg-[#203468] text-sky-100 border border-sky-500/30 cursor-pointer"
                  title="বামে সরান"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNudge(10, 0)}
                  className="p-1.5 rounded-lg bg-[#18264C] hover:bg-[#203468] text-sky-100 border border-sky-500/30 cursor-pointer"
                  title="ডানে সরান"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#18264C] hover:bg-[#203468] text-sky-100 border border-sky-500/30 text-xs font-medium cursor-pointer"
                  title="ছবি ৯০ ডিগ্রি ঘুরান"
                >
                  <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>ঘুরান ({userPhoto.rotation}°)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
