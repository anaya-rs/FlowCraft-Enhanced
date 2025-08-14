import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/v1'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_verified: boolean
  subscription_tier: string
  created_at: string
}

class AuthService {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = this.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle token refresh on 401 responses
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshed = await this.refreshToken()
            if (refreshed) {
              const newToken = this.getAccessToken()
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Login with credentials
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting login...')
      const response = await this.api.post('/auth/login', credentials)
      const authData = response.data
      console.log('AuthService: Login response received:', authData)

      // Store tokens
      console.log('AuthService: Storing tokens in localStorage...')
      localStorage.setItem('access_token', authData.access_token)
      localStorage.setItem('refresh_token', authData.refresh_token)
      localStorage.setItem('flowcraft_auth', 'true')
      
      console.log('AuthService: Tokens stored successfully')
      console.log('AuthService: access_token length:', authData.access_token?.length || 0)
      console.log('AuthService: refresh_token length:', authData.refresh_token?.length || 0)

      return authData
    } catch (error: any) {
      console.error('AuthService: Login failed:', error)
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  // Register new user
  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/register', userData)
      const authData = response.data

      // Store tokens
      localStorage.setItem('access_token', authData.access_token)
      localStorage.setItem('refresh_token', authData.refresh_token)
      localStorage.setItem('flowcraft_auth', 'true')

      return authData
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return false

      const response = await this.api.post('/auth/refresh', {
        refresh_token: refreshToken,
      })

      const { access_token, refresh_token: newRefreshToken } = response.data

      // Update stored tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', newRefreshToken)

      return true
    } catch (error) {
      return false
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await this.api.get('/auth/profile')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile')
    }
  }

  // Test if token is valid
  async testToken(): Promise<boolean> {
    try {
      console.log('Testing token validity...')
      const response = await this.api.post('/auth/test-token')
      console.log('Token test response:', response.data)
      return response.data.valid
    } catch (error) {
      console.error('Token test failed:', error)
      return false
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('flowcraft_auth')
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const isAuth = !!token
    console.log('AuthService: isAuthenticated called, result:', isAuth)
    return isAuth
  }

  // Get stored access token
  getAccessToken(): string | null {
    const token = localStorage.getItem('access_token')
    console.log('AuthService: getAccessToken called, token from localStorage:', token ? `Length: ${token.length}` : 'null')
    return token
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  // Get API instance with auth headers
  getAuthenticatedApi() {
    return this.api
  }
}

export const authService = new AuthService()
export default authService
