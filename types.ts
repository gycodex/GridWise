
export interface GridConfig {
  rows: number;
  cols: number;
}

export interface SplitResult {
  blob: Blob;
  filename: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface BackgroundConfig {
  targetColor: string; // hex
  threshold: number; // 0-100
  removeOuterOnly: boolean;
  smoothEdges: boolean;
  smoothingThickness: number; // 1-10
  previewBg: boolean;
}

export interface CropData {
  x: number; // percentage 0-1
  y: number; // percentage 0-1
  width: number; // percentage 0-1
  height: number; // percentage 0-1
}
