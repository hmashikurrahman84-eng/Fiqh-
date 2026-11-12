import { PosterTemplate, UserPhotoState } from '../types';

/**
 * Renders the complete photo card onto any given canvas context.
 * Used for both interactive display and full-resolution export.
 */
export function drawPhotoCard({
  ctx,
  template,
  bgImage,
  userPhoto,
  targetWidth,
  targetHeight,
  isExport = false,
}: {
  ctx: CanvasRenderingContext2D;
  template: PosterTemplate;
  bgImage: HTMLImageElement | null;
  userPhoto: UserPhotoState;
  targetWidth: number;
  targetHeight: number;
  isExport?: boolean;
}) {
  const scaleX = targetWidth / template.width;
  const scaleY = targetHeight / template.height;

  // Clear canvas
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // 1. Draw background poster
  if (bgImage && bgImage.complete) {
    ctx.drawImage(bgImage, 0, 0, targetWidth, targetHeight);
  } else {
    // Fallback background while loading
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Calculate scaled frame boundaries
  const frame = template.frame;
  const fx = frame.x * scaleX;
  const fy = frame.y * scaleY;
  const fw = frame.width * scaleX;
  const fh = frame.height * scaleY;
  const fBorderRadius = frame.borderRadius * Math.min(scaleX, scaleY);
  const fBorderWidth = frame.borderWidth * Math.min(scaleX, scaleY);

  // 2. When user photo is uploaded: cover/erase previous placeholder and render photo
  if (userPhoto.image && userPhoto.image.complete) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    if (fBorderRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(fx, fy, fw, fh, fBorderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(fx, fy, fw, fh);
    }
    ctx.restore();

    // 3. Render user photo clipped cleanly inside frame
    ctx.save();
    ctx.beginPath();
    if (fBorderRadius > 0) {
      ctx.roundRect(fx, fy, fw, fh, fBorderRadius);
    } else {
      ctx.rect(fx, fy, fw, fh);
    }
    ctx.clip();

    const img = userPhoto.image;
    // Calculate base cover scale so photo fills the frame cleanly
    const baseScale = Math.max(fw / img.width, fh / img.height);
    const finalScale = baseScale * userPhoto.zoom;

    const scaledPanX = userPhoto.panX * scaleX;
    const scaledPanY = userPhoto.panY * scaleY;

    // Frame center in canvas coordinates
    const centerX = fx + fw / 2 + scaledPanX;
    const centerY = fy + fh / 2 + scaledPanY;

    ctx.translate(centerX, centerY);
    if (userPhoto.rotation) {
      ctx.rotate((userPhoto.rotation * Math.PI) / 180);
    }

    const drawW = img.width * finalScale;
    const drawH = img.height * finalScale;

    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 4. Draw the Blue Frame Border OVER the photo
    if (fBorderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = frame.borderColor || '#0284c7';
      ctx.lineWidth = fBorderWidth;

      if (fBorderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, fBorderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(fx, fy, fw, fh);
      }
      ctx.restore();
    }
  } else if (!isExport) {
    // Before upload: keep the Canva design visible with a subtle interactive hint
    ctx.save();
    ctx.strokeStyle = frame.borderColor || '#0284c7';
    ctx.lineWidth = Math.max(2, fBorderWidth);
    ctx.strokeRect(fx, fy, fw, fh);

    const badgeW = Math.min(fw * 0.9, 180);
    const badgeH = 28;
    const badgeX = fx + (fw - badgeW) / 2;
    const badgeY = fy + (fh - badgeH) / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `600 ${Math.max(12, Math.round(fw * 0.052))}px "Hind Siliguri", sans-serif`;
    ctx.fillText('আপনার ছবি এখানে বসবে', fx + fw / 2, badgeY + 19);
    ctx.restore();
  }
}

/**
 * Downloads the high-resolution composite photo card as PNG
 */
export async function downloadPhotoCardPng({
  template,
  bgImage,
  userPhoto,
  fileName = 'jamia-karimia-photocard.png',
}: {
  template: PosterTemplate;
  bgImage: HTMLImageElement | null;
  userPhoto: UserPhotoState;
  fileName?: string;
}): Promise<void> {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = template.width;
  exportCanvas.height = template.height;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create 2d context for export');

  // Draw at full native resolution
  drawPhotoCard({
    ctx,
    template,
    bgImage,
    userPhoto,
    targetWidth: template.width,
    targetHeight: template.height,
    isExport: true,
  });

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve();
      },
      'image/png',
      1.0 // Maximum quality, no compression artifacts
    );
  });
}
