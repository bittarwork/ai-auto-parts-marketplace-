import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon,
  ChevronRightIcon, ChevronDownIcon,
  TagIcon, FolderIcon, FolderOpenIcon,
  MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon,
  XMarkIcon, CheckIcon, ArrowPathIcon,
  HashtagIcon, CubeIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/react/24/outline';
import { FolderIcon as FolderSolid } from '@heroicons/react/24/solid';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Categories Management Page
 * Complete rebuild with stats, search, tree/list view, and modal form
 */

const EMPTY_FORM = {
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
  parent: ''
};

/* ─── Depth color palette for tree levels ─── */
const DEPTH_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', dot: 'bg-violet-500', icon: 'text-violet-500' },
  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   dot: 'bg-blue-500',   icon: 'text-blue-500'   },
  { bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-300',dot: 'bg-emerald-500',icon: 'text-emerald-500'},
  { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  dot: 'bg-amber-500',  icon: 'text-amber-500'  },
];
const getDepthColor = (depth) => DEPTH_COLORS[depth % DEPTH_COLORS.length];

/* ─── Statistics Card ─── */
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-2xl border ${color.border} p-4 flex items-center gap-3`}>
    <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${color.icon}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── Category Form Modal ─── */
const CategoryFormModal = ({ categories, initial, editingCategory, onSave, onClose, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [activeTab, setActiveTab] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.en.trim()) return;
    onSave(form);
  };

  const inputBase = 'w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-gray-400';
  const labelBase = 'block text-xs font-semibold text-gray-600 mb-1.5';

  /* Filter out the category being edited to avoid self-parent */
  const parentOptions = categories.filter(c => c._id !== editingCategory?._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {editingCategory ? <PencilIcon className="w-4 h-4 text-white" /> : <PlusIcon className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <p className="text-xs text-violet-200">
                {editingCategory ? `Editing: ${editingCategory.name?.en}` : 'Add a new category to the hierarchy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Language Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'en', label: 'English', flag: '🇬🇧' },
              { id: 'ar', label: 'Arabic', flag: '🇸🇦' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.flag}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Name Field */}
          <div>
            <label className={labelBase}>
              Category Name {activeTab === 'en' ? '(English)' : '(Arabic)'}
              {activeTab === 'en' && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {activeTab === 'en' ? (
              <input
                type="text"
                value={form.name.en}
                onChange={e => setForm(p => ({ ...p, name: { ...p.name, en: e.target.value } }))}
                className={inputBase}
                placeholder="e.g. Engine Parts"
                required
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={form.name.ar}
                onChange={e => setForm(p => ({ ...p, name: { ...p.name, ar: e.target.value } }))}
                className={`${inputBase} text-right`}
                placeholder="مثال: قطع المحرك"
                dir="rtl"
              />
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className={labelBase}>
              Description {activeTab === 'en' ? '(English)' : '(Arabic)'}
              <span className="text-gray-400 font-normal ml-1">optional</span>
            </label>
            {activeTab === 'en' ? (
              <textarea
                value={form.description?.en || ''}
                onChange={e => setForm(p => ({ ...p, description: { ...p.description, en: e.target.value } }))}
                className={`${inputBase} resize-none`}
                placeholder="Brief description of this category..."
                rows={3}
              />
            ) : (
              <textarea
                value={form.description?.ar || ''}
                onChange={e => setForm(p => ({ ...p, description: { ...p.description, ar: e.target.value } }))}
                className={`${inputBase} resize-none text-right`}
                placeholder="وصف مختصر لهذا التصنيف..."
                rows={3}
                dir="rtl"
              />
            )}
          </div>

          {/* Parent Selector */}
          <div>
            <label className={labelBase}>Parent Category</label>
            <div className="relative">
              <FolderIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={form.parent}
                onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
                className={`${inputBase} pl-9 appearance-none cursor-pointer`}
              >
                <option value="">Root Level (No parent)</option>
                {parentOptions.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name?.en || cat.name?.ar}
                    {cat.name?.ar ? ` — ${cat.name.ar}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {form.parent && (
              <p className="text-xs text-violet-600 mt-1.5 flex items-center gap-1">
                <CheckIcon className="w-3 h-3" />
                Will be nested under the selected parent
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-11 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.en.trim()}
              className="flex-1 h-11 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Tree Node Row ─── */
const TreeNode = ({ node, depth, onEdit, onDelete, renderChildren }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children?.length > 0;
  const colors = getDepthColor(depth);

  return (
    <div className="select-none">
      <div
        className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-default"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 transition-colors ${
            hasChildren ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-default'
          }`}
        >
          {hasChildren ? (
            expanded
              ? <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              : <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-auto" />
          )}
        </button>

        {/* Folder Icon */}
        <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          {hasChildren && expanded
            ? <FolderOpenIcon className={`w-4 h-4 ${colors.icon}`} />
            : <FolderIcon className={`w-4 h-4 ${colors.icon}`} />
          }
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 truncate">
            {node.name?.en || node.name?.ar || 'Unnamed'}
          </span>
          {node.name?.ar && (
            <span className="text-xs text-gray-400 truncate hidden sm:block" dir="rtl">
              {node.name.ar}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Depth badge */}
          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            {depth === 0 ? 'Root' : `Level ${depth}`}
          </span>

          {/* Children count */}
          {hasChildren && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              <FolderIcon className="w-3 h-3" />
              {node.children.length}
            </span>
          )}

          {/* Product count if available */}
          {node.productCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
              <CubeIcon className="w-3 h-3" />
              {node.productCount}
            </span>
          )}

          {/* Active/Inactive status */}
          {node.isActive === false ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-full">
              <XCircleIcon className="w-3 h-3" />
              Inactive
            </span>
          ) : null}
        </div>

        {/* Action Buttons - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(node)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-violet-500 hover:bg-violet-100 transition-colors"
            title="Edit category"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(node._id, node.name?.en)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-100 transition-colors"
            title="Delete category"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          {/* Visual connector line */}
          <div
            className={`absolute top-0 bottom-0 w-px ${colors.dot.replace('bg-', 'bg-')}/20`}
            style={{ left: `${depth * 24 + 22}px` }}
          />
          {renderChildren(node.children, depth + 1)}
        </div>
      )}
    </div>
  );
};

/* ─── Flat List Row ─── */
const ListRow = ({ category, depth, onEdit, onDelete }) => {
  const colors = getDepthColor(depth);
  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      {/* Level indicator */}
      <div className={`w-1.5 h-8 rounded-full ${colors.dot} flex-shrink-0`} />

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <FolderIcon className={`w-4 h-4 ${colors.icon}`} />
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{category.name?.en || 'Unnamed'}</p>
        {category.name?.ar && (
          <p className="text-xs text-gray-400 truncate" dir="rtl">{category.name.ar}</p>
        )}
      </div>

      {/* Level */}
      <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
        {depth === 0 ? 'Root' : `Lvl ${depth}`}
      </span>

      {/* Product count */}
      {category.productCount > 0 && (
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
          <CubeIcon className="w-3 h-3" />
          {category.productCount} products
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-violet-500 hover:bg-violet-100 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category._id, category.name?.en)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-100 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = ({ hasSearch, onClear, onAdd }) => (
  <div className="py-16 flex flex-col items-center gap-4">
    <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center">
      <TagIcon className="w-10 h-10 text-violet-300" />
    </div>
    <div className="text-center">
      <p className="text-base font-semibold text-gray-700">
        {hasSearch ? 'No categories found' : 'No categories yet'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {hasSearch
          ? 'Try a different search term'
          : 'Start building your category hierarchy'}
      </p>
    </div>
    {hasSearch ? (
      <button
        onClick={onClear}
        className="text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        Clear search
      </button>
    ) : (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add First Category
      </button>
    )}
  </div>
);

/* ─── Main Page Component ─── */
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [viewMode, setViewMode]     = useState('tree'); // 'tree' | 'list'
  const [search, setSearch]         = useState('');

  const [showForm, setShowForm]         = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false, categoryId: null, categoryName: '', loading: false
  });

  /* ── Fetch ── */
  const fetchCategories = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getAdminCategories();
      setCategories(res.data || res.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── Build Tree ── */
  const buildTree = (cats, parentId = null) =>
    cats
      .filter(c => {
        const cParent = c.parent?._id || c.parent || null;
        return cParent === parentId;
      })
      .map(c => ({ ...c, children: buildTree(cats, c._id) }));

  /* ── Flatten for list view with depth info ── */
  const flattenTree = (nodes, depth = 0) => {
    const result = [];
    for (const node of nodes) {
      result.push({ ...node, _depth: depth });
      if (node.children?.length > 0) result.push(...flattenTree(node.children, depth + 1));
    }
    return result;
  };

  const tree = useMemo(() => buildTree(categories), [categories]);
  const flatList = useMemo(() => flattenTree(tree), [tree]);

  /* ── Search filter (flat list) ── */
  const filteredFlat = useMemo(() => {
    if (!search.trim()) return flatList;
    const q = search.toLowerCase();
    return flatList.filter(c =>
      c.name?.en?.toLowerCase().includes(q) ||
      c.name?.ar?.includes(q)
    );
  }, [flatList, search]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: categories.length,
    root: categories.filter(c => !c.parent).length,
    sub: categories.filter(c => !!c.parent).length,
    active: categories.filter(c => c.isActive !== false).length,
  }), [categories]);

  /* ── CRUD ── */
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
        toast.success('Category updated successfully');
      } else {
        await createCategory(payload);
        toast.success('Category created successfully');
      }
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeletePrompt = (id, name) => {
    setDeleteModal({ open: true, categoryId: id, categoryName: name || '', loading: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(p => ({ ...p, loading: true }));
    try {
      await deleteCategory(deleteModal.categoryId);
      toast.success('Category deleted');
      setDeleteModal({ open: false, categoryId: null, categoryName: '', loading: false });
      fetchCategories(true);
    } catch {
      toast.error('Failed to delete category');
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  /* ── Recursive tree renderer ── */
  const renderTree = (nodes, depth = 0) =>
    nodes.map(node => (
      <TreeNode
        key={node._id}
        node={node}
        depth={depth}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
        renderChildren={renderTree}
      />
    ));

  /* ── Display list (search mode or list view) ── */
  const displayList = search.trim() ? filteredFlat : flatList;

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
              <TagIcon className="w-4 h-4 text-violet-600" />
            </div>
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 ml-10">
            Manage your product category hierarchy
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing || loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Category */}
          <button
            onClick={() => { setEditingCategory(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
          >
            <PlusIcon className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Categories"
          value={loading ? '—' : stats.total}
          icon={TagIcon}
          color={{ border: 'border-violet-200', bg: 'bg-violet-100', icon: 'text-violet-600' }}
        />
        <StatCard
          label="Root Categories"
          value={loading ? '—' : stats.root}
          icon={FolderIcon}
          color={{ border: 'border-blue-200', bg: 'bg-blue-100', icon: 'text-blue-600' }}
        />
        <StatCard
          label="Subcategories"
          value={loading ? '—' : stats.sub}
          icon={HashtagIcon}
          color={{ border: 'border-amber-200', bg: 'bg-amber-100', icon: 'text-amber-600' }}
        />
        <StatCard
          label="Active"
          value={loading ? '—' : stats.active}
          icon={CheckCircleIcon}
          color={{ border: 'border-emerald-200', bg: 'bg-emerald-100', icon: 'text-emerald-600' }}
        />
      </div>

      {/* ── Toolbar: Search + View Toggle ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results count */}
        {search && (
          <span className="text-sm text-gray-500">
            {filteredFlat.length} result{filteredFlat.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* View toggle — only show when not searching */}
        {!search && (
          <div className="ml-auto flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode('tree')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                viewMode === 'tree' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Tree view"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="List view"
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Panel ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {loading ? (
          /* Skeleton */
          <div className="p-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-11 bg-gray-100 rounded-xl animate-pulse"
                style={{ marginLeft: `${(i % 3) * 24}px`, opacity: 1 - i * 0.08 }}
              />
            ))}
          </div>
        ) : categories.length === 0 && !search ? (
          /* No data at all */
          <EmptyState onAdd={() => { setEditingCategory(null); setShowForm(true); }} />
        ) : search && filteredFlat.length === 0 ? (
          /* No search results */
          <EmptyState hasSearch onClear={() => setSearch('')} />
        ) : search || viewMode === 'list' ? (
          /* Flat list view (or search results) */
          <div>
            {displayList.map(cat => (
              <ListRow
                key={cat._id}
                category={cat}
                depth={cat._depth}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        ) : (
          /* Tree view */
          <div className="p-3">
            {renderTree(tree)}
          </div>
        )}
      </div>

      {/* ── Category count footer ── */}
      {!loading && categories.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total
          {search && ` · ${filteredFlat.length} matching`}
        </p>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <CategoryFormModal
          categories={categories}
          editingCategory={editingCategory}
          initial={editingCategory ? {
            name: editingCategory.name || { en: '', ar: '' },
            description: editingCategory.description || { en: '', ar: '' },
            parent: editingCategory.parent?._id || editingCategory.parent || ''
          } : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingCategory(null); }}
          saving={saving}
        />
      )}

      {/* ── Delete Confirmation ── */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, categoryId: null, categoryName: '', loading: false })}
        loading={deleteModal.loading}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.categoryName}"? Sub-categories and products may be affected.`}
      />
    </div>
  );
};

export default CategoriesPage;
