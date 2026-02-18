import api from './api';

/**
 * Admin Service
 * Handles all admin API calls
 */

// ============================================================
// DASHBOARD
// ============================================================
export const getDashboard = () => api.get('/admin/dashboard');

// ============================================================
// USER MANAGEMENT
// ============================================================
export const getUsers = (params = {}) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const toggleUserActivation = (id) => api.patch(`/admin/users/${id}/activate`);

// ============================================================
// SUPPLIER MANAGEMENT
// ============================================================
export const getSuppliers = (params = {}) => api.get('/admin/suppliers', { params });
export const updateSupplierStatus = (id, isActive) =>
  api.patch(`/admin/suppliers/${id}/status`, { isActive });

// ============================================================
// ORDERS
// ============================================================
export const getAdminOrders = (params = {}) => api.get('/admin/orders', { params });
export const getAdminOrderQuickStats = () => api.get('/admin/orders/quick-stats');
export const getAdminOrderStats = () => api.get('/admin/orders/stats');
export const getAdminOrderById = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const updateOrderPayment = (id, data) => api.patch(`/orders/${id}/payment`, data);
export const updateOrderDetails = (id, data) => api.put(`/admin/orders/${id}`, data);

// ============================================================
// PRODUCTS
// ============================================================
export const getAdminProducts = (params = {}) => api.get('/admin/products', { params });
export const getProductStats = () => api.get('/admin/products/stats');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const bulkUpdateProducts = (data) => api.put('/products/bulk', data);

// ============================================================
// CATEGORIES
// ============================================================
export const getAdminCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ============================================================
// ANALYTICS
// ============================================================
export const getRevenueAnalytics = (period = 'daily') =>
  api.get('/admin/analytics/revenue', { params: { period } });
export const getOrdersAnalytics = () => api.get('/admin/analytics/orders');
export const getUsersAnalytics = () => api.get('/admin/analytics/users');
export const getTopProducts = () => api.get('/admin/analytics/top-products');

// ============================================================
// SETTINGS
// ============================================================
export const getSettings = () => api.get('/admin/settings');
export const updateSettings = (data) => api.put('/admin/settings', data);

// ============================================================
// AI STATS
// ============================================================
export const getAIStats = () => api.get('/admin/ai/stats');
