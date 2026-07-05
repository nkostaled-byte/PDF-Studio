import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, Sparkles, Check } from 'lucide-react';
import { PlanLimits } from '../types';

interface DropZoneProps {
  acceptTypes: string; // e.g. "application/pdf" or "image/*"
  multiple?: boolean;
  limits: PlanLimits;
  onFilesSelected: (files: File[]) => void;
  onExceedLimit: (reason: string) => void;
  title?: string;
  subtitle?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptTypes,
  multiple = true,
  limits,
  onFilesSelected,
  onExceedLimit,
  title = "Select files or drop them here",
  subtitle = "All processing happens 100% securely inside your browser",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    // Check batch file count limit
    if (rawFiles.length > limits.maxFilesPerBatch) {
      onExceedLimit(
        `Batch limit exceeded: Free tier allows up to ${limits.maxFilesPerBatch} files per operation. Upgrade to Pro for up to 100 batch files!`
      );
      return;
    }

    // Check individual file size limit
    const overSizedFile = rawFiles.find(
      (f) => f.size > limits.maxFileSizeMb * 1024 * 1024
    );

    if (overSizedFile) {
      const fileSizeMb = (overSizedFile.size / (1024 * 1024)).toFixed(1);
      onExceedLimit(
        `File "${overSizedFile.name}" is ${fileSizeMb}MB. Free tier is limited to ${limits.maxFileSizeMb}MB per file. Upgrade to Pro to process files up to 200MB!`
      );
      return;
    }

    onFilesSelected(rawFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80 scale-[1.01]'
          : 'border-indigo-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-indigo-50/30 dark:bg-slate-900/60 hover:bg-indigo-50/60 dark:hover:bg-slate-900 shadow-xs'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        {/* Upload Icon Circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all duration-300 shadow-sm">
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" />
        </div>

        <div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Free Tier Limit Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs mt-2 shadow-xs transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Max File Size: <strong className="text-slate-800 dark:text-slate-100">{limits.maxFileSizeMb}MB</strong> (Free)</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>Batch: <strong className="text-slate-800 dark:text-slate-100">{limits.maxFilesPerBatch} files</strong></span>
        </div>
      </div>
    </div>
  );
};
