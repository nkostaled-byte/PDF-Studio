import React, { useState } from 'react';
import { 
  Combine, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileCheck, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Plus,
  Layers,
  Hash
} from 'lucide-react';
import { PDFFileItem, PlanLimits, UserProfile } from '../types';
import { DropZone } from './DropZone';
import { mergePDFs, generatePdfThumbnails, ProcessedPdfResult } from '../lib/pdfEngine';
import { recordHistory } from '../lib/firebase';

interface MergeToolProps {
  limits: PlanLimits;
  user: UserProfile | null;
  onExceedLimit: (reason: string) => void;
  onUpgradePrompt: () => void;
}

export const MergeTool: React.FC<MergeToolProps> = ({
  limits,
  user,
  onExceedLimit,
  onUpgradePrompt,
}) => {
  const [items, setItems] = useState<PDFFileItem[]>([]);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedPdfResult | null>(null);

  const handleFilesAdded = async (newFiles: File[]) => {
    // Check total count including existing
    if (items.length + newFiles.length > limits.maxFilesPerBatch) {
      onExceedLimit(
        `Batch limit: Free tier permits up to ${limits.maxFilesPerBatch} files per merge. Upgrade to Pro for up to 100 batch files!`
      );
      return;
    }

    const newItems: PDFFileItem[] = newFiles.map((f) => ({
      id: 'pdf_' + Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
      status: 'idle',
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Generate page thumbnails in background
    for (const item of newItems) {
      const thumbs = await generatePdfThumbnails(item.file, 6);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, thumbnailUrls: thumbs.map((t) => t.dataUrl), pageCount: thumbs.length } : it
        )
      );
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const list = [...items];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setItems(list);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const list = [...items];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setItems(list);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleMerge = async () => {
    if (items.length < 2) return;

    if (addPageNumbers && !limits.allowPageNumbers) {
      onUpgradePrompt();
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const filesToMerge = items.map((it) => it.file);
      const res = await mergePDFs(filesToMerge, { addPageNumbers });
      setResult(res);
      setIsProcessing(false);

      // Record to Firestore/History if user is logged in
      if (user) {
        recordHistory(user.uid, {
          tool: 'merge',
          fileName: `Merged_${items.length}_files.pdf`,
          originalSize: items.reduce((acc, i) => acc + i.size, 0),
          processedSize: res.blob.size,
          timestamp: new Date().toISOString(),
          downloadName: `Merged_${items.length}_files.pdf`,
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      alert('Error merging PDFs: ' + err.message);
    }
  };

  const handleReset = () => {
    setItems([]);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <Combine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Browser-Side Merge Engine</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Merge PDF Files
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Combine multiple PDF documents into a single document in seconds. Files never leave your device.
        </p>
      </div>

      {/* Upload Dropzone when empty */}
      {items.length === 0 && (
        <DropZone
          acceptTypes="application/pdf,.pdf"
          multiple={true}
          limits={limits}
          onFilesSelected={handleFilesAdded}
          onExceedLimit={onExceedLimit}
          title="Select PDF files to Merge"
          subtitle="Drop files here or click to browse. Reorder files before merging."
        />
      )}

      {/* File List & Controls when files selected */}
      {items.length > 0 && !result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-slate-800 dark:text-slate-100">Selected Files ({items.length})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Add More
                </span>
              </label>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* List of Files with Page Thumbnails & Re-ordering controls */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                      {item.pageCount && <span>• {item.pageCount} pages</span>}
                    </div>

                    {/* Page Thumbnail Previews */}
                    {item.thumbnailUrls && item.thumbnailUrls.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 max-w-xs sm:max-w-lg">
                        {item.thumbnailUrls.map((thumb, tIdx) => (
                          <img
                            key={tIdx}
                            src={thumb}
                            alt={`Page ${tIdx + 1}`}
                            className="w-10 h-13 object-cover rounded border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 bg-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Move & Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveUp(idx)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === items.length - 1}
                    onClick={() => moveDown(idx)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-xs"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Options Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addPageNumbers}
                onChange={(e) => setAddPageNumbers(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Add Page Numbers
                {!limits.allowPageNumbers && (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1 font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </span>
            </label>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Total input size: {(items.reduce((acc, i) => acc + i.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          {/* Merge Trigger Button */}
          <button
            disabled={items.length < 2 || isProcessing}
            onClick={handleMerge}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              items.length >= 2 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-[1.01]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Merging {items.length} PDFs inside Browser...</span>
              </>
            ) : (
              <>
                <Combine className="w-5 h-5" />
                <span>Merge {items.length} PDF Files</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Merge Success Result */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              PDFs Merged Successfully!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Combined {items.length} files into a single {result.pageCount}-page PDF.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto flex items-center justify-around text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Total Size</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{result.newSizeMb.toFixed(2)} MB</span>
            </div>
            <div className="border-r border-slate-200 dark:border-slate-700 h-8"></div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Pages</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{result.pageCount} Pages</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download="Merged_Document.pdf"
              className="w-full sm:w-auto py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Merged PDF</span>
            </a>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Merge Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
