export type ToolType = 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'img2pdf' 
  | 'pricing' 
  | 'dashboard';

export type UserPlan = 'free' | 'pro';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  plan: UserPlan;
  subscriptionDate?: string;
  paystackRef?: string;
  totalFilesProcessed: number;
  totalMbProcessed: number;
  createdAt: string;
}

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  thumbnailUrls?: string[];
  status?: 'idle' | 'processing' | 'done' | 'error';
  errorMsg?: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width?: number;
  height?: number;
}

export interface MergeOptions {
  addPageNumbers: boolean;
  addCoverTitle?: string;
}

export interface SplitOptions {
  mode: 'all' | 'range';
  customRanges: string; // e.g., "1-3, 5, 8-10"
}

export type CompressionPreset = 'recommended' | 'extreme' | 'less';

export interface CompressOptions {
  preset: CompressionPreset;
}

export interface ImgToPdfOptions {
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: 'none' | 'small' | 'large';
  fit: 'fit_page' | 'original' | 'fill_page';
}

export interface ProcessingHistoryItem {
  id: string;
  tool: ToolType;
  fileName: string;
  originalSize: number;
  processedSize?: number;
  timestamp: string;
  downloadName: string;
}

export interface PlanLimits {
  maxFileSizeMb: number;
  maxFilesPerBatch: number;
  allowPageNumbers: boolean;
  allowHighCompression: boolean;
  savedHistory: boolean;
}

export const FREE_LIMITS: PlanLimits = {
  maxFileSizeMb: 5,
  maxFilesPerBatch: 3,
  allowPageNumbers: false,
  allowHighCompression: false,
  savedHistory: false,
};

export const PRO_LIMITS: PlanLimits = {
  maxFileSizeMb: 200,
  maxFilesPerBatch: 100,
  allowPageNumbers: true,
  allowHighCompression: true,
  savedHistory: true,
};
