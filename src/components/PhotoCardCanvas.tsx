import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PosterTemplate, UserPhotoState } from '../types';
import { drawPhotoCard } from '../utils/canvasRenderer';
import { Move, ZoomIn, Upload, Sparkles } from 'lucide-react';

interface PhotoCardCanvasProps {
  template: PosterTemplate;
  bgImage: HTMLImageElement | null;
  userPhoto: UserPhotoState;
  onUpdatePhoto: (updater: (prev: UserPhotoState) => UserPhotoState) => void;
  onTriggerUpload: () => void;
}

export const PhotoCardCanvas: React.FC<PhotoCardCanvasProps> = ({
  template,
  bgImage,
  userPhoto,
  onUpdatePhoto,
  onTriggerUpload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 400,
    height: 500,
  });

  // Keep responsive display size synced with container
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availableW = Math.min(rect.width, 640);
      const aspect = template.height / template.width;
      const computedH = availableW * aspect;

      setContainerDimensions({
        width: Math.round(availableW),
        height: Math.round(computedH),
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [template.width, template.height]);

  // Redraw canvas whenever template, photo, or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = containerDimensions;

    // Set internal buffer size for sharp high-DPI rendering
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    drawPhotoCard({
      ctx,
      template,
      bgImage,
      userPhoto,
      targetWidth: width,
      targetHeight: height,
      isExport: false,
    });

    ctx.restore();
  }, [template, bgImage, userPhoto, containerDimensions]);

  // Pointer / Drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!userPhoto.image) {
      onTriggerUpload();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: userPhoto.panX,
      initialPanY: userPhoto.panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    const scaleRatio = template.width / containerDimensions.width;
    const deltaX = (e.clientX - dragStartRef.current.x) * scaleRatio;
    const deltaY = (e.clientY - dragStartRef.current.y) * scaleRatio;

    onUpdatePhoto((prev) => ({
      ...prev,
      panX: (dragStartRef.current?.initialPanX ?? 0) + deltaX,
      panY: (dragStartRef.current?.initialPanY ?? 0) + deltaY,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore pointer capture release error if already released
      }
    }
  };

  // Touch pinch-to-zoom on mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && userPhoto.image) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialZoomRef.current = userPhoto.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && initialPinchDistRef.current && userPhoto.image) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDistRef.current;
      const newZoom = Math.min(4, Math.max(0.5, initialZoomRef.current * factor));

      onUpdatePhoto((prev) => ({
        ...prev,
        zoom: parseFloat(newZoom.toFixed(2)),
      }));
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!userPhoto.image) return;
      e.preventDefault();
      const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
      onUpdatePhoto((prev) => ({
        ...prev,
        zoom: Math.min(4, Math.max(0.5, parseFloat((prev.zoom + zoomStep).toFixed(2)))),
      }));
    },
    [userPhoto.image, onUpdatePhoto]
  );

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center justify-center relative select-none"
    >
      {/* Outer Card with Neon Lighting Glow Effect */}
      <div className="relative rounded-2xl p-2 bg-[#0F1C3F] border-2 border-sky-400 ring-4 ring-sky-500/30 shadow-[0_0_40px_rgba(56,189,248,0.6),0_0_80px_rgba(14,165,233,0.35)] max-w-full overflow-hidden transition-all duration-300">
        {/* Decorative corner light accents */}
        <div className="absolute -top-1.5 -left-1.5 w-8 h-8 bg-sky-400/50 rounded-full blur-md pointer-events-none" />
        <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-blue-500/50 rounded-full blur-md pointer-events-none" />

        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`block rounded-xl touch-none transition-shadow ${
            userPhoto.image
              ? isDragging
                ? 'cursor-grabbing shadow-inner'
                : 'cursor-grab hover:shadow-lg'
              : 'cursor-pointer hover:brightness-105'
          }`}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
          title={
            userPhoto.image
              ? 'ছবি টেনে সঠিক স্থানে বসান অথবা স্ক্রোল/পিনচ করে জুম করুন'
              : 'ছবি আপলোড করতে ক্লিক করুন'
          }
        />

        {/* Live interaction hint badges (Light text on dark glass) */}
        {userPhoto.image ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-sky-400/60 text-xs text-white pointer-events-none shadow-lg font-medium">
            <Move className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>টেনে ছবি সাজান</span>
            <span className="text-sky-500">•</span>
            <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
            <span>জুম: {Math.round(userPhoto.zoom * 100)}%</span>
          </div>
        ) : (
          <button
            onClick={onTriggerUpload}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/95 text-white font-medium text-sm shadow-xl backdrop-blur-sm border border-blue-400/30"
          >
            <Upload className="w-4 h-4" />
            <span>ছবি যুক্ত করুন</span>
          </button>
        )}
      </div>

      {/* Helper text under canvas in Light Color */}
      <div className="mt-3 text-center text-xs text-sky-200 font-medium flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>মোবাইল বা কম্পিউটারে আঙুল বা মাউস দিয়ে ছবি টেনে ও জুম করে নিখুঁতভাবে বসাতে পারেন</span>
      </div>
    </div>
  );
};
