import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';

const Home           = lazy(() => import('./pages/Home/Home'));
const Shop           = lazy(() => import('./pages/Shop/Shop'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const FarmerProfile  = lazy(() => import('./pages/FarmerProfile/FarmerProfile'));
const Cart           = lazy(() => import('./pages/Cart/Cart'));
const AIChat         = lazy(() => import('./pages/AIChat/AIChat'));
const About          = lazy(() => import('./pages/About/About'));
const Contact        = lazy(() => import('./pages/Contact/Contact'));
const Login          = lazy(() => import('./pages/Login/Login'));
const Register       = lazy(() => import('./pages/Register/Register'));
const MyProducts     = lazy(() => import('./pages/MyProducts/MyProducts'));
const AdminDashboard    = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminProducts     = lazy(() => import('./pages/Admin/Products/AdminProducts'));
const AdminOrders       = lazy(() => import('./pages/Admin/Orders/AdminOrders'));
const AdminFarmers      = lazy(() => import('./pages/Admin/Farmers/AdminFarmers'));
const AdminUsers        = lazy(() => import('./pages/Admin/Users/AdminUsers'));
const AdminMarketPrices = lazy(() => import('./pages/Admin/MarketPrices/AdminMarketPrices'));
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword     = lazy(() => import('./pages/ResetPassword/ResetPassword'));

const Loader = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
    <div style={{ width:48, height:48, border:'4px solid #E8F5E9', borderTopColor:'#2E7D32', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

function SellerRoute({ children }) {
  const { isAuthenticated, isAdmin, isFarmer, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/my-products' }} replace />;
  if (!isAdmin() && !isFarmer()) return <Navigate to="/" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to={isAdmin() ? '/admin' : '/'} replace />;
  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Auth pages — redirect if already logged in */}
          <Route path="/login"           element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register"        element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/reset-password"  element={<AuthRoute><ResetPassword /></AuthRoute>} />

          {/* Protected: Product management — Admin + Farmer */}
          <Route path="/my-products" element={<SellerRoute><MainLayout><MyProducts /></MainLayout></SellerRoute>} />

          {/* Protected: Admin panel */}
          <Route path="/admin"               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products"      element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders"        element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/farmers"       element={<AdminRoute><AdminFarmers /></AdminRoute>} />
          <Route path="/admin/users"         element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/market-prices" element={<AdminRoute><AdminMarketPrices /></AdminRoute>} />

          {/* Protected: Cart and AI Assistant */}
          <Route path="/cart"         element={<ProtectedRoute><MainLayout><Cart /></MainLayout></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><MainLayout><AIChat /></MainLayout></ProtectedRoute>} />

          {/* Protected: Shop, Products, Farmers, About, Contact */}
          <Route path="/shop"         element={<ProtectedRoute><MainLayout><Shop /></MainLayout></ProtectedRoute>} />
          <Route path="/shop/:id"     element={<ProtectedRoute><MainLayout><ProductDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/farmers/:id"  element={<ProtectedRoute><MainLayout><FarmerProfile /></MainLayout></ProtectedRoute>} />
          <Route path="/about"        element={<ProtectedRoute><MainLayout><About /></MainLayout></ProtectedRoute>} />
          <Route path="/contact"      element={<ProtectedRoute><MainLayout><Contact /></MainLayout></ProtectedRoute>} />

          {/* Public: Only Home page */}
          <Route path="/"             element={<MainLayout><Home /></MainLayout>} />
          <Route path="*"             element={<MainLayout><Home /></MainLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
