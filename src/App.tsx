import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PosterTemplate, UserPhotoState } from './types';
import {
  loadSavedTemplates,
  saveTemplates,
  loadActiveTemplateId,
  saveActiveTemplateId,
  getInitialDefaultTemplate,
} from './utils/defaultTemplates';
import { downloadPhotoCardPng } from './utils/canvasRenderer';
import { Header } from './components/Header';
import { PhotoCardCanvas } from './components/PhotoCardCanvas';
import { Toolbar } from './components/Toolbar';
import { AdminModal } from './components/AdminModal';
import { HelpModal } from './components/HelpModal';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const [templates, setTemplates] = useState<PosterTemplate[]>(() => loadSavedTemplates());
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => loadActiveTemplateId());

  // Background Image element cache for current template
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // User uploaded photo state
  const [userPhoto, setUserPhoto] = useState<UserPhotoState>({
    image: null,
    imageUrl: null,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const globalFileInputRef = useRef<HTMLInputElement>(null);

  // Active template
  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) ||
    templates.find((t) => t.isDefault) ||
    templates[0] ||
    getInitialDefaultTemplate();

  // Preload background image whenever activeTemplate changes
  useEffect(() => {
    if (!activeTemplate?.backgroundImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBgImage(img);
    };
    img.src = activeTemplate.backgroundImage;
  }, [activeTemplate?.backgroundImage]);

  // Handle User Photo File Selection
  const handlePhotoSelected = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        setUserPhoto({
          image: img,
          imageUrl: dataUrl,
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle Download Photo Card
  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const safeTitle = (activeTemplate.institution || 'Jamia-Karimia')
        .replace(/\s+/g, '-')
        .toLowerCase();
      const fileName = `${safeTitle}-photocard-${Date.now()}.png`;

      await downloadPhotoCardPng({
        template: activeTemplate,
        bgImage,
        userPhoto,
        fileName,
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
      alert('ছবি ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  // Template Management Handlers
  const handleSaveTemplate = (savedTemplate: PosterTemplate, makeActive = true) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === savedTemplate.id);
      const updated = exists
        ? prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t))
        : [savedTemplate, ...prev];
      saveTemplates(updated);
      return updated;
    });

    if (makeActive) {
      setActiveTemplateId(savedTemplate.id);
      saveActiveTemplateId(savedTemplate.id);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => {
      const filtered = prev.filter((t) => t.id !== templateId);
      saveTemplates(filtered);
      return filtered;
    });

    if (activeTemplateId === templateId) {
      const fallback = templates.find((t) => t.id !== templateId && t.isDefault) || templates[0];
      if (fallback) {
        setActiveTemplateId(fallback.id);
        saveActiveTemplateId(fallback.id);
      }
    }
  };

  const handleSetActiveTemplate = (id: string) => {
    setActiveTemplateId(id);
    saveActiveTemplateId(id);
  };

  const handleResetToDefault = () => {
    const defaultTpl = getInitialDefaultTemplate();
    const updated = [defaultTpl];
    setTemplates(updated);
    saveTemplates(updated);
    setActiveTemplateId(defaultTpl.id);
    saveActiveTemplateId(defaultTpl.id);
  };

  const [tripleClickCount, setTripleClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check URL query on load: e.g. site.com/?admin or site.com/#admin
  useEffect(() => {
    const checkUrlForAdmin = () => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('admin') || window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkUrlForAdmin();
    window.addEventListener('hashchange', checkUrlForAdmin);
    return () => window.removeEventListener('hashchange', checkUrlForAdmin);
  }, []);

  // Secret keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret triple-tap handler on the footer
  const handleSecretFooterClick = () => {
    setTripleClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsAdminOpen(true);
        return 0;
      }
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        setTripleClickCount(0);
      }, 1500);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B132A] text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif]">
      {/* Hidden file input for anywhere triggering upload */}
      <input
        ref={globalFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handlePhotoSelected(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* 1. Header with exact Bengali titles */}
      <Header
        currentTemplate={activeTemplate}
        templates={templates}
        onSelectTemplate={handleSetActiveTemplate}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main Content: Photo Card Canvas & Controls */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-start gap-4 sm:gap-6">
        {/* Success Banner when card downloaded */}
        {downloadSuccess && (
          <div className="w-full max-w-xl p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/50 backdrop-blur-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>আপনার হাই কোয়ালিটি ফটোকার্ড সফলভাবে ডাউনলোড হয়েছে!</span>
            </div>
            <button
              onClick={() => setDownloadSuccess(false)}
              className="text-xs text-emerald-300 hover:text-white font-bold cursor-pointer"
            >
              বন্ধ
            </button>
          </div>
        )}

        {/* The Live Photo Card Canvas */}
        <section className="w-full flex justify-center">
          <PhotoCardCanvas
            template={activeTemplate}
            bgImage={bgImage}
            userPhoto={userPhoto}
            onUpdatePhoto={setUserPhoto}
            onTriggerUpload={() => globalFileInputRef.current?.click()}
          />
        </section>

        {/* 3. The 5 Required Action Buttons & Control Bar */}
        <section className="w-full">
          <Toolbar
            userPhoto={userPhoto}
            onUpdatePhoto={setUserPhoto}
            onFileSelected={handlePhotoSelected}
            onDownload={handleDownload}
            isDownloading={isDownloading}
            downloadSuccess={downloadSuccess}
          />
        </section>
      </main>

      {/* 4. Modals */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        templates={templates}
        activeTemplateId={activeTemplateId}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSetActiveTemplate={handleSetActiveTemplate}
        onResetToDefault={handleResetToDefault}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Footer (with secret triple-click for admin) */}
      <footer className="w-full py-4 px-4 border-t border-sky-500/20 bg-[#070D1E] text-center text-xs text-sky-300/80 flex flex-col sm:flex-row items-center justify-center gap-2 select-none">
        <span
          onClick={handleSecretFooterClick}
          className="cursor-default transition-colors hover:text-white font-bold"
          title="জামিয়া কারীমিয়া আরাবিয়া"
        >
          © {new Date().getFullYear()} জামিয়া কারীমিয়া আরাবিয়া
        </span>
        <span className="hidden sm:inline text-sky-600 font-bold">•</span>
        <span className="font-semibold text-sky-200">ইসলামী সম্মেলন ও ফিকহি কর্মশালা</span>
        <span className="hidden sm:inline text-sky-600 font-bold">•</span>
        <span className="text-sky-300/70 font-medium">সকল ডিভাইসে নিরাপদ ও দ্রুত ফটোকার্ড জেনারেটর</span>
      </footer>
    </div>
  );
}
