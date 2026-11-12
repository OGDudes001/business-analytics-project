import "@/styles/global.css";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "@/components/common/ToastProvider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MainLayout from "@/components/common/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthProvider, ProtectedRoute, PublicOnlyRoute } from "@/context/AuthContext";

// User Pages
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import HomePage from "@/pages/dashboard/Home";
import ProfilePage from "@/pages/profile/Profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBanned from "@/pages/admin/AdminBanned";

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes (Accessible only when logged out) */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<MainLayout isLoggedIn={false} />}>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          <Route element={<MainLayout isLoggedIn={false} />}>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* User Protected Routes (Requires login as standard user) */}
          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route element={<MainLayout isLoggedIn={true} />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes (Requires login as admin) */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="banned" element={<AdminBanned />} />
            </Route>
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ToastProvider>
);