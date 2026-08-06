/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  AuthApiError,
  getSession,
  signInWithEmail,
  signOut as signOutRequest,
  type AuthUser,
} from "@/lib/auth-client"
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/token-storage"

const NOT_ADMIN_MESSAGE = "This account does not have admin access."

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    getSession(token)
      .then((session) => {
        if (!session) {
          clearStoredToken()
          return
        }
        if (session.user.role !== "admin") {
          // Role may have been revoked, or a non-admin token ended up here.
          clearStoredToken()
          void signOutRequest(token).catch(() => {})
          return
        }
        setUser(session.user)
      })
      .catch(() => {
        clearStoredToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const { token, user } = await signInWithEmail(email, password)

    if (user.role !== "admin") {
      try {
        await signOutRequest(token)
      } catch {
        // Credentials were valid but the role check failed; nothing to roll back.
      }
      throw new AuthApiError(NOT_ADMIN_MESSAGE, "NOT_ADMIN")
    }

    setStoredToken(token)
    setUser(user)
  }, [])

  const logout = React.useCallback(async () => {
    const token = getStoredToken()
    clearStoredToken()
    setUser(null)

    if (token) {
      try {
        await signOutRequest(token)
      } catch {
        // Local session is already cleared; nothing else to roll back.
      }
    }
  }, [])

  const value = React.useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export { AuthApiError }
