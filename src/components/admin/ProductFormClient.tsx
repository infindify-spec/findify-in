'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft, Upload, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export interface ProductFormClientProps {
  categories: Array<{
    id: string;
    name: string;
    subcategories: Array<{ id: string; name: string }>;
  }>;
  initialProduct?: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    brand?: string | null;
    categoryId: string;
    subcategoryId?: string | null;
    mrp: number;
    sellingPrice: number;
    costPrice?: number | null;
    stock: number;
    lowStockThreshold: number;
    description: string;
    shortDescription?: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    images: string[];
  };
}

export function ProductFormClient({ categories, initialProduct }: ProductFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    sku: initialProduct?.sku || '',
    slug: initialProduct?.slug || '',
    brand: initialProduct?.brand || 'FINDIFY.IN',
    categoryId: initialProduct?.categoryId || (categories[0]?.id || ''),
    subcategoryId: initialProduct?.subcategoryId || '',
    mrp: initialProduct?.mrp || 1999,
    sellingPrice: initialProduct?.sellingPrice || 999,
    costPrice: initialProduct?.costPrice || 450,
    stock: initialProduct?.stock || 50,
    lowStockThreshold: initialProduct?.lowStockThreshold || 5,
    description: initialProduct?.description || '',
    shortDescription: initialProduct?.shortDescription || '',
    status: initialProduct?.status || 'PUBLISHED',
  });

  const [images, setImages] = useState<string[]>(
    initialProduct?.images || []
  );

  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price: number; stock: number }>>([]);


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const autoSku = 'FINDIFY-' + val.substring(0, 4).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: initialProduct ? prev.slug : autoSlug,
      sku: initialProduct ? prev.sku : autoSku,
    }));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);
    let uploaded = 0;
    for (const file of fileArray) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          setImages((prev) => [...prev, data.url]);
          uploaded++;
        } else {
          toast.error(data.message || `Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Upload failed for ${file.name}`);
      }
    }
    setIsUploading(false);
    if (uploaded > 0) toast.success(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded successfully`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const handleAddUrlImage = () => {
    const url = imageUrlInput.trim();
    if (url) {
      setImages((prev) => [...prev, url]);
      setImageUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: 'Variant ' + (prev.length + 1),
        sku: `${formData.sku}-V${prev.length + 1}`,
        price: formData.sellingPrice,
        stock: 25,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.categoryId) {
      toast.error('Please fill required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!initialProduct;
      const url = isEdit ? `/api/admin/products/${initialProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images,
          variants,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'Product updated!' : 'Product created!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to save product');
      }
    } catch {
      toast.error('Network error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === formData.categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-xs font-bold text-[#666666] hover:text-[#1F1F1F] flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products List</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#C62828] text-white font-extrabold text-xs py-3 px-6 rounded-xl hover:bg-[#B71C1C] transition-colors flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Product...' : 'Save & Publish Product'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Basic Product Details
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Findify UltraFit Pro Smartwatch with Bluetooth Calling"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Full Product Description *</label>
              <textarea
                rows={5}
                required
                placeholder="Detailed features, benefits, battery life, and materials..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">MRP (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-black text-[#C62828] focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Cost Price (₹)</label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Total Stock Units *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider">Product Images</h3>
              <button
                type="button"
                onClick={() => setShowUrlInput((v) => !v)}
                className="text-xs font-medium text-[#666666] hover:text-[#1F1F1F] flex items-center gap-1"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {showUrlInput ? 'Hide URL input' : 'Add by URL'}
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1F5D42] bg-[#EAF3EE]'
                  : 'border-[#E5DED2] bg-[#FAF6EF] hover:border-[#1F1F1F] hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[#1F5D42]' : 'text-[#999999]'}`} />
              {isUploading ? (
                <p className="text-xs font-semibold text-[#1F5D42] animate-pulse">Uploading images...</p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-[#1F1F1F]">
                    {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[11px] text-[#888888] mt-1">PNG, JPG, WebP up to 5MB each</p>
                </>
              )}
            </div>

            {/* URL Paste fallback */}
            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste image URL (Unsplash, CDN, etc.)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrlImage()}
                  className="flex-1 bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs focus:outline-none focus:border-[#1F5D42]"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="bg-[#1F5D42] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#174A35] transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-[#E5DED2] rounded-xl overflow-hidden group bg-[#F8F7F3]">
                    <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-white/90 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#1F5D42] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Category & Publishing */}
        <div className="space-y-6">
          
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Category & Status
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Publishing Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
              >
                <option value="PUBLISHED">PUBLISHED (Active on storefront)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Primary Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Subcategory</label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                >
                  <option value="">None</option>
                  {selectedCategoryObj.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Variants Manager */}
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider">Product Variants</h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-xs text-[#666666] italic">No variants added. Product will sell as single item.</p>
            ) : (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="bg-[#FAF6EF] border border-[#E5DED2] p-2.5 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#1F1F1F] block">{v.name}</span>
                    <span className="text-[#666666] text-[10px]">Price: ₹{v.price} | Stock: {v.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </form>
  );
}
