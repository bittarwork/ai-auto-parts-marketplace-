import { useEffect, useState } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon,
  ChevronRightIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Categories Page
 * Tree view display with add/edit/delete operations and bilingual support
 */

const EMPTY_FORM = { name: { en: '', ar: '' }, description: { en: '', ar: '' }, parent: '' };

const CategoryForm = ({ categories, initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-xs font-medium text-gray-500 mb-1 block';

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name (English) *</label>
          <input
            type="text"
            required
            value={form.name.en}
            onChange={(e) => setForm(prev => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
            className={inputClass}
            placeholder="Category name in English"
          />
        </div>
        <div>
          <label className={labelClass}>Name (Arabic)</label>
          <input
            type="text"
            value={form.name.ar}
            onChange={(e) => setForm(prev => ({ ...prev, name: { ...prev.name, ar: e.target.value } }))}
            className={inputClass}
            placeholder="اسم التصنيف"
            dir="rtl"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Parent Category (leave empty for root)</label>
        <select
          value={form.parent}
          onChange={(e) => setForm(prev => ({ ...prev, parent: e.target.value }))}
          className={inputClass}
        >
          <option value="">No Parent (Root Category)</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.en || cat.name?.ar}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.en}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Category'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const CategoryRow = ({ category, depth = 0, onEdit, onDelete, children }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children && children.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${(depth * 20) + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
              {expanded
                ? <ChevronDownIcon className="w-4 h-4" />
                : <ChevronRightIcon className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}
          <span className="text-sm font-medium text-gray-800">
            {category.name?.en || category.name?.ar}
          </span>
          {category.name?.ar && (
            <span className="text-xs text-gray-400">/ {category.name.ar}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category._id)}
            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && children && children.length > 0 && (
        <div>
          {children.map(child => (
            <CategoryRow
              key={child._id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, categoryId: null, loading: false });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminCategories();
      setCategories(res.data || res.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        parent: formData.parent || null
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
        toast.success('Category updated');
      } else {
        await createCategory(payload);
        toast.success('Category created');
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteCategory(deleteModal.categoryId);
      toast.success('Category deleted');
      setDeleteModal({ open: false, categoryId: null, loading: false });
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Build category tree
  const buildTree = (cats, parentId = null) => {
    return cats
      .filter(c => {
        const cParent = c.parent?._id || c.parent || null;
        return cParent === parentId;
      })
      .map(c => ({
        ...c,
        children: buildTree(cats, c._id)
      }));
  };

  const tree = buildTree(categories);

  const renderTree = (nodes, depth = 0) => {
    return nodes.map(node => (
      <CategoryRow
        key={node._id}
        category={node}
        depth={depth}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteModal({ open: true, categoryId: id, loading: false })}
      >
        {node.children?.length > 0 ? renderTree(node.children, depth + 1) : null}
      </CategoryRow>
    ));
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <CategoryForm
          categories={categories}
          initial={editingCategory ? {
            name: editingCategory.name || { en: '', ar: '' },
            description: editingCategory.description || { en: '', ar: '' },
            parent: editingCategory.parent?._id || editingCategory.parent || ''
          } : EMPTY_FORM}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingCategory(null); }}
          saving={saving}
        />
      )}

      {/* Tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" style={{ marginLeft: `${(i % 3) * 20}px` }}></div>
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No categories yet. Add your first category.</p>
        ) : (
          <div>{renderTree(tree)}</div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, categoryId: null, loading: false })}
        loading={deleteModal.loading}
        title="Delete Category"
        message="Are you sure you want to delete this category? Sub-categories may be affected."
      />
    </div>
  );
};

export default CategoriesPage;
