import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Plus, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';

export const ImageUploadPreview = ({
  images = [],
  onChange,
  maxImages = 5,
  maxSizeMB = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError('');

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can only add ${maxImages - images.length} more.`);
      return;
    }

    // Validate size and format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setError(`"${file.name}" is not a supported format. Please upload JPEG, PNG, or WEBP.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`"${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        return;
      }
    }

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await productService.uploadImages(formData);
      if (res.success && res.data?.urls) {
        const updated = [...images, ...res.data.urls];
        onChange(updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    // Basic URL check
    if (!/^https?:\/\/.+/i.test(urlInput.trim())) {
      setError('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }

    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto text-rose-500 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Preview Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs"
            >
              <img
                src={url}
                alt={`Crop preview ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400';
                }}
              />
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white font-bold text-[9px] uppercase tracking-wider backdrop-blur-xs">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone & Controls */}
      {images.length < maxImages && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* File selector card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex-1 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 p-5 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {uploading ? 'Processing & Uploading...' : 'Upload Crop Photographs'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              PNG, JPG, WEBP up to 5MB (Max {maxImages} images)
            </p>
          </div>

          {/* Or URL input toggle */}
          <div className="w-full sm:w-auto flex sm:flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{showUrlInput ? 'Hide URL' : 'Paste Image URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* URL Input Form */}
      {showUrlInput && images.length < maxImages && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or cloud image URL"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Add URL
          </button>
        </form>
      )}
    </div>
  );
};
