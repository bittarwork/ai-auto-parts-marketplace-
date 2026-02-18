import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import ProductGrid from '../components/products/ProductGrid';
import { InlineLoader } from '../components/common/Spinner';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

/**
 * Categories Page
 * Browse products by category with hierarchical display
 */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory();
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllCategories({ includeProducts: 'true' });
      if (response.success) {
        setCategories(response.data);
        // Auto-select first category if available
        // Auto-select first top-level category
        if (response.data.length > 0) {
          const first = response.data[0];
          if (!selectedCategory) {
            setSelectedCategory(first);
          }
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async () => {
    if (!selectedCategory) return;

    setProductsLoading(true);
    try {
      const response = await productService.getProductsByCategory(selectedCategory._id, {
        page: 1,
        limit: 24
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const renderCategoryCard = (category, depth = 0) => {
    const name = category.name?.en || category.name;
    const productCount = category.productCount ?? 0;

    return (
      <div key={category._id} className={depth > 0 ? 'ml-4 mt-2' : ''}>
        <button
          onClick={() => setSelectedCategory(category)}
          className={`w-full text-left p-4 rounded-lg transition-colors flex items-center justify-between ${
            selectedCategory?._id === category._id
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Squares2X2Icon className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({productCount})
            </span>
          </div>
        </button>
        {category.children?.length > 0 && (
          <div className="mt-1">
            {category.children.map((child) => renderCategoryCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading categories..." />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our products by category
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                All Categories
              </h2>
              <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                {categories.map((cat) => renderCategoryCard(cat))}
              </div>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCategory.name?.en || selectedCategory.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {pagination.total || products.length} products
                  </p>
                </div>

                {productsLoading ? (
                  <InlineLoader text="Loading products..." />
                ) : products.length > 0 ? (
                  <ProductGrid products={products} columns={3} />
                ) : (
                  <Card className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No products in this category yet
                    </p>
                    <Link to="/products" className="inline-block mt-4">
                      <span className="text-primary-600 dark:text-primary-400 hover:underline">
                        Browse all products
                      </span>
                    </Link>
                  </Card>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <Squares2X2Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Category
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a category from the left to view products
                </p>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
