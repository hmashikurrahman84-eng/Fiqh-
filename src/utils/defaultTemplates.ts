import { PosterTemplate } from '../types';

/**
 * Generates an ultra-crisp default poster template using Hind Siliguri font:
 * - "জামিয়া কারীমিয়া আরাবিয়া" (মোটা)
 * - "রামপুরা মাদরাসা, ঢাকা-১২১৯" (চিকন)
 * - "দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা"
 * Resolution: 1080 x 1080 px (Square 1:1 format)
 */
export function generateDefaultPosterDataUrl(): string {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Rich dark emerald-to-navy background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#064e3b'); // emerald-900
  bgGrad.addColorStop(0.35, '#042f2e'); // teal-950
  bgGrad.addColorStop(0.7, '#0f172a'); // slate-900
  bgGrad.addColorStop(1, '#020617'); // slate-950
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Islamic geometric background patterns
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)'; // faint amber gold
  ctx.lineWidth = 1.5;
  for (let x = -100; x < width + 100; x += 90) {
    for (let y = -100; y < height + 100; y += 90) {
      ctx.beginPath();
      ctx.moveTo(x + 45, y);
      ctx.lineTo(x + 90, y + 45);
      ctx.lineTo(x + 45, y + 90);
      ctx.lineTo(x, y + 45);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + 45, y + 45, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. Golden decorative border around the 1080x1080 poster
  ctx.save();
  ctx.strokeStyle = '#d97706'; // amber-600
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, width - 68, height - 68);

  // Ornamental corner accents
  const corners = [
    [24, 24],
    [width - 24, 24],
    [24, height - 24],
    [width - 24, height - 24],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();

  // 4. Header arch banner (Islamic Mihrab shape)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(60, 34);
  ctx.lineTo(width - 60, 34);
  ctx.lineTo(width - 60, 195);
  ctx.bezierCurveTo(width - 120, 240, width / 2 + 80, 255, width / 2, 255);
  ctx.bezierCurveTo(width / 2 - 80, 255, 120, 240, 60, 195);
  ctx.closePath();

  const archGrad = ctx.createLinearGradient(0, 34, 0, 255);
  archGrad.addColorStop(0, '#065f46');
  archGrad.addColorStop(1, '#022c22');
  ctx.fillStyle = archGrad;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 5. Bismillah in Hind Siliguri
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a'; // gold yellow
  ctx.font = '700 28px "Hind Siliguri", sans-serif';
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 75);

  // Institution Sub-header (ঐতিহ্যবাহী দ্বীনি শিক্ষা নিকেতন)
  ctx.fillStyle = '#6ee7b7'; // emerald-300
  ctx.font = '500 18px "Hind Siliguri", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('ঐতিহ্যবাহী দ্বীনি শিক্ষা নিকেতন', width / 2, 108);

  // Main Institution Name: "জামিয়া কারীমিয়া আরাবিয়া" (মোটা করে)
  ctx.font = '700 56px "Hind Siliguri", sans-serif';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('জামিয়া কারীমিয়া আরাবিয়া', width / 2, 172);

  // Address: "রামপুরা মাদরাসা, ঢাকা-১২১৯" (এটার নিচে চিকন করে)
  ctx.shadowBlur = 0;
  ctx.font = '300 21px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.letterSpacing = '1px';
  ctx.fillText('রামপুরা মাদরাসা, ঢাকা-১২১৯', width / 2, 212);
  ctx.restore();

  // 6. Main Event Ribbon Banner:
  // "দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে"
  // "ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা"
  ctx.save();
  const bannerY = 242;
  const bannerH = 96;
  const bannerW = 900;
  const bannerX = (width - bannerW) / 2;

  // Banner shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(bannerX + 5, bannerY + 5, bannerW, bannerH, 16);
  ctx.fill();

  // Banner background gradient (Maroon to Crimson)
  const bannerGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY + bannerH);
  bannerGrad.addColorStop(0, '#991b1b');
  bannerGrad.addColorStop(0.5, '#dc2626');
  bannerGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
  ctx.fill();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Banner Title Text Line 1 (দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.font = '600 22px "Hind Siliguri", sans-serif';
  ctx.fillText('দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে', width / 2, bannerY + 34);

  // Banner Title Text Line 2 (ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা - মোটা করে)
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 46px "Hind Siliguri", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 10;
  ctx.fillText('ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা', width / 2, bannerY + 80);
  ctx.restore();

  // 7. Middle info cards: Date, Time & Venue in Hind Siliguri
  ctx.save();
  const infoCards = [
    { title: 'তারিখ', text: '২৩ ও ২৪ অগ্রহায়ণ / ৬-৭ ডিসেম্বর' },
    { title: 'সময়', text: 'সকাল ৯:০০টা - রাত ১০:০০টা' },
    { title: 'স্থান', text: 'জামিয়া কারীমিয়া আরাবিয়া প্রাঙ্গণ' },
  ];
  const cardW = 275;
  const cardH = 65;
  const cardGap = 15;
  const startX = (width - (cardW * 3 + cardGap * 2)) / 2;
  const infoY = 352;

  infoCards.forEach((c, idx) => {
    const x = startX + idx * (cardW + cardGap);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, infoY, cardW, cardH, 10);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 16px "Hind Siliguri", sans-serif';
    ctx.fillText(c.title, x + cardW / 2, infoY + 24);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 17px "Hind Siliguri", sans-serif';
    ctx.fillText(c.text, x + cardW / 2, infoY + 50);
  });
  ctx.restore();

  // 8. Conference Message / Slogan Bar in Hind Siliguri
  ctx.save();
  const sloganY = 432;
  ctx.fillStyle = 'rgba(30, 58, 138, 0.4)';
  ctx.beginPath();
  ctx.roundRect(75, sloganY, width - 150, 48, 10);
  ctx.fill();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#93c5fd';
  ctx.font = '600 19px "Hind Siliguri", sans-serif';
  ctx.fillText('❝ দ্বীনি জ্ঞান অর্জন ও সমকালীন ফিকহি মাসায়েলের প্রামাণ্য দিকনির্দেশনা ❞', width / 2, sloganY + 31);
  ctx.restore();

  // 9. LOWER-MIDDLE-LEFT: THE PHOTO FRAME SLOT (Square with Royal Blue border)
  const frameX = 80;
  const frameY = 498;
  const frameW = 410;
  const frameH = 410;

  // Placeholder inner area in default design
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(frameX, frameY, frameW, frameH);

  // Placeholder avatar graphic
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(frameX + frameW / 2, frameY + frameH * 0.42, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(frameX + frameW / 2, frameY + frameH * 1.05, 150, Math.PI, Math.PI * 2);
  ctx.fill();

  // Placeholder labels in Hind Siliguri
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px "Hind Siliguri", sans-serif';
  ctx.fillText('আপনার ছবি এখানে বসবে', frameX + frameW / 2, frameY + frameH / 2 + 10);
  ctx.font = '400 16px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('(নিচে ছবি আপলোড করুন)', frameX + frameW / 2, frameY + frameH / 2 + 38);

  // THE ROYAL BLUE BORDER: 12px width
  ctx.strokeStyle = '#1d4ed8'; // Royal Blue
  ctx.lineWidth = 12;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // Inner crisp white highlight border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(frameX + 6, frameY + 6, frameW - 12, frameH - 12);
  ctx.restore();

  // Badge below the square photo frame in Hind Siliguri:
  ctx.save();
  const badgeY = frameY + frameH + 12;
  const badgeW = frameW;
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(frameX, badgeY, badgeW, 46, 8);
  ctx.fill();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 22px "Hind Siliguri", sans-serif';
  ctx.fillText('দারুল ইফতার গর্বিত সাথী', frameX + badgeW / 2, badgeY + 31);
  ctx.restore();

  // 10. RIGHT SIDE of lower section in Hind Siliguri:
  ctx.save();
  const rightX = 525;
  const rightY = 498;
  const rightW = 475;
  const rightH = 468;

  // Background box for right section
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.beginPath();
  ctx.roundRect(rightX, rightY, rightW, rightH, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Right section header in Hind Siliguri
  ctx.fillStyle = '#fbbf24'; // amber-400
  ctx.font = '700 25px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('কর্মশালার বিশেষ আকর্ষণ', rightX + 24, rightY + 38);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rightX + 24, rightY + 48);
  ctx.lineTo(rightX + 380, rightY + 48);
  ctx.stroke();

  // Bullet points in Hind Siliguri
  const points = [
    '• দারুল ইফতার প্রাক্তন ও বর্তমানদের আত্মিক মিলন',
    '• সমকালীন জটিল ফিকহি মাসায়েলের প্রামাণ্য তাহকিক',
    '• আধুনিক অর্থনৈতিক লেনদেনে ইফতা পদ্ধতির দিকনির্দেশনা',
    '• শীর্ষস্থানীয় মুফতিয়ানে কেরামের দিকনির্দেশনামূলক আলোচনা',
    '• বিশেষ দোয়ার মাহফিল ও ইলমি পরামর্শ',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '400 18.5px "Hind Siliguri", sans-serif';
  points.forEach((pt, i) => {
    ctx.fillText(pt, rightX + 24, rightY + 86 + i * 40);
  });

  // Call to action box
  const ctaBoxY = rightY + 295;
  ctx.fillStyle = 'rgba(29, 78, 216, 0.35)';
  ctx.beginPath();
  ctx.roundRect(rightX + 16, ctaBoxY, rightW - 32, 85, 10);
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#60a5fa';
  ctx.font = '700 18px "Hind Siliguri", sans-serif';
  ctx.fillText('সকল মুফতি ও আলেমদের সাদর আমন্ত্রণ', rightX + rightW / 2, ctaBoxY + 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 20px "Hind Siliguri", sans-serif';
  ctx.fillText('আপনার উপস্থিতি আমাদের অনুপ্রেরণা', rightX + rightW / 2, ctaBoxY + 64);
  ctx.restore();

  // 11. Footer bar in Hind Siliguri
  ctx.save();
  const footerY = 985;
  ctx.fillStyle = '#090d16';
  ctx.fillRect(40, footerY, width - 80, 52);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, footerY, width - 80, 52);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 17px "Hind Siliguri", sans-serif';
  ctx.fillText('আয়োজনে: জামিয়া কারীমিয়া আরাবিয়া, রামপুরা মাদরাসা', 56, footerY + 33);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 18px "Hind Siliguri", sans-serif';
  ctx.fillText('যোগাযোগ: ০১৭০০-০০০০০০', width - 56, footerY + 33);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

import { USER_POSTER_DATA_URL } from './userUploadedPoster';

/**
 * Returns default template record using the user's uploaded Canva poster:
 * - Exact dimensions: 1080 x 1080 px
 * - Square frame at: x=214, y=614, width=262, height=262
 * - Crisp blue frame border
 */
export function getInitialDefaultTemplate(): PosterTemplate {
  return {
    id: 'jamia-karimia-canva-poster-master',
    title: 'জামিয়া কারীমিয়া আরাবিয়া - মূল পোস্টার ডিজাইন',
    institution: 'জামিয়া কারীমিয়া আরাবিয়া',
    address: 'রামপুরা মাদরাসা ঢাকা-১২১৯',
    conferenceName: 'দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা',
    backgroundImage: USER_POSTER_DATA_URL,
    width: 1080,
    height: 1080,
    frame: {
      x: 214,
      y: 614,
      width: 262,
      height: 262,
      borderRadius: 0,
      borderWidth: 4,
      borderColor: '#0284c7', // Matching Canva blue border
      innerBorderColor: '#ffffff',
      shape: 'square',
    },
    published: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  };
}

const TEMPLATES_STORAGE_KEY = 'photocard_generator_templates_v8';
const ACTIVE_TEMPLATE_KEY = 'photocard_generator_active_id_v8';

export function loadSavedTemplates(): PosterTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage', e);
  }
  const defaultTpl = getInitialDefaultTemplate();
  saveTemplates([defaultTpl]);
  return [defaultTpl];
}

export function saveTemplates(templates: PosterTemplate[]) {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage', e);
  }
}

export function loadActiveTemplateId(): string {
  try {
    return localStorage.getItem(ACTIVE_TEMPLATE_KEY) || 'jamia-karimia-canva-poster-master';
  } catch {
    return 'jamia-karimia-canva-poster-master';
  }
}

export function saveActiveTemplateId(id: string) {
  try {
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
  } catch (e) {
    console.error('Failed to save active template id', e);
  }
}

