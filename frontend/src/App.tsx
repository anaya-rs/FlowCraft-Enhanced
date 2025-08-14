import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './components/Login'
import Homepage from './pages/Homepage'
import LearnMore from './pages/LearnMore'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import DocumentView from './pages/DocumentView'
import Models from './pages/Models'
import Configuration from './pages/Configuration'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import RouteLoading from './components/RouteLoading'

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <RouteLoading message="Initializing FlowCraft AI..." />
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentView />} />
        <Route path="/documents/:id/view" element={<DocumentView />} />
        <Route path="/models" element={<Models />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
