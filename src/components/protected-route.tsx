import { Navigate, Outlet, useLocation } from "react-router-dom"

import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
