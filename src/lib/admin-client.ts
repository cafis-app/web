import { apiClient, toApiError } from "@/lib/api-client"

// The app supports two currencies: USD and SLSH (Somali shillings). A user
// has up to one wallet per currency, so wallet-shaped API responses are
// keyed by currency rather than a single object.
export type CurrencyCode = "USD" | "SLSH"

export type WalletBalance = {
  availableBalance: number
  escrowedBalance: number
  currency: string
}

export type WalletBalances = Record<CurrencyCode, WalletBalance | null>

export type DebtStatus =
  | "pending"
  | "in_negotiation"
  | "partially_paid"
  | "awaiting_payout"
  | "settled"
  | "forgiven"
  | "rejected"
  | "cancelled"

export type UnregisteredCreditorApology = {
  apologyId: string
  content: string
  createdAt: string
  debt: {
    id: string
    status: DebtStatus
    originalAmount: number
    currentBalance: number
    currency: string
    dueDate: string | null
  }
  sender: {
    id: string
    name: string
    email: string
    phoneNumber: string | null
  } | null
  creditor: {
    name: string | null
    phoneNumber: string | null
    email: string | null
    city: string | null
  }
}

export async function forgiveDebt(id: string) {
  try {
    const { data } = await apiClient.post<{
      id: string
      status: DebtStatus
      currentBalance: number
    }>(`/api/admin/debts/${id}/forgive`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function rejectDebt(id: string) {
  try {
    const { data } = await apiClient.post<{
      id: string
      status: DebtStatus
      currentBalance: number
    }>(`/api/admin/debts/${id}/reject`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getUnregisteredCreditorApologies(status?: string) {
  try {
    const { data } = await apiClient.get<{
      apologies: UnregisteredCreditorApology[]
    }>("/api/admin/apologies/unregistered-creditors", {
      params: status ? { status } : undefined,
    })
    return data.apologies
  } catch (error) {
    throw toApiError(error)
  }
}

export type AdminStats = {
  totalUsers: number
  pendingDebts: number
  unregisteredCreditorApologies: number
  pendingTransfers: number
}

export async function getAdminStats() {
  try {
    const { data } = await apiClient.get<AdminStats>("/api/admin/stats")
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export type PendingTransfer = {
  id: string
  recipientPhoneNumber: string
  amount: number
  currency: string
  note: string
  status: "pending" | "claimed" | "expired" | "cancelled"
  expiresAt: string
  createdAt: string
  claimedAt: string | null
  sender: {
    id: string
    name: string
    email: string
    phoneNumber: string | null
  } | null
  claimedBy: { id: string; name: string; email: string } | null
}

export async function getPendingTransfers(status?: string) {
  try {
    const { data } = await apiClient.get<{ transfers: PendingTransfer[] }>(
      "/api/admin/transfers",
      { params: status ? { status } : undefined }
    )
    return data.transfers
  } catch (error) {
    throw toApiError(error)
  }
}

export async function cancelPendingTransfer(id: string) {
  try {
    const { data } = await apiClient.post<{
      id: string
      status: PendingTransfer["status"]
      amount: number
      currency: string
    }>(`/api/admin/transfers/${id}/cancel`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export type UserSummary = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  city: string | null
  role: string
  createdAt: string
  wallets: WalletBalances
}

export async function getUsers() {
  try {
    const { data } = await apiClient.get<{ users: UserSummary[] }>(
      "/api/admin/users"
    )
    return data.users
  } catch (error) {
    throw toApiError(error)
  }
}

export type UserDetailDebt = {
  id: string
  role: "debtor" | "creditor"
  counterpartyName: string
  status: DebtStatus
  originalAmount: number
  currentBalance: number
  currency: string
  dueDate: string | null
  createdAt: string
}

export type UserDetailApology = {
  id: string
  direction: "sent" | "received"
  counterpartyName: string
  content: string
  createdAt: string
}

export type UserDetailTransfer = {
  id: string
  recipientPhoneNumber: string
  amount: number
  currency: string
  status: "pending" | "claimed" | "expired" | "cancelled"
  expiresAt: string
  createdAt: string
}

export type UserWalletTransaction = {
  id: string
  amount: number
  currency: string
  type: string
  status: string
  createdAt: string
}

export type UserDetail = {
  user: {
    id: string
    name: string
    email: string
    phoneNumber: string | null
    city: string | null
    role: string
    emailVerified: boolean
    createdAt: string
  }
  wallets: Record<CurrencyCode, (WalletBalance & { balance: number }) | null>
  walletTransactions: UserWalletTransaction[]
  debts: UserDetailDebt[]
  apologies: UserDetailApology[]
  transfersSent: UserDetailTransfer[]
}

export async function getUserDetail(id: string) {
  try {
    const { data } = await apiClient.get<UserDetail>(`/api/admin/users/${id}`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

// Sifalo can only collect money, not disburse it — a creditor's
// apology-acceptance payout or a wallet withdrawal has to be sent manually
// by an admin, then marked resolved here.
export type PayoutRequest = {
  id: string
  sourceType: "apology_acceptance" | "wallet_withdraw"
  debtId: string | null
  recipientPhoneNumber: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  resolutionNote: string | null
  createdAt: string
  resolvedAt: string | null
  recipient: {
    id: string
    name: string
    email: string
    phoneNumber: string | null
  } | null
}

export async function getPayoutRequests(status?: string) {
  try {
    const { data } = await apiClient.get<{ payoutRequests: PayoutRequest[] }>(
      "/api/admin/payout-requests",
      { params: status ? { status } : undefined }
    )
    return data.payoutRequests
  } catch (error) {
    throw toApiError(error)
  }
}

export async function resolvePayoutRequest(
  id: string,
  outcome: "completed" | "failed",
  resolutionNote?: string
) {
  try {
    const { data } = await apiClient.patch<{
      id: string
      status: PayoutRequest["status"]
      amount: number
      currency: string
      resolutionNote: string | null
    }>(`/api/admin/payout-requests/${id}/resolve`, {
      outcome,
      resolutionNote,
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

// A "603 pending" Sifalo deposit with no documented way to find out how it
// resolves — this lists them so an admin can check the Sifalo portal and
// mark the outcome manually.
export type GatewayTransaction = {
  id: string
  gateway: "waafi" | "edahab" | "pbwallet"
  account: string
  orderId: string
  sid: string | null
  requestedAmount: number
  requestedCurrency: string
  chargedAmount: number
  chargedCurrency: string
  status: "processing" | "succeeded" | "pending" | "failed"
  responseCode: string | null
  responseMessage: string | null
  createdAt: string
}

export async function getGatewayTransactions(status?: string) {
  try {
    const { data } = await apiClient.get<{
      gatewayTransactions: GatewayTransaction[]
    }>("/api/admin/gateway-transactions", {
      params: status ? { status } : undefined,
    })
    return data.gatewayTransactions
  } catch (error) {
    throw toApiError(error)
  }
}

export async function resolveGatewayTransaction(
  id: string,
  outcome: "succeeded" | "failed"
) {
  try {
    const { data } = await apiClient.patch<{
      id: string
      status: GatewayTransaction["status"]
      requestedAmount: number
    }>(`/api/admin/gateway-transactions/${id}/resolve`, { outcome })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
