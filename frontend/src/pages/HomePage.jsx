import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import Container from '../components/common/Container';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import IntelligentSearchBar from '../components/search/IntelligentSearchBar';
import ProductGrid from '../components/products/ProductGrid';
import { InlineLoader } from '../components/common/Spinner';
import aiSearchService from '../services/aiSearchService';
import {
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

/**
 * Home Page
 * Landing page with hero section and featured products
 */
export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const [popular, trending] = await Promise.all([
        aiSearchService.getPopularProducts(8),
        aiSearchService.getTrendingProducts(4)
      ]);
      
      if (popular.success) setPopularProducts(popular.data);
      if (trending.success) setTrendingProducts(trending.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Search',
      description: 'Search naturally in plain English. Our AI understands what you need.',
      color: 'text-primary-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Compatibility Check',
      description: 'Automatic verification that parts fit your vehicle perfectly.',
      color: 'text-success-500'
    },
    {
      icon: BoltIcon,
      title: 'Instant Results',
      description: 'Get accurate results in milliseconds with intelligent ranking.',
      color: 'text-warning-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '24/7 AI Support',
      description: 'Get instant answers from our intelligent chatbot anytime.',
      color: 'text-purple-500'
    }
  ];
  
  const brands = [
    'Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD'
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <Container className="relative py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
              <SparklesIcon className="w-4 h-4 inline mr-1" />
              AI-Powered Platform
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Find the Perfect Auto Parts
              <span className="block text-primary-200">with AI Intelligence</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-primary-100 mb-10">
              Search naturally for Chinese car parts. Our AI understands your needs and finds exactly what you're looking for.
            </p>
            
            {/* Hero Search Bar */}
            <IntelligentSearchBar variant="hero" />
            
            {/* Popular Searches */}
            <div className="mt-8">
              <p className="text-sm text-primary-200 mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['brake pads', 'oil filter', 'headlight', 'spark plugs'].map((term) => (
                  <Link
                    key={term}
                    to={`/search?q=${term}`}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors backdrop-blur-sm"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-dark-bg">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced AI technology meets quality auto parts for Chinese vehicles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <div className={clsx("w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary flex items-center justify-center", feature.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
      
      {/* Supported Brands */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Supported Brands
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We carry parts for all major Chinese automotive brands
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand}
                to={`/search?q=${brand}`}
                className="card card-hover text-center py-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {brand}
                </h3>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      
      {/* Trending Products */}
      {!loading && trendingProducts.length > 0 && (
        <section className="py-16 bg-white dark:bg-dark-bg">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Trending Now
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Hot products this month
                </p>
              </div>
              <Link to="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <ProductGrid
              products={trendingProducts}
              columns={4}
              onAddToCart={(product) => console.log('Add to cart:', product)}
            />
          </Container>
        </section>
      )}
      
      {/* Popular Products */}
      {!loading && popularProducts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Popular Products
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customer favorites
                </p>
              </div>
              <Link to="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <ProductGrid
              products={popularProducts}
              columns={4}
              onAddToCart={(product) => console.log('Add to cart:', product)}
            />
          </Container>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Find Your Parts?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Start searching with our intelligent AI assistant
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/search">
                <Button variant="secondary" size="lg" leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}>
                  Start Searching
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
