import { apiClient, toApiError } from "@/lib/api-client"

export type UnregisteredCreditorApology = {
  apologyId: string
  content: string
  createdAt: string
  debt: {
    id: string
    status:
      | "pending"
      | "in_negotiation"
      | "partially_paid"
      | "settled"
      | "forgiven"
      | "rejected"
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
