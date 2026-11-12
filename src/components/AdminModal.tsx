import React, { useState, useRef, useEffect } from 'react';
import { PosterTemplate, FrameConfig } from '../types';
import {
  X,
  Upload,
  Lock,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Move,
  Maximize2,
  Palette,
  RefreshCw,
  Download,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { getInitialDefaultTemplate } from '../utils/defaultTemplates';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PosterTemplate[];
  activeTemplateId: string;
  onSaveTemplate: (template: PosterTemplate, makeActive?: boolean) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSetActiveTemplate: (templateId: string) => void;
  onResetToDefault: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSaveTemplate,
  onDeleteTemplate,
  onSetActiveTemplate,
  onResetToDefault,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('photocard_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'upload' | 'list' | 'backup'>('upload');

  // Form states for creating/editing a template
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('জামিয়া কারীমিয়া আরাবিয়া');
  const [address, setAddress] = useState('রামপুরা মাদরাসা, ঢাকা-১২১৯');
  const [conferenceName, setConferenceName] = useState('দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা');
  const [bgImageSrc, setBgImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 1080, height: 1080 });

  // Frame position & styling states
  const [frame, setFrame] = useState<FrameConfig>({
    x: 214,
    y: 614,
    width: 262,
    height: 262,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0284c7', // Matching Canva blue border
    innerBorderColor: '#ffffff',
    shape: 'square',
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const filePickerRef = useRef<HTMLInputElement>(null);

  // Interactive Calibrator Canvas Ref
  const calibratorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCalibratorDragging, setIsCalibratorDragging] = useState(false);
  const calibratorDragStart = useRef<{ x: number; y: number; initialFx: number; initialFy: number } | null>(null);

  // Load active template initially into form
  useEffect(() => {
    const active = templates.find((t) => t.id === activeTemplateId) || templates[0];
    if (active && !editingTemplateId) {
      loadTemplateIntoForm(active);
    }
  }, [activeTemplateId, templates]);

  const loadTemplateIntoForm = (tpl: PosterTemplate) => {
    setEditingTemplateId(tpl.id);
    setTitle(tpl.title);
    setInstitution(tpl.institution);
    setAddress(tpl.address || 'রামপুরা মাদরাসা, ঢাকা-১২১৯');
    setConferenceName(tpl.conferenceName);
    setBgImageSrc(tpl.backgroundImage);
    setImageSize({ width: tpl.width, height: tpl.height });
    setFrame({ ...tpl.frame });
    setSaveSuccessMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin password is 'admin123'
    if (passwordInput === 'admin123' || passwordInput === '123456') {
      setIsAuthenticated(true);
      sessionStorage.setItem('photocard_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড লিখুন (ডিফল্ট: admin123)');
    }
  };

  // Handle uploading custom Canva/Photoshop poster
  const handleUploadBgImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        setBgImageSrc(result);
        setImageSize({ width: img.width, height: img.height });

        // Auto position frame at lower-middle-left if it's a new upload
        const suggestedW = Math.round(img.width * 0.35);
        const suggestedH = suggestedW; // Square frame
        const suggestedX = Math.round(img.width * 0.1);
        const suggestedY = Math.round(img.height * 0.55);

        setFrame((prev) => ({
          ...prev,
          x: suggestedX,
          y: suggestedY,
          width: suggestedW,
          height: suggestedH,
        }));

        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Draw interactive frame calibrator canvas
  useEffect(() => {
    if (!isOpen || !isAuthenticated || activeTab !== 'upload' || !bgImageSrc) return;

    const canvas = calibratorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayW = 380;
    const scale = displayW / imageSize.width;
    const displayH = Math.round(imageSize.height * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    const bgImg = new Image();
    bgImg.onload = () => {
      // 1. Draw uploaded image
      ctx.drawImage(bgImg, 0, 0, displayW, displayH);

      // 2. Draw semi-transparent dim overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, displayW, displayH);

      // 3. Cut out the frame area and show clearly
      const fx = frame.x * scale;
      const fy = frame.y * scale;
      const fw = frame.width * scale;
      const fh = frame.height * scale;

      ctx.save();
      ctx.beginPath();
      if (frame.borderRadius > 0) {
        ctx.roundRect(fx, fy, fw, fh, frame.borderRadius * scale);
      } else {
        ctx.rect(fx, fy, fw, fh);
      }
      ctx.clip();
      ctx.drawImage(bgImg, 0, 0, displayW, displayH);

      // Sample preview avatar inside frame
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.fillRect(fx, fy, fw, fh);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
      ctx.fillText('ব্যবহারকারীর ছবি', fx + fw / 2, fy + fh / 2);
      ctx.restore();

      // 4. Draw the Blue Border overlay
      ctx.save();
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = Math.max(2, frame.borderWidth * scale);
      if (frame.borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, frame.borderRadius * scale);
        ctx.stroke();
      } else {
        ctx.strokeRect(fx, fy, fw, fh);
      }

      // Drag handles and center crosshair
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx + fw / 2, fy + fh / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    bgImg.src = bgImageSrc;
  }, [isOpen, isAuthenticated, activeTab, bgImageSrc, frame, imageSize]);

  // Calibrator Canvas Mouse Drag handlers
  const handleCalibratorPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = calibratorCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    setIsCalibratorDragging(true);
    calibratorDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialFx: frame.x,
      initialFy: frame.y,
    };
  };

  const handleCalibratorPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isCalibratorDragging || !calibratorDragStart.current) return;
    const canvas = calibratorCanvasRef.current;
    if (!canvas) return;

    const scale = imageSize.width / canvas.width;
    const dx = (e.clientX - calibratorDragStart.current.x) * scale;
    const dy = (e.clientY - calibratorDragStart.current.y) * scale;

    const newX = Math.round(
      Math.max(0, Math.min(imageSize.width - frame.width, calibratorDragStart.current.initialFx + dx))
    );
    const newY = Math.round(
      Math.max(0, Math.min(imageSize.height - frame.height, calibratorDragStart.current.initialFy + dy))
    );

    setFrame((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleCalibratorPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCalibratorDragging) {
      setIsCalibratorDragging(false);
      calibratorDragStart.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleSaveCurrentDesign = (makeActive = true) => {
    if (!bgImageSrc) {
      alert('অনুগ্রহ করে ক্যানভা বা ফটোশপের ডিজাইন ছবি আপলোড করুন');
      return;
    }

    const tpl: PosterTemplate = {
      id: editingTemplateId || `tpl-${Date.now()}`,
      title: title || 'ক্যানভা/ফটোশপ ডিজাইন',
      institution: institution || 'জামিয়া কারীমিয়া আরাবিয়া',
      address: address || 'রামপুরা মাদরাসা, ঢাকা-১২১৯',
      conferenceName: conferenceName || 'দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা',
      backgroundImage: bgImageSrc,
      width: imageSize.width,
      height: imageSize.height,
      frame: { ...frame },
      published: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    onSaveTemplate(tpl, makeActive);
    setEditingTemplateId(tpl.id);
    setSaveSuccessMsg(
      makeActive
        ? 'ডিজাইন সফলভাবে সংরক্ষিত ও মূল ফটোকার্ড হিসেবে সক্রিয় করা হয়েছে!'
        : 'ডিজাইন সফলভাবে সংরক্ষিত হয়েছে!'
    );

    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4000);
  };

  const handleStartNewUpload = () => {
    setEditingTemplateId(null);
    setTitle('নতুন ফটোকার্ড ডিজাইন (১০৮০×১০৮০)');
    setInstitution('জামিয়া কারীমিয়া আরাবিয়া');
    setAddress('রামপুরা মাদ্রাসা, ঢাকা');
    setConferenceName('দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা');
    setBgImageSrc('');
    setImageSize({ width: 1080, height: 1080 });
    setFrame({
      x: 214,
      y: 614,
      width: 262,
      height: 262,
      borderRadius: 0,
      borderWidth: 4,
      borderColor: '#0284c7',
      innerBorderColor: '#ffffff',
      shape: 'square',
    });
    setSaveSuccessMsg('');
    filePickerRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                অ্যাডমিন প্যানেল - ডিজাইন ও ফ্রেম সেটিংস
              </h2>
              <p className="text-xs text-slate-400">
                ক্যানভা বা ফটোশপের নতুন ডিজাইন আপলোড ও ছবির ফ্রেমের অবস্থান সমন্বয় করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If not authenticated, show passcode screen */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">অ্যাডমিন প্রবেশাধিকার</h3>
            <p className="text-xs text-slate-400 mb-5">
              ডিজাইন পরিবর্তন ও ফ্রেম ক্যালিবার করতে অ্যাডমিন পাসওয়ার্ড লিখুন
            </p>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
              <div>
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড লিখুন (ডিফল্ট: admin123)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 text-center"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                প্রবেশ করুন
              </button>

              <div className="text-xs text-slate-500 mt-2">
                সহজ পরীক্ষার জন্য ডিফল্ট পাসওয়ার্ড: <span className="text-slate-300 font-mono">admin123</span>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Views */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-400 bg-slate-900/60 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>ডিজাইন আপলোড ও ফ্রেম ক্যালিব্রেটর</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-400 bg-slate-900/60 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>সংরক্ষিত ডিজাইন ({templates.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'backup'
                    ? 'border-blue-500 text-blue-400 bg-slate-900/60 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>রিসেট ও ব্যাকআপ</span>
              </button>
            </div>

            {/* Tab 1: Design Upload & Visual Frame Calibrator */}
            {activeTab === 'upload' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left side: Upload & Visual Calibrator Canvas */}
                <div className="lg:col-span-6 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-blue-400" />
                      ইন্টারেক্টিভ ফ্রেম ক্যালিব্রেটর
                    </span>
                    <button
                      onClick={() => filePickerRef.current?.click()}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>অন্য ডিজাইন আপলোড</span>
                    </button>
                  </div>

                  <input
                    ref={filePickerRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadBgImage(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  {/* Calibrator Area */}
                  {bgImageSrc ? (
                    <div className="relative rounded-xl border-2 border-slate-700 bg-slate-950 p-1 flex flex-col items-center shadow-xl max-w-full">
                      <canvas
                        ref={calibratorCanvasRef}
                        onPointerDown={handleCalibratorPointerDown}
                        onPointerMove={handleCalibratorPointerMove}
                        onPointerUp={handleCalibratorPointerUp}
                        onPointerCancel={handleCalibratorPointerUp}
                        className={`block rounded-lg touch-none ${
                          isCalibratorDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        style={{ maxWidth: '100%', height: 'auto' }}
                        title="ফ্রেমটি টেনে আপনার ডিজাইনের সঠিক স্থানে বসান"
                      />

                      <div className="mt-2 text-center text-xs text-slate-400">
                        মাউস বা আঙুল দিয়ে নীল ফ্রেমটি টেনে যেকোনো স্থানে বসান
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => filePickerRef.current?.click()}
                      className="w-full h-72 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors bg-slate-800/30"
                    >
                      <Upload className="w-10 h-10 text-blue-400 mb-2 animate-bounce" />
                      <h4 className="text-sm font-semibold text-slate-200">
                        ক্যানভা বা ফটোশপের ডিজাইন ছবি আপলোড করুন
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        PNG বা JPG ফাইল নির্বাচন করুন। আপলোড করার সাথে সাথে মূল ডিজাইনে পরিণত হবে।
                      </p>
                    </div>
                  )}

                  {/* Quick Action under calibrator */}
                  <div className="mt-3 w-full flex items-center justify-between text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                    <span>ডিজাইন সাইজ: {imageSize.width} × {imageSize.height} px</span>
                    <span className="text-blue-400">বর্গাকার ফ্রেম: {frame.width} × {frame.height} px</span>
                  </div>
                </div>

                {/* Right side: Frame Controls & Metadata Form */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  {saveSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Card Title & Institution inputs */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      ডিজাইনের বিবরণ
                    </h3>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">ডিজাইনের নাম</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="উদা: সম্মেলন ফটোকার্ড ২০২৪"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">প্রতিষ্ঠানের নাম</label>
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="জামিয়া কারীমিয়া আরাবিয়া"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">অনুষ্ঠানের নাম</label>
                        <input
                          type="text"
                          value={conferenceName}
                          onChange={(e) => setConferenceName(e.target.value)}
                          placeholder="ইসলামী সম্মেলন ও ফিকহি কর্মশালা"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frame Position & Dimension Sliders */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>ছবির ফ্রেমের সূক্ষ্ম অবস্থান (পিক্সেল)</span>
                      <span className="text-blue-400 font-mono">X:{frame.x} Y:{frame.y}</span>
                    </h3>

                    {/* Frame Size (Square Width & Height) */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>ফ্রেমের সাইজ (দৈর্ঘ্য ও প্রস্থ)</span>
                        <span className="text-slate-200 font-mono">{frame.width} px</span>
                      </div>
                      <input
                        type="range"
                        min="150"
                        max={imageSize.width}
                        value={frame.width}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFrame((prev) => ({
                            ...prev,
                            width: val,
                            height: val, // Keep strictly square as requested
                          }));
                        }}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setFrame((prev) => ({ ...prev, width: 262, height: 262, x: 214, y: 614, borderWidth: 4, borderColor: '#0284c7' }))}
                          className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-[10px] text-white font-medium"
                        >
                          ক্যানভা ফ্রেম (২৬২px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrame((prev) => ({ ...prev, width: 410, height: 410, x: 80, y: 495 }))}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-200"
                        >
                          বড় ফ্রেম (৪১০px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrame((prev) => ({ ...prev, width: 1080, height: 1080, x: 0, y: 0 }))}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-200"
                        >
                          ফুল ১০৮০×১০৮০
                        </button>
                      </div>
                    </div>

                    {/* Frame X Position Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>বামে / ডানে অবস্থান (X অক্ষ)</span>
                        <span className="text-slate-200 font-mono">{frame.x} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(10, imageSize.width - frame.width)}
                        value={frame.x}
                        onChange={(e) =>
                          setFrame((prev) => ({ ...prev, x: parseInt(e.target.value) }))
                        }
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Frame Y Position Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>উপরে / নিচে অবস্থান (Y অক্ষ)</span>
                        <span className="text-slate-200 font-mono">{frame.y} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(10, imageSize.height - frame.height)}
                        value={frame.y}
                        onChange={(e) =>
                          setFrame((prev) => ({ ...prev, y: parseInt(e.target.value) }))
                        }
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Border Width & Color */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>বর্ডার পুরুত্ব</span>
                          <span className="text-slate-200 font-mono">{frame.borderWidth} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={frame.borderWidth}
                          onChange={(e) =>
                            setFrame((prev) => ({ ...prev, borderWidth: parseInt(e.target.value) }))
                          }
                          className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">বর্ডারের রঙ</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={frame.borderColor}
                            onChange={(e) =>
                              setFrame((prev) => ({ ...prev, borderColor: e.target.value }))
                            }
                            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <div className="flex gap-1">
                            {['#1d4ed8', '#2563eb', '#0284c7', '#059669', '#d97706'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setFrame((prev) => ({ ...prev, borderColor: c }))}
                                style={{ backgroundColor: c }}
                                className={`w-5 h-5 rounded-full border ${
                                  frame.borderColor === c ? 'border-white scale-110' : 'border-transparent'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                    <button
                      onClick={() => handleSaveCurrentDesign(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>সংরক্ষণ ও মূল ডিজাইন হিসেবে সেট করুন</span>
                    </button>

                    <button
                      onClick={handleStartNewUpload}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
                    >
                      নতুন ডিজাইন আপলোড
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Manage Saved Templates List */}
            {activeTab === 'list' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200">
                    সংরক্ষিত ফটোকার্ড ডিজাইন সমূহ ({templates.length})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      handleStartNewUpload();
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>নতুন ডিজাইন যোগ করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {templates.map((tpl) => {
                    const isActive = tpl.id === activeTemplateId;
                    return (
                      <div
                        key={tpl.id}
                        className={`rounded-xl border p-3 flex flex-col gap-2.5 transition-all ${
                          isActive
                            ? 'bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-950/50'
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                          <img
                            src={tpl.backgroundImage}
                            alt={tpl.title}
                            className="w-full h-full object-contain"
                          />

                          {/* Frame highlight box */}
                          <div
                            className="absolute border-2 border-blue-500 bg-blue-500/20"
                            style={{
                              left: `${(tpl.frame.x / tpl.width) * 100}%`,
                              top: `${(tpl.frame.y / tpl.height) * 100}%`,
                              width: `${(tpl.frame.width / tpl.width) * 100}%`,
                              height: `${(tpl.frame.height / tpl.height) * 100}%`,
                            }}
                          />

                          {isActive && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                              সক্রিয়
                            </span>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 truncate">{tpl.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{tpl.institution}</p>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            সাইজ: {tpl.width}×{tpl.height} | ফ্রেম: {tpl.frame.width}×{tpl.frame.height}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-700/50">
                          {!isActive && (
                            <button
                              onClick={() => onSetActiveTemplate(tpl.id)}
                              className="flex-1 py-1 px-2 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors cursor-pointer text-center"
                            >
                              সক্রিয় করুন
                            </button>
                          )}

                          <button
                            onClick={() => {
                              loadTemplateIntoForm(tpl);
                              setActiveTab('upload');
                            }}
                            className="py-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                            title="ফ্রেমের অবস্থান এডিট করুন"
                          >
                            এডিট
                          </button>

                          {!tpl.isDefault && (
                            <button
                              onClick={() => {
                                if (confirm(`"${tpl.title}" ডিজাইনটি ডিলিট করতে চান?`)) {
                                  onDeleteTemplate(tpl.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-[11px] transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Backup, Reset & Advanced */}
            {activeTab === 'backup' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl mx-auto flex flex-col gap-5">
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>ডিফল্ট ডিজাইন রিসেট</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    জামিয়া কারীমিয়া আরাবিয়া সম্মেলন ও ফিকহি কর্মশালার মূল তৈরি করা ডিফল্ট পোস্টার ও ব্লু ফ্রেম সেটআপে ফিরিয়ে নিন।
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি নিশ্চিত যে মূল ডিফল্ট ডিজাইনে রিসেট করতে চান?')) {
                        onResetToDefault();
                        setSaveSuccessMsg('মূল ডিফল্ট ডিজাইন পুনরায় সেট করা হয়েছে!');
                        setTimeout(() => setSaveSuccessMsg(''), 3000);
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors cursor-pointer self-start"
                  >
                    মূল ডিফল্ট ডিজাইনে ফিরিয়ে নিন
                  </button>
                </div>

                {/* Export / Import Backup */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>টেমপ্লেট ব্যাকআপ ও এক্সপোর্ট</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    আপনার তৈরি ও আপলোড করা সকল ডিজাইন এবং ফ্রেম কোঅর্ডিনেট JSON ফাইল হিসেবে সেভ রাখুন।
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(templates));
                        const dl = document.createElement('a');
                        dl.setAttribute('href', dataStr);
                        dl.setAttribute('download', 'jamia-karimia-templates-backup.json');
                        dl.click();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      ব্যাকআপ ডাউনলোড (JSON)
                    </button>
                  </div>
                </div>

                {/* Logout admin */}
                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <span>অ্যাডমিন সেশন চালু রয়েছে</span>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('photocard_admin_auth');
                      setIsAuthenticated(false);
                    }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    লগআউট করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
