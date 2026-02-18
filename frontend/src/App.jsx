import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Layout from './components/layout/Layout';
import ChatWidget from './components/chatbot/ChatWidget';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AllProductsPage from './pages/AllProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import VehiclesPage from './pages/VehiclesPage';
import NotFoundPage from './pages/NotFoundPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutUsPage from './pages/AboutUsPage';
import CustomerServicePage from './pages/CustomerServicePage';
import FAQPage from './pages/FAQPage';
import SupportPage from './pages/SupportPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import LegalPage from './pages/LegalPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import './i18n/i18n';

function App() {
  // Always set LTR for English
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);
  
  return (
    <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <CartProvider>
      <WishlistProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Layout>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Placeholder routes - to be implemented */}
          <Route path="/products" element={<AllProductsPage />} />
          
          <Route path="/categories" element={<CategoriesPage />} />
          
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
          
          <Route path="/about" element={<AboutUsPage />} />
          
          {/* Customer Service & Legal */}
          <Route path="/customer-service" element={<CustomerServicePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/shipping" element={<ShippingPolicyPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Floating Chat Widget - Always visible */}
        <ChatWidget />
      </Layout>
      </Router>
      </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
