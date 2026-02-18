import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createProduct, updateProduct, getAdminCategories } from '../../services/adminService';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Admin Product Form Page
 * Full CRUD form for products with bilingual fields and compatibility matrix
 */

const EMPTY_FORM = {
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
  partNumber: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '',
  supplier: '',
  brand: '',
  condition: 'new',
  isFeatured: false,
  isActive: true,
  specifications: [],
  compatibility: []
};

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Spec / compat helpers
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newCompat, setNewCompat] = useState({ brand: '', model: '', yearFrom: '', yearTo: '' });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAdminCategories();
        setCategories(res.data || res.categories || []);
      } catch {
        // ignore
      }
    };
    loadCategories();

    if (isEdit) {
      const loadProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data || res.product || res;
          setForm({
            name: p.name || { en: '', ar: '' },
            description: p.description || { en: '', ar: '' },
            partNumber: p.partNumber || '',
            category: p.category?._id || p.category || '',
            price: p.price || '',
            originalPrice: p.originalPrice || '',
            stock: p.stock || '',
            supplier: p.supplier?._id || p.supplier || '',
            brand: p.brand || '',
            condition: p.condition || 'new',
            isFeatured: p.isFeatured || false,
            isActive: p.isActive !== undefined ? p.isActive : true,
            specifications: p.specifications || [],
            compatibility: p.compatibility || []
          });
        } catch {
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id]);

  const handleChange = (path, value) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setForm(prev => ({ ...prev, [keys[0]]: value }));
    } else {
      setForm(prev => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
      }));
    }
  };

  const addSpec = () => {
    if (!newSpec.key || !newSpec.value) return;
    setForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { ...newSpec }]
    }));
    setNewSpec({ key: '', value: '' });
  };

  const removeSpec = (i) => {
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, idx) => idx !== i)
    }));
  };

  const addCompat = () => {
    if (!newCompat.brand || !newCompat.model) return;
    setForm(prev => ({
      ...prev,
      compatibility: [...prev.compatibility, { ...newCompat }]
    }));
    setNewCompat({ brand: '', model: '', yearFrom: '', yearTo: '' });
  };

  const removeCompat = (i) => {
    setForm(prev => ({
      ...prev,
      compatibility: prev.compatibility.filter((_, idx) => idx !== i)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        stock: parseInt(form.stock)
      };

      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-xs font-medium text-gray-500 mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Products
      </button>

      {/* Bilingual Names */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Product Names (Bilingual)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name (English) *</label>
            <input
              type="text"
              required
              value={form.name.en}
              onChange={(e) => handleChange('name.en', e.target.value)}
              className={inputClass}
              placeholder="Product name in English"
            />
          </div>
          <div>
            <label className={labelClass}>Name (Arabic)</label>
            <input
              type="text"
              value={form.name.ar}
              onChange={(e) => handleChange('name.ar', e.target.value)}
              className={inputClass}
              placeholder="اسم المنتج بالعربية"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Description (English)</label>
            <textarea
              value={form.description.en}
              onChange={(e) => handleChange('description.en', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Product description in English"
            />
          </div>
          <div>
            <label className={labelClass}>Description (Arabic)</label>
            <textarea
              value={form.description.ar}
              onChange={(e) => handleChange('description.ar', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="وصف المنتج بالعربية"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Core Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Product Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Part Number *</label>
            <input
              type="text"
              required
              value={form.partNumber}
              onChange={(e) => handleChange('partNumber', e.target.value)}
              className={inputClass}
              placeholder="e.g. TY-1234-A"
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className={inputClass}
              placeholder="e.g. Toyota"
            />
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select
              value={form.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              className={inputClass}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (EUR) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass}>Original Price (EUR)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass}>Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClass}
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name?.en || cat.name?.ar}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Specifications</h3>

        {form.specifications.map((spec, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-gray-600 flex-1">{spec.key}: {spec.value}</span>
            <button
              type="button"
              onClick={() => removeSpec(i)}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            value={newSpec.key}
            onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))}
            className={`${inputClass} flex-1`}
            placeholder="Key (e.g. Weight)"
          />
          <input
            type="text"
            value={newSpec.value}
            onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
            className={`${inputClass} flex-1`}
            placeholder="Value (e.g. 1.2 kg)"
          />
          <button
            type="button"
            onClick={addSpec}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compatibility Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Vehicle Compatibility</h3>

        {form.compatibility.map((c, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-700 flex-1">
              {c.brand} {c.model} {c.yearFrom && `(${c.yearFrom}–${c.yearTo || 'present'})`}
            </span>
            <button
              type="button"
              onClick={() => removeCompat(i)}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <input
            type="text"
            value={newCompat.brand}
            onChange={(e) => setNewCompat(prev => ({ ...prev, brand: e.target.value }))}
            className={inputClass}
            placeholder="Brand *"
          />
          <input
            type="text"
            value={newCompat.model}
            onChange={(e) => setNewCompat(prev => ({ ...prev, model: e.target.value }))}
            className={inputClass}
            placeholder="Model *"
          />
          <input
            type="number"
            value={newCompat.yearFrom}
            onChange={(e) => setNewCompat(prev => ({ ...prev, yearFrom: e.target.value }))}
            className={inputClass}
            placeholder="From year"
          />
          <input
            type="number"
            value={newCompat.yearTo}
            onChange={(e) => setNewCompat(prev => ({ ...prev, yearTo: e.target.value }))}
            className={inputClass}
            placeholder="To year"
          />
          <button
            type="button"
            onClick={addCompat}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pb-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isEdit ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductFormPage;
