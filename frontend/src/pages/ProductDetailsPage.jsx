import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Container from '../components/common/Container';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { InlineLoader } from '../components/common/Spinner';
import ProductGrid from '../components/products/ProductGrid';
import productService from '../services/productService';
import aiSearchService from '../services/aiSearchService';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  BellAlertIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

/**
 * Product Details Page
 * Full product view with API integration
 */
export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { toggleWishlist, isInWishlist, wishlistIds } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySubscribed, setNotifySubscribed] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, similarRes] = await Promise.all([
        productService.getProductById(id),
        aiSearchService.getSimilarProducts(id, 6)
      ]);

      if (productRes.success && productRes.data) {
        setProduct(productRes.data);
      } else {
        setError('Product not found');
      }

      if (similarRes.success && similarRes.data) {
        setSimilarProducts(similarRes.data);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const result = await addToCart(id, quantity);
    if (!result.success) {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    const result = await addToCart(id, quantity);
    if (result.success) {
      navigate('/cart');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading product details..." />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <Card className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Product not found'}
            </h2>
            <Link to="/products">
              <Button variant="primary" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
                Back to Products
              </Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const displayProduct = product;
  const isInStock = (displayProduct.stock || 0) > 0;
  const images = displayProduct.images || [];
  const primaryImageUrl = getProductImageUrl(displayProduct);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayProduct.currency || 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Products</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-white font-medium truncate">{displayProduct.name?.en}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <Card className="mb-4">
              <div className="aspect-square bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]?.url || primaryImageUrl}
                  alt={displayProduct.name?.en}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={clsx(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === index
                        ? "border-primary-500"
                        : "border-transparent hover:border-gray-300 dark:hover:border-dark-border"
                    )}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {displayProduct.isFeatured && (
                    <Badge variant="warning" className="mb-2">Featured</Badge>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {displayProduct.name?.en}
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (!localStorage.getItem('token')) {
                      navigate('/login', { state: { from: `/products/${id}`, message: 'Login to add to wishlist' } });
                      return;
                    }
                    toggleWishlist(displayProduct);
                  }}
                  className="p-2 text-gray-400 hover:text-error-500 transition-colors"
                  title={isInWishlist(displayProduct._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isInWishlist(displayProduct._id) ? (
                    <HeartFilledIcon className="w-6 h-6 text-error-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                Part No: {displayProduct.partNumber}
              </p>

              {/* Rating */}
              {(displayProduct.averageRating > 0 || displayProduct.totalReviews > 0) && (
                <div className="flex items-center space-x-2 mt-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={clsx(
                          "w-5 h-5",
                          i < Math.floor(displayProduct.averageRating)
                            ? "text-warning-500 fill-warning-500"
                            : "text-gray-300 dark:text-gray-600"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {displayProduct.averageRating} ({displayProduct.totalReviews || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="py-4 border-y border-gray-200 dark:border-dark-border">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(displayProduct.price)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">+ VAT</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {isInStock ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="text-success-600 dark:text-success-400 font-medium">
                    In Stock ({displayProduct.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-error-500" />
                  <span className="text-error-600 dark:text-error-400 font-medium">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="label">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center input py-2"
                  min="1"
                  max={displayProduct.stock || 1}
                />
                <button
                  onClick={() => setQuantity(Math.min(displayProduct.stock || 1, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                  disabled={quantity >= (displayProduct.stock || 0)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart / Notify Me */}
            <div className="space-y-3">
              {isInStock ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={cartLoading}
                    loading={cartLoading}
                    onClick={handleAddToCart}
                    leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    disabled={cartLoading}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={notifySubscribed}
                  loading={notifyLoading}
                  onClick={async () => {
                    if (!localStorage.getItem('token')) {
                      navigate('/login', { state: { from: `/products/${id}`, message: 'Login to get notified when this product is back in stock' } });
                      return;
                    }
                    setNotifyLoading(true);
                    try {
                      const res = await productService.subscribeNotifyMe(id);
                      if (res.success) {
                        setNotifySubscribed(true);
                        toast.success(res.message);
                      }
                    } catch (err) {
                      toast.error(err?.message || 'Failed to subscribe');
                    } finally {
                      setNotifyLoading(false);
                    }
                  }}
                  leftIcon={<BellAlertIcon className="w-5 h-5" />}
                >
                  {notifySubscribed ? "You'll be notified when in stock" : 'Notify Me When In Stock'}
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <TruckIcon className="w-5 h-5" />
                <span>Free Shipping over €500</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheckIcon className="w-5 h-5" />
                <span>{displayProduct.warranty?.months || 0} Month Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-12">
          <Card>
            <CardHeader title="Product Details" />
            <CardBody>
              <div className="prose dark:prose-invert max-w-none">
                {displayProduct.description?.en && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {displayProduct.description.en}
                  </p>
                )}

                {/* Specifications */}
                {displayProduct.specifications?.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Specifications</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayProduct.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-dark-border">
                          <dt className="text-gray-600 dark:text-gray-400">{spec.key?.en || spec.key}</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">{spec.value?.en || spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                {/* Compatibility */}
                {displayProduct.compatibility?.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Compatibility</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayProduct.compatibility.map((compat, index) => (
                        <Badge key={index} variant="primary">
                          {compat.brand} {compat.model} ({compat.yearFrom}-{compat.yearTo})
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                {!displayProduct.description?.en && !displayProduct.specifications?.length && !displayProduct.compatibility?.length && (
                  <p className="text-gray-500 dark:text-gray-400 italic">No additional details available.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Products
            </h2>
            <ProductGrid
              products={similarProducts}
              columns={4}
              onToggleWishlist={toggleWishlist}
              wishlistIds={wishlistIds}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
