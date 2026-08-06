import { apiClient, ApiError, toApiError } from "@/lib/api-client"

export type AuthUser = {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  city?: string
  phoneNumber?: string
  role?: string
}

type SignInResponse = {
  token: string
  user: AuthUser
}

type SessionResponse = {
  session: { id: string; expiresAt: string }
  user: AuthUser
} | null

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data } = await apiClient.post<SignInResponse>(
      "/api/auth/sign-in/email",
      { email, password }
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getSession(token: string) {
  try {
    const { data } = await apiClient.get<SessionResponse>(
      "/api/auth/get-session",
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function signOut(token: string) {
  try {
    const { data } = await apiClient.post<{ status: boolean }>(
      "/api/auth/sign-out",
      null,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export { ApiError as AuthApiError }
