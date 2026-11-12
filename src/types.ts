export interface FrameConfig {
  x: number; // in canvas coordinate pixels (e.g. out of 1080)
  y: number; // in canvas coordinate pixels (e.g. out of 1350)
  width: number;
  height: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  innerBorderWidth?: number;
  innerBorderColor?: string;
  shape: 'square' | 'rounded' | 'circle';
}

export interface PosterTemplate {
  id: string;
  title: string;
  institution: string;
  address?: string;
  conferenceName: string;
  backgroundImage: string; // Base64 data URL
  width: number;
  height: number;
  frame: FrameConfig;
  published: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface UserPhotoState {
  image: HTMLImageElement | null;
  imageUrl: string | null;
  zoom: number; // 0.5 to 4
  panX: number; // in frame coordinates
  panY: number;
  rotation: number; // 0, 90, 180, 270
}
