import { useState, useEffect, createContext, useContext } from 'react'
import React from 'react'
import authService, { User, LoginCredentials } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simple, reliable authentication check with minimum loading time
  useEffect(() => {
    const checkAuth = async () => {
      const startTime = Date.now()
      const minLoadingTime = 800 // Minimum 800ms to prevent jarring flashes
      
      try {
        const token = localStorage.getItem('access_token')
        const hasAuth = localStorage.getItem('flowcraft_auth')
        
        if (token && hasAuth === 'true') {
          setIsAuthenticated(true)
          setUser({
            id: '1',
            email: 'admin@flowcraft.ai',
            first_name: 'Admin',
            last_name: 'User',
            is_active: true,
            is_verified: true,
            subscription_tier: 'pro',
            created_at: new Date().toISOString()
          })
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        // Ensure minimum loading time to prevent jarring white screens
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, minLoadingTime - elapsed)
        
        setTimeout(() => {
          setIsLoading(false)
        }, remaining)
      }
    }

    // Check immediately
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const authData = await authService.login({ email, password })
      
      setIsAuthenticated(true)
      setUser({
        id: '1',
        email: email,
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        is_verified: true,
        subscription_tier: 'pro',
        created_at: new Date().toISOString()
      })
      
    } catch (error: any) {
      console.error('Login: Login failed:', error)
      throw error
    }
  }

  const register = async (userData: { email: string; password: string; first_name: string; last_name: string }) => {
    try {
      await authService.register(userData)
      setIsAuthenticated(true)
      setUser({
        id: '1',
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_active: true,
        is_verified: true,
        subscription_tier: 'pro',
        created_at: new Date().toISOString()
      })
    } catch (error: any) {
      throw error
    }
  }

  const logout = () => {
    try {
      authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      // Don't redirect - let the App component handle navigation
    } catch (error) {
      console.error('Logout error:', error)
      // Don't force redirect - let the App component handle navigation
    }
  }

  const clearAuth = () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('flowcraft_auth')
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Clear auth error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    clearAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
