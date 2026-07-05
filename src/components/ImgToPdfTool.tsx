import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  RotateCcw, 
  Check, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Settings,
  Grid
} from 'lucide-react';
import { ImageFileItem, ImgToPdfOptions, PlanLimits, UserProfile } from '../types';
import { DropZone } from './DropZone';
import { imagesToPDF, ProcessedPdfResult } from '../lib/pdfEngine';
import { recordHistory } from '../lib/firebase';

interface ImgToPdfToolProps {
  limits: PlanLimits;
  user: UserProfile | null;
  onExceedLimit: (reason: string) => void;
}

export const ImgToPdfTool: React.FC<ImgToPdfToolProps> = ({
  limits,
  user,
  onExceedLimit,
}) => {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [options, setOptions] = useState<ImgToPdfOptions>({
    orientation: 'portrait',
    margin: 'none',
    fit: 'fit_page',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedPdfResult | null>(null);

  const handleFilesAdded = (files: File[]) => {
    if (images.length + files.length > limits.maxFilesPerBatch) {
      onExceedLimit(`Batch limit: Free tier allows up to ${limits.maxFilesPerBatch} images.`);
      return;
    }

    const newItems: ImageFileItem[] = files.map((f) => ({
      id: 'img_' + Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
      previewUrl: URL.createObjectURL(f),
    }));

    setImages((prev) => [...prev, ...newItems]);
    setResult(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const list = [...images];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setImages(list);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const list = [...images];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setImages(list);
  };

  const removeItem = (id: string) => {
    setImages((prev) => prev.filter((it) => it.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await imagesToPDF(images, options);
      setResult(res);
      setIsProcessing(false);

      if (user) {
        recordHistory(user.uid, {
          tool: 'img2pdf',
          fileName: `Converted_${images.length}_images.pdf`,
          originalSize: images.reduce((acc, i) => acc + i.size, 0),
          processedSize: res.blob.size,
          timestamp: new Date().toISOString(),
          downloadName: `Images_Converted.pdf`,
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      alert('Conversion error: ' + err.message);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>JPG & PNG to PDF Converter</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Convert Images to PDF
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Turn your photos and graphic images into a single professional PDF document. Adjust page orientation, margins, and fitting.
        </p>
      </div>

      {/* Upload Dropzone */}
      {images.length === 0 && (
        <DropZone
          acceptTypes="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple={true}
          limits={limits}
          onFilesSelected={handleFilesAdded}
          onExceedLimit={onExceedLimit}
          title="Select JPG or PNG Images"
          subtitle="Drop photos here or click to browse. Reorder images before generating PDF."
        />
      )}

      {/* Options & Image Gallery when loaded */}
      {images.length > 0 && !result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-slate-800 dark:text-slate-100">Images ({images.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Add Images
                </span>
              </label>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Page Layout Settings
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Page Orientation</label>
                <select
                  value={options.orientation}
                  onChange={(e: any) => setOptions({ ...options, orientation: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none shadow-xs"
                >
                  <option value="portrait">Portrait (A4 Vertical)</option>
                  <option value="landscape">Landscape (A4 Horizontal)</option>
                  <option value="auto">Auto-Detect Aspect Ratio</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Page Margins</label>
                <select
                  value={options.margin}
                  onChange={(e: any) => setOptions({ ...options, margin: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none shadow-xs"
                >
                  <option value="none">No Margin (Full Bleed)</option>
                  <option value="small">Small Margin (0.25 in)</option>
                  <option value="large">Big Margin (0.50 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Image Fit</label>
                <select
                  value={options.fit}
                  onChange={(e: any) => setOptions({ ...options, fit: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none shadow-xs"
                >
                  <option value="fit_page">Fit Image to Page</option>
                  <option value="original">Keep Original Scale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Grid with Drag/Reorder */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 relative group flex flex-col shadow-xs"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2 border border-slate-200 dark:border-slate-700">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[10px]">
                    #{idx + 1}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate mb-2">
                  {item.name}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-1.5 mt-auto">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer text-xs"
                      title="Move Left"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === images.length - 1}
                      onClick={() => moveDown(idx)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer text-xs"
                      title="Move Right"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 cursor-pointer text-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            disabled={isProcessing}
            onClick={handleConvert}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Converting Images to PDF...</span>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                <span>Convert {images.length} Images to PDF</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              PDF Generated Successfully!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Converted {images.length} images into a single {result.pageCount}-page PDF file.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download="Converted_Images.pdf"
              className="w-full sm:w-auto py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Converted PDF</span>
            </a>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Convert More Images</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
