// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'

// ===== LAYOUTS =====
import UserLayout from '@/layouts/UserLayout'
import OwnerLayout from '@/layouts/OwnerLayout'
import AdminLayout from '@/layouts/AdminLayout'

// ===== CONTEXT =====
import { UserThemeProvider } from '@/context/UserThemeContext'
import { PlatformInfoProvider } from '@/context/PlatformInfoContext'
import { useAuth } from '@/context/AuthContext'

// ===== PUBLIC =====
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Blog from '@/pages/Blog'
import BlogDetail from '@/pages/BlogDetail'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import PendingApproval from '@/pages/PendingApproval'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Landing from '@/pages/Landing'
import NotFound from '@/pages/NotFound'

// ===== PAYMENT =====
import Payment from '@/pages/Payment'
import PendingVerification from '@/pages/PendingVerification'
import PaymentRejected from '@/pages/PaymentRejected'

// ===== OWNER =====
import OwnerDashboard from '@/pages/owner/Dashboard'
import ManageProjects from '@/pages/owner/ManageProjects'
import ManageBlog from '@/pages/owner/ManageBlog'
import ManageProfile from '@/pages/owner/ManageProfile'
import ManageTheme from '@/pages/owner/ManageTheme'
import ManageSkills from '@/pages/owner/ManageSkills'
import ManageExperiences from '@/pages/owner/ManageExperiences'
import ManageTechStack from '@/pages/owner/ManageTechStack'
import Inbox from '@/pages/owner/Inbox'
import ManageCustomDomain from '@/pages/owner/ManageCustomDomain'

// ===== ADMIN =====
import AdminDashboard from '@/pages/admin/Dashboard'
import ManageUsers from '@/pages/admin/ManageUsers'
import AddUser from '@/pages/admin/AddUser'
import UserDetail from '@/pages/admin/UserDetail'
import AdminSettings from '@/pages/admin/Settings'
import PaymentMethods from '@/pages/admin/PaymentMethods'
import Payments from '@/pages/admin/Payments'

// ===== SHARED =====
import ProtectedRoute from '@/components/ProtectedRoute'
import TenantGuard from '@/components/TenantGuard'
import { isReservedUsername } from '@/constants/reservedUsernames'
import { useTenant } from '@/hooks/useTenant'

// ============================================================
// ⭐ DASHBOARD REDIRECT — sesuai role user
// ============================================================
function DashboardRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />
  }

  if (user.role === 'OWNER') {
    return <Navigate to="/owner" replace />
  }

  const slug = user.portfolioSlug || user.username
  return <Navigate to={`/${slug}`} replace />
}

// ============================================================
// WRAPPER — UserThemeProvider + TenantGuard
// ============================================================
function ThemedUserLayout() {
  const { username } = useParams<{ username: string }>()

  // ⭐ Guard berlapis
  if (!username || username.trim() === '' || isReservedUsername(username)) {
    return <NotFound />
  }

  return (
    <UserThemeProvider>
      <TenantGuard>
        <UserLayout />
      </TenantGuard>
    </UserThemeProvider>
  )
}

// ============================================================
// CUSTOM DOMAIN WRAPPER
// ============================================================
function CustomDomainLayout({ username }: { username: string }) {
  return (
    <UserThemeProvider usernameOverride={username}>
      <TenantGuard>
        <UserLayout />
      </TenantGuard>
    </UserThemeProvider>
  )
}

// ============================================================
// CUSTOM DOMAIN ROUTES
// ============================================================
function CustomDomainRoutes({ username }: { username: string }) {
  return (
    <Routes>
      <Route path="/" element={<CustomDomainLayout username={username} />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// ============================================================
// ROUTES
// ============================================================
function AppRoutes() {
  const { tenant, loading, isCustomDomain: isCustom } = useTenant()

  // ⭐ Kalau custom domain → render custom routes
  if (isCustom) {
    if (loading) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
        </div>
      )
    }

    if (!tenant) {
      return <NotFound />
    }

    return <CustomDomainRoutes username={tenant} />
  }

  // ⭐ Normal routing (URL param-based)
  return (
    <Routes>
      {/* ROOT — 404 netral */}
      <Route path="/" element={<NotFound />} />

      {/* ⭐ DASHBOARD — redirect sesuai role */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Payment flow */}
      <Route path="/payment/:referenceId" element={<Payment />} />
      <Route path="/pending-verification" element={<PendingVerification />} />
      <Route path="/payment-rejected" element={<PaymentRejected />} />

      {/* Explore — landing platform */}
      <Route path="/explore" element={<Landing />} />

      {/* ============================================================
          OWNER DASHBOARD — OWNER + SUPER_ADMIN
          ============================================================ */}
      <Route element={<ProtectedRoute requiredRole="OWNER" />}>
        <Route
          path="/owner"
          element={
            <UserThemeProvider>
              <OwnerLayout />
            </UserThemeProvider>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="profile" element={<ManageProfile />} />
          <Route path="theme" element={<ManageTheme />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="experiences" element={<ManageExperiences />} />
          <Route path="tech-stack" element={<ManageTechStack />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="custom-domain" element={<ManageCustomDomain />} />
        </Route>
      </Route>

      {/* ============================================================
          SUPER ADMIN — SUPER_ADMIN only
          ============================================================ */}
      <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN" />}>
        <Route
          path="/admin"
          element={
            <UserThemeProvider>
              <AdminLayout />
            </UserThemeProvider>
          }
        >
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* Workspace — SAMA seperti owner */}
          <Route path="projects" element={<ManageProjects />} />
          <Route path="blog" element={<ManageBlog />} />

          {/* Management (admin only) */}
          <Route path="users" element={<ManageUsers />} />
          <Route path="users/new" element={<AddUser />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payment-methods" element={<PaymentMethods />} />

          {/* Portfolio Saya (admin juga punya portfolio) */}
          <Route path="profile" element={<ManageProfile />} />
          <Route path="theme" element={<ManageTheme />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="experiences" element={<ManageExperiences />} />
          <Route path="tech-stack" element={<ManageTechStack />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="custom-domain" element={<ManageCustomDomain />} />

          {/* System */}
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* ============================================================
          TENANT ROUTE — PALING BAWAH
          ============================================================ */}
      <Route path="/:username" element={<ThemedUserLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        {/* ⭐ Redirect ke /owner, bukan /dashboard */}
        <Route path="dashboard" element={<Navigate to="/owner" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <ErrorBoundary>
      <PlatformInfoProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PlatformInfoProvider>
    </ErrorBoundary>
  )
}

export default App