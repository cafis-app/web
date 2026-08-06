import { Route, Routes } from "react-router-dom"

import { AdminLayout } from "@/components/admin-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { ApologyOutreach } from "@/pages/ApologyOutreach"
import { Dashboard } from "@/pages/Dashboard"
import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"

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
        </Route>
      </Route>
    </Routes>
  )
}

export default App
