import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { getAdminProducts, deleteProduct, bulkUpdateProducts } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Products Management Page
 * Table with filters, bulk actions, and product CRUD operations
 */

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, loading: false });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search) params.search = search;

      const res = await getAdminProducts(params);
      setProducts(res.data?.products || res.products || []);
      setPagination(res.data?.pagination || res.pagination || null);
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = async (active) => {
    try {
      await bulkUpdateProducts({ ids: selectedIds, updates: { isActive: active } });
      toast.success(`${selectedIds.length} products ${active ? 'activated' : 'deactivated'}`);
      setSelectedIds([]);
      fetchProducts();
    } catch {
      toast.error('Bulk update failed');
    }
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteProduct(deleteModal.productId);
      toast.success('Product deleted');
      setDeleteModal({ open: false, productId: null, loading: false });
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={selectedIds.length === products.length && products.length > 0}
          className="rounded border-gray-300"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={() => handleSelectOne(row._id)}
          className="rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        row.images?.[0]?.url ? (
          <img
            src={row.images[0].url}
            alt=""
            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">N/A</span>
          </div>
        )
      )
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-800 max-w-xs truncate">
            {row.name?.en || row.name?.ar || '—'}
          </p>
          <p className="text-xs text-gray-400">{row.partNumber}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.category?.name?.en || row.category?.name?.ar || '—'}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price (EUR)',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-800">{formatCurrency(row.price)}</span>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (row) => (
        <span className={`text-sm font-medium ${row.stock <= 5 ? 'text-red-600' : row.stock <= 20 ? 'text-orange-500' : 'text-green-600'}`}>
          {row.stock}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/products/${row._id}/edit`)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, productId: row._id, loading: false })}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, part numbers..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Search
            </button>
          </form>

          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => handleBulkActivate(true)}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkActivate(false)}
            className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700"
          >
            Deactivate
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
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

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, productId: null, loading: false })}
        loading={deleteModal.loading}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default ProductsPage;
