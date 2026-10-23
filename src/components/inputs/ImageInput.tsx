import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Camera, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { analyzeImageMetadata } from '../../utils/imageExif';
import { ImageMetadataInfo } from '../../types';

interface ImageInputProps {
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  selectedFile,
  previewUrl,
  onFileSelect,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [quickMetadata, setQuickMetadata] = useState<ImageMetadataInfo | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onFileSelect(file, url);

    try {
      const meta = await analyzeImageMetadata(file);
      setQuickMetadata(meta);
    } catch {
      setQuickMetadata(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onFileSelect(null, null);
    setQuickMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Test sample generators
  const loadSyntheticSample = async () => {
    // Creates a lightweight canvas with synthetic software text metadata
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 400, 300);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.fillText('Synthetic Diffusion Sample', 30, 150);
    }
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'synthetic_render_sample.png', { type: 'image/png' });
        const url = URL.createObjectURL(file);
        onFileSelect(file, url);
        setQuickMetadata({
          label: 'Likely AI-generated',
          hasExifCameraData: false,
          softwareDetected: 'Diffusion Model Workflow',
          reasoning: 'Metadata inspection identified synthetic diffusion workflow indicators.',
          technicalIndicators: ['Diffusion sampling parameters embedded', 'Absence of camera hardware sensor']
        });
      }
    }, 'image/png');
  };

  const loadAuthenticPhotoSample = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#f5f5f4';
      ctx.font = '16px sans-serif';
      ctx.fillText('Optical Camera Photo Sample', 30, 150);
    }
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'dsc_4892_dslr_capture.jpg', { type: 'image/jpeg' });
        const url = URL.createObjectURL(file);
        onFileSelect(file, url);
        setQuickMetadata({
          label: 'Looks real',
          hasExifCameraData: true,
          cameraMake: 'Sony',
          cameraModel: 'ILCE-7M4',
          dateTime: '2026:09:14 14:22:08',
          reasoning: 'Valid optical hardware metadata present (Sony ILCE-7M4), consistent with camera capture.',
          technicalIndicators: ['Optical sensor capture tag: Sony ILCE-7M4', 'Hardware timestamp recorded']
        });
      }
    }, 'image/jpeg');
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {previewUrl ? (
        <div className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B26] shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={previewUrl}
                alt="Selected asset preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                  {selectedFile?.name || 'Selected image'}
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedFile && (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'image'}
                </div>
              )}

              {/* Preliminary metadata badge */}
              {quickMetadata && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    {quickMetadata.label === 'Looks real' ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Camera EXIF found</span>
                      </span>
                    ) : quickMetadata.label === 'Likely AI-generated' ? (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Synthetic signatures detected</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Metadata stripped/standard web image</span>
                      </span>
                    )}
                  </div>
                  {quickMetadata.cameraModel && (
                    <span className="block text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                      Sensor: {quickMetadata.cameraMake} {quickMetadata.cameraModel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-slate-500 bg-slate-100/70 dark:bg-slate-800/60'
              : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-[#131B26]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="p-3.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Click to upload or drag and drop an image
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            Supports JPEG, PNG, WebP · Local EXIF inspection &amp; visual authenticity analysis
          </p>
        </div>
      )}

      {/* Preset Test Images */}
      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Quick test presets:</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={loadAuthenticPhotoSample}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Authentic Camera Photo
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={loadSyntheticSample}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Synthetic Render
          </button>
        </div>
      </div>
    </div>
  );
};
