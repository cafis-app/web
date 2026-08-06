import axios from "axios"

import { getStoredToken } from "@/lib/token-storage"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  // An explicit per-call Authorization header (e.g. signing out a token
  // that hasn't been persisted yet) always wins over the stored one.
  if (!config.headers.Authorization) {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export class ApiError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "ApiError"
    this.code = code
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<{ message?: string; code?: string; error?: string }>(error)) {
    const data = error.response?.data
    return new ApiError(
      data?.message ?? data?.error ?? "Something went wrong. Please try again.",
      data?.code
    )
  }

  return new ApiError("Something went wrong. Please try again.")
}
