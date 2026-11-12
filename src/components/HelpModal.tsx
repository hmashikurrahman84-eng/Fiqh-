import React from 'react';
import { X, Upload, Move, ZoomIn, Download, CheckCircle2, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Upload className="w-5 h-5 text-blue-400" />,
      title: '১. ছবি আপলোড করুন',
      desc: 'নিচের "ছবি আপলোড করুন" বাটনে ক্লিক করে আপনার মোবাইল গ্যালারি বা কম্পিউটার থেকে পছন্দের ছবি নির্বাচন করুন।',
    },
    {
      icon: <Move className="w-5 h-5 text-amber-400" />,
      title: '২. টেনে ও জুম করে ফ্রেমে বসান',
      desc: 'আঙুল বা মাউস দিয়ে ছবি টেনে নীল ফ্রেমের মাঝে আনুন। "ছবি বড় করুন" ও "ছবি ছোট করুন" বাটন দিয়ে নিখুঁত সাইজ নির্ধারণ করুন।',
    },
    {
      icon: <Download className="w-5 h-5 text-emerald-400" />,
      title: '৩. হাই কোয়ালিটি কার্ড ডাউনলোড করুন',
      desc: '"ছবি ডাউনলোড করুন" বাটনে ক্লিক করলে কোনো প্রকার ওয়াটারমার্ক ছাড়া সম্পূর্ণ ডিজাইন ও আপনার ছবি যুক্ত ক্লিয়ার PNG পোস্টার সেভ হবে।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              কীভাবে ফটোকার্ড তৈরি করবেন?
            </h3>
            <p className="text-xs text-slate-400">সহজ ৩টি ধাপে আপনার ছবি যুক্ত করুন</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 my-4">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 flex items-start gap-3.5"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 shrink-0 mt-0.5">
                {s.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{s.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>আপনার আপলোড করা ছবি সম্পূর্ণ আপনার ব্রাউজারেই প্রসেস হয়, কোনো সার্ভারে আপলোড হয় না।</span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          ঠিক আছে, শুরু করি
        </button>
      </div>
    </div>
  );
};
