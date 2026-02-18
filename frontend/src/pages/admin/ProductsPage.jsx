import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { getAdminProducts, deleteProduct, bulkUpdateProducts } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Products Management Page
 * Table with search, bulk actions, and CRUD operations
 */

const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const StockBadge = ({ stock }) => {
  if (stock === 0)   return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Out of stock</span>;
  if (stock <= 5)   return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />{stock} low</span>;
  if (stock <= 20)  return <span className="text-xs font-medium text-gray-600">{stock}</span>;
  return <span className="text-xs font-medium text-emerald-600">{stock}</span>;
};

const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);

  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [sortBy, setSortBy]   = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, loading: false });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search) params.search = search;

      const res = await getAdminProducts(params);
      // API returns { data: products[], pagination } - data is the array directly
      setProducts(Array.isArray(res?.data) ? res.data : (res?.data?.products || res?.products || []));
      setPagination(res?.pagination ?? res?.data?.pagination ?? null);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const allSelected = selectedIds.length === products.length && products.length > 0;

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : products.map(p => p._id));

  const toggleOne = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleBulk = async (isActive) => {
    try {
      await bulkUpdateProducts({ ids: selectedIds, updates: { isActive } });
      toast.success(`${selectedIds.length} products ${isActive ? 'activated' : 'deactivated'}`);
      setSelectedIds([]);
      fetchProducts();
    } catch { toast.error('Bulk update failed'); }
  };

  const handleDelete = async () => {
    setDeleteModal(p => ({ ...p, loading: true }));
    try {
      await deleteProduct(deleteModal.productId);
      toast.success('Product deleted');
      setDeleteModal({ open: false, productId: null, loading: false });
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={() => toggleOne(row._id)}
          onClick={e => e.stopPropagation()}
          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      )
    },
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
            {row.images?.[0]?.url
              ? <img src={row.images[0].url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
            }
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 max-w-[180px] truncate">
              {row.name?.en || row.name?.ar || '—'}
            </p>
            <p className="text-xs text-gray-400 font-mono">{row.partNumber}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.category?.name?.en || row.category?.name?.ar || '—'}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => <span className="text-sm font-bold text-gray-900">{fmtCurrency(row.price)}</span>
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (row) => <StockBadge stock={row.stock} />
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
          row.isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            : 'bg-gray-100 text-gray-500 border-gray-200/60'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/products/${row._id}/edit`)}
            className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, productId: row._id, loading: false })}
            className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {pagination ? `${pagination.total} products` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or part numbers…"
              className="w-full pl-9 pr-4 h-9 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button type="submit" className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setPage(1); fetchProducts(); }}
              className="h-9 px-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 flex items-center gap-1 text-sm transition-colors">
              <ArrowPathIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm shadow-blue-200">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{selectedIds.length}</span>
          </div>
          <span className="text-sm font-medium text-white flex-1">
            {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => handleBulk(true)}
            className="h-7 px-3 text-xs font-semibold bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulk(false)}
            className="h-7 px-3 text-xs font-semibold bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Deactivate
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="h-7 px-3 text-xs font-semibold text-blue-200 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        emptyMessage="No products found"
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, productId: null, loading: false })}
        loading={deleteModal.loading}
        title="Delete Product"
        message="This will permanently remove the product and cannot be undone."
      />
    </div>
  );
};

export default ProductsPage;
