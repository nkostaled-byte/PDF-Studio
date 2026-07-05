import React, { useState } from 'react';
import { 
  Scissors, 
  Download, 
  RotateCcw, 
  Check, 
  FileText, 
  Layers, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { PlanLimits, UserProfile } from '../types';
import { DropZone } from './DropZone';
import { splitPDF, generatePdfThumbnails, RenderedPageThumbnail } from '../lib/pdfEngine';
import { recordHistory } from '../lib/firebase';

interface SplitToolProps {
  limits: PlanLimits;
  user: UserProfile | null;
  onExceedLimit: (reason: string) => void;
  onUpgradePrompt: () => void;
}

export const SplitTool: React.FC<SplitToolProps> = ({
  limits,
  user,
  onExceedLimit,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<RenderedPageThumbnail[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [mode, setMode] = useState<'range' | 'all'>('range');
  const [customRangeStr, setCustomRangeStr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ filename: string; blob: Blob; downloadUrl: string; pageCount: number }[] | null>(null);

  const handleFileAdded = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];

    if (selectedFile.size > limits.maxFileSizeMb * 1024 * 1024) {
      onExceedLimit(`File size exceeds free limit of ${limits.maxFileSizeMb}MB.`);
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setResults(null);

    try {
      const thumbs = await generatePdfThumbnails(selectedFile, 30);
      setThumbnails(thumbs);
      setSelectedPages(thumbs.map((t) => t.pageNumber));
      setCustomRangeStr(`1-${thumbs.length}`);
      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
    }
  };

  const togglePageSelect = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      const updated = selectedPages.filter((p) => p !== pageNum);
      setSelectedPages(updated);
      setCustomRangeStr(updated.join(', '));
    } else {
      const updated = [...selectedPages, pageNum].sort((a, b) => a - b);
      setSelectedPages(updated);
      setCustomRangeStr(updated.join(', '));
    }
  };

  const handleSelectAll = () => {
    const all = thumbnails.map((t) => t.pageNumber);
    setSelectedPages(all);
    setCustomRangeStr(`1-${all.length}`);
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
    setCustomRangeStr('');
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResults(null);

    try {
      const splitResults = await splitPDF(file, mode, customRangeStr);
      setResults(splitResults);
      setIsProcessing(false);

      if (user) {
        recordHistory(user.uid, {
          tool: 'split',
          fileName: file.name,
          originalSize: file.size,
          processedSize: splitResults.reduce((acc, r) => acc + r.blob.size, 0),
          timestamp: new Date().toISOString(),
          downloadName: splitResults[0]?.filename || 'Split_PDF.pdf',
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      alert('Split error: ' + err.message);
    }
  };

  const handleReset = () => {
    setFile(null);
    setThumbnails([]);
    setResults(null);
    setSelectedPages([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <Scissors className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Page Extraction & Splitter</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Split PDF Document
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Extract specific page ranges or split a document into single page files instantly inside your browser.
        </p>
      </div>

      {/* Upload Dropzone */}
      {!file && (
        <DropZone
          acceptTypes="application/pdf,.pdf"
          multiple={false}
          limits={limits}
          onFilesSelected={handleFileAdded}
          onExceedLimit={onExceedLimit}
          title="Select a PDF file to Split"
          subtitle="Drop PDF here to view page grid preview and select pages to extract."
        />
      )}

      {/* Page Selector Grid when file loaded */}
      {file && !results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{file.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {thumbnails.length} Pages detected
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              Choose Different File
            </button>
          </div>

          {/* Split Mode Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setMode('range')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                mode === 'range'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                <Scissors className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Extract Selected Pages
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click pages below or enter range (e.g. 1-3, 5, 8-10) to generate a single extracted PDF.
              </p>
            </div>

            <div
              onClick={() => setMode('all')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                mode === 'all'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Split Every Page
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Separates every page into its own individual standalone PDF file for download.
              </p>
            </div>
          </div>

          {/* Custom Range Bar */}
          {mode === 'range' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Page Selection Range:</label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleSelectAll}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={customRangeStr}
                onChange={(e) => setCustomRangeStr(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-12"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none transition-colors shadow-xs"
              />
            </div>
          )}

          {/* Visual Thumbnails Page Grid */}
          {thumbnails.length > 0 && mode === 'range' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Page Thumbnails (Click to Select / Deselect):</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                {thumbnails.map((t) => {
                  const isSelected = selectedPages.includes(t.pageNumber);
                  return (
                    <div
                      key={t.pageNumber}
                      onClick={() => togglePageSelect(t.pageNumber)}
                      className={`relative rounded-xl p-1.5 border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={t.dataUrl}
                        alt={`Page ${t.pageNumber}`}
                        className="w-full h-28 object-cover rounded shadow-xs"
                      />
                      <div className="flex items-center justify-between mt-1 px-1">
                        <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300">Page {t.pageNumber}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 font-bold" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            disabled={isProcessing}
            onClick={handleSplit}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Splitting PDF...</span>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                <span>Execute PDF Split</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Split Success Results */}
      {results && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              PDF Split Successfully!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generated {results.length} split output file{results.length > 1 ? 's' : ''}.
            </p>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto max-w-md mx-auto text-left">
            {results.map((res, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{res.filename}</span>
                </div>
                <a
                  href={res.downloadUrl}
                  download={res.filename}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-2 cursor-pointer text-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Split Another Document</span>
          </button>
        </div>
      )}
    </div>
  );
};
