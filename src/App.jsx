import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/pages/LandingPage';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Lazy load non-critical pages for faster initial load
const Checkout = lazy(() => import('./components/pages/Checkout'));
const ThankYou = lazy(() => import('./components/pages/ThankYou'));
const Login = lazy(() => import('./components/pages/Login'));
const ForgotPassword = lazy(() => import('./components/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/pages/ResetPassword'));
const Course = lazy(() => import('./components/pages/Course'));
const Lesson = lazy(() => import('./components/pages/Lesson'));
const Resources = lazy(() => import('./components/pages/Resources'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Admin imports - lazy loaded
const AdminLogin = lazy(() => import('./components/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));
const MembersPage = lazy(() => import('./components/pages/admin/MembersPage'));
const AnalyticsPage = lazy(() => import('./components/pages/admin/AnalyticsPage'));
const CouponsPage = lazy(() => import('./components/pages/admin/CouponsPage'));
const ModuleEditor = lazy(() => import('./components/pages/admin/ModuleEditor'));
const LessonEditor = lazy(() => import('./components/pages/admin/LessonEditor'));
const ProtectedAdminRoute = lazy(() => import('./components/auth/ProtectedAdminRoute'));

// Chatbot widget - lazy loaded on every page (separate bundle)
const ChatWidget = lazy(() => import('./components/chatbot/ChatWidget'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0D0D12] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes - Landing page not lazy loaded for speed */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected course routes */}
            <Route
              path="/course"
              element={
                <ProtectedRoute>
                  <Course />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:moduleId/:lessonId"
              element={
                <ProtectedRoute>
                  <Lesson />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedAdminRoute>
                  <MembersPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedAdminRoute>
                  <AnalyticsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedAdminRoute>
                  <CouponsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/modules/:id"
              element={
                <ProtectedAdminRoute>
                  <ModuleEditor />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/lessons/:id"
              element={
                <ProtectedAdminRoute>
                  <LessonEditor />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </Suspense>

        {/* Floating chatbot (available on every page) */}
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <Toaster position="top-center" />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
