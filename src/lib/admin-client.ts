import { apiClient, toApiError } from "@/lib/api-client"

export type DebtStatus =
  | "pending"
  | "in_negotiation"
  | "partially_paid"
  | "settled"
  | "forgiven"
  | "rejected"

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

export type UserSummary = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  city: string | null
  role: string
  createdAt: string
  wallet: {
    availableBalance: number
    escrowedBalance: number
    currency: string
  } | null
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
  wallet: {
    availableBalance: number
    escrowedBalance: number
    balance: number
    currency: string
  } | null
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
