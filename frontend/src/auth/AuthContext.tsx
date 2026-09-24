import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, authApi, type AuthUser } from './api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  loginError: string | null
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    authApi
      .me()
      .then((res) => {
        if (!cancelled) setUser(res.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (phone: string, password: string) => {
    setLoginError(null)
    try {
      const res = await authApi.login(phone, password)
      setUser(res.user)
      return true
    } catch (err) {
      setUser(null)
      setLoginError(
        err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.',
      )
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Backend is the security boundary; clear local state regardless.
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
