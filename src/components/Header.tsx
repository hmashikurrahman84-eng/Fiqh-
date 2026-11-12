import React from 'react';
import { PosterTemplate } from '../types';
import { HelpCircle, Palette } from 'lucide-react';

interface HeaderProps {
  currentTemplate: PosterTemplate;
  templates: PosterTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTemplate,
  templates,
  onSelectTemplate,
  onOpenHelp,
}) => {
  const publishedTemplates = templates.filter((t) => t.published);

  return (
    <header className="w-full border-b border-sky-500/30 bg-[#0B132A]/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-3.5 transition-all shadow-lg shadow-black/30">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center relative">
        {/* Top utility row: Status & Help button */}
        <div className="w-full flex items-center justify-between mb-2">
          {/* Multiple templates dropdown if available */}
          {publishedTemplates.length > 1 ? (
            <div className="flex items-center gap-1.5 text-xs">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <select
                value={currentTemplate.id}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="bg-[#121E3E] text-sky-100 border border-sky-500/40 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-400 shadow-xs font-medium"
              >
                {publishedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-sky-200 font-medium bg-[#121E3E] border border-sky-500/40 px-3 py-1 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>লাইভ ফটোকার্ড</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 text-xs text-sky-100 hover:text-white bg-[#121E3E] hover:bg-[#1C2C58] px-3 py-1 rounded-lg border border-sky-500/40 transition-all cursor-pointer shadow-xs font-medium"
              title="কীভাবে ফটোকার্ড তৈরি করবেন?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>সহায়িকা</span>
            </button>
          </div>
        </div>

        {/* 1. শীর্ষ শিরোনাম: "ফ্রেমে আপনার ছবি বসান" */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 border border-sky-300/80 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(56,189,248,0.4)] mb-2 font-['Hind_Siliguri',sans-serif]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>ফ্রেমে আপনার ছবি বসান</span>
        </div>

        {/* 2. প্রতিষ্ঠানের নাম (লাইট কালার ও মোটা হরফে) ও গ্লোয়িং ফ্রেম কার্ড */}
        <div className="w-full max-w-2xl bg-[#111C38]/90 border border-sky-400/50 rounded-2xl px-5 py-2.5 my-1 shadow-[0_0_20px_rgba(56,189,248,0.2)] flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)] font-['Hind_Siliguri',sans-serif]">
            {currentTemplate.institution || 'জামিয়া কারীমিয়া আরাবিয়া'}
          </h1>

          {/* 3. প্রতিষ্ঠানের ঠিকানা (চিকন করে নিচে লাইট কালারে): "রামপুরা মাদরাসা ঢাকা-১২১৯" */}
          <p className="text-xs sm:text-sm font-normal text-sky-200 tracking-wider mt-0.5 font-['Hind_Siliguri',sans-serif]">
            {currentTemplate.address || 'রামপুরা মাদরাসা ঢাকা-১২১৯'}
          </p>
        </div>

        {/* 4. অনুষ্ঠানের নাম (নিচের লাইনে লাইট কালারে): "দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা" */}
        <div className="mt-2 flex flex-col items-center font-['Hind_Siliguri',sans-serif]">
          <span className="text-xs sm:text-sm font-medium text-sky-300 tracking-wide">
            দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে
          </span>
          <h2 className="text-base sm:text-xl font-bold text-amber-300 tracking-wide mt-0.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা
          </h2>
        </div>
      </div>
    </header>
  );
};
