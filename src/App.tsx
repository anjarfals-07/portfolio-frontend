import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/admin/Dashboard'
import ManageProjects from '@/pages/admin/ManageProjects'
import ManageProfile from '@/pages/admin/ManageProfile'
import ManageSkills from '@/pages/admin/ManageSkills'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/projects" element={<ManageProjects />} />
            <Route path="/admin/profile" element={<ManageProfile />} />
            <Route path="/admin/skills" element={<ManageSkills />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App