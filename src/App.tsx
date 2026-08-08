import { Route, Routes } from "react-router-dom"

import { AdminLayout } from "@/components/admin-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { ApologyOutreach } from "@/pages/ApologyOutreach"
import { Dashboard } from "@/pages/Dashboard"
import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Transfers } from "@/pages/Transfers"
import { UserDetail } from "@/pages/UserDetail"
import { Users } from "@/pages/Users"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/apology-outreach"
            element={<ApologyOutreach />}
          />
          <Route path="/dashboard/transfers" element={<Transfers />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/users/:id" element={<UserDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
