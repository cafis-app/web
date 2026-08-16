import { Route, Routes } from "react-router-dom"

import { AdminLayout } from "@/components/admin-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { ApologyOutreach } from "@/pages/ApologyOutreach"
import { Dashboard } from "@/pages/Dashboard"
import { Debts } from "@/pages/Debts"
import { GatewayTransactions } from "@/pages/GatewayTransactions"
import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { PayoutRequests } from "@/pages/PayoutRequests"
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
          <Route path="/dashboard/debts" element={<Debts />} />
          <Route
            path="/dashboard/payout-requests"
            element={<PayoutRequests />}
          />
          <Route
            path="/dashboard/gateway-transactions"
            element={<GatewayTransactions />}
          />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/users/:id" element={<UserDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
