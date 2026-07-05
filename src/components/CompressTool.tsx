import React, { useState } from 'react';
import { 
  Minimize2, 
  Download, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingDown,
  Percent
} from 'lucide-react';
import { CompressionPreset, PlanLimits, UserProfile } from '../types';
import { DropZone } from './DropZone';
import { compressPDF, ProcessedPdfResult } from '../lib/pdfEngine';
import { recordHistory } from '../lib/firebase';

interface CompressToolProps {
  limits: PlanLimits;
  user: UserProfile | null;
  onExceedLimit: (reason: string) => void;
  onUpgradePrompt: () => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({
  limits,
  user,
  onExceedLimit,
  onUpgradePrompt,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedPdfResult | null>(null);

  const handleFileAdded = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];

    if (selected.size > limits.maxFileSizeMb * 1024 * 1024) {
      onExceedLimit(`File size exceeds free limit of ${limits.maxFileSizeMb}MB.`);
      return;
    }

    setFile(selected);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    if (preset === 'extreme' && !limits.allowHighCompression) {
      onUpgradePrompt();
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await compressPDF(file, preset);
      setResult(res);
      setIsProcessing(false);

      if (user) {
        recordHistory(user.uid, {
          tool: 'compress',
          fileName: file.name,
          originalSize: file.size,
          processedSize: res.blob.size,
          timestamp: new Date().toISOString(),
          downloadName: `Compressed_${file.name}`,
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      alert('Compression error: ' + err.message);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <Minimize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Browser PDF Compression</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Compress PDF Size
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Reduce PDF file size without sacrificing document quality. Client-side processing keeps your data 100% private.
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
          title="Select a PDF to Compress"
          subtitle="Drop file here or click to browse. Choose from preset compression levels."
        />
      )}

      {/* Compression Options when file selected */}
      {file && !result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{file.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Size: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</strong>
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Compression Level Presets */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose Compression Quality Level:</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Extreme Compression */}
              <div
                onClick={() => setPreset('extreme')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  preset === 'extreme'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {!limits.allowHighCompression && (
                  <span className="absolute top-2 right-2 text-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
                <div className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Extreme Compression
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Maximum size reduction (~70% smaller). Best for web sharing and fast emailing.
                </div>
              </div>

              {/* Recommended Compression */}
              <div
                onClick={() => setPreset('recommended')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  preset === 'recommended'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="absolute top-2 right-2 text-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-200 dark:border-emerald-800">
                  RECOMMENDED
                </span>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Recommended
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Optimal balance between file size (~50% smaller) and visual quality.
                </div>
              </div>

              {/* Light Compression */}
              <div
                onClick={() => setPreset('less')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  preset === 'less'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Light Compression
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Minimal compression (~25% smaller) preserving maximum image resolution.
                </div>
              </div>
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={handleCompress}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Compressing PDF in Browser...</span>
            ) : (
              <>
                <Minimize2 className="w-5 h-5" />
                <span>Compress PDF Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <TrendingDown className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              PDF Compressed Successfully!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your PDF is now <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{result.savingsPercent}% smaller</strong>.
            </p>
          </div>

          {/* Savings Stats Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase">Original</span>
              <span className="font-bold text-slate-400 dark:text-slate-500 line-through text-sm">{result.originalSizeMb.toFixed(2)} MB</span>
            </div>

            <div className="border-x border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block uppercase font-bold">New Size</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">{result.newSizeMb.toFixed(2)} MB</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase">Savings</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm flex items-center justify-center gap-0.5">
                <Percent className="w-3 h-3" /> {result.savingsPercent}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download={`Compressed_${file?.name || 'document.pdf'}`}
              className="w-full sm:w-auto py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Compressed PDF</span>
            </a>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Compress Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
