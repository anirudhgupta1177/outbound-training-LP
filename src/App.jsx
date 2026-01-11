import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import Checkout from './components/pages/Checkout';
import ThankYou from './components/pages/ThankYou';
import Login from './components/pages/Login';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import Course from './components/pages/Course';
import Lesson from './components/pages/Lesson';
import Resources from './components/pages/Resources';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Admin imports
import AdminLogin from './components/pages/admin/AdminLogin';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import ModuleEditor from './components/pages/admin/ModuleEditor';
import LessonEditor from './components/pages/admin/LessonEditor';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Routes>
          {/* Public routes */}
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
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
