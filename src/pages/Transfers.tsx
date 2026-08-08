import * as React from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Clock,
  Copy,
  Search,
  Send,
  Wallet,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api-client"
import {
  getPendingTransfers,
  type PendingTransfer,
} from "@/lib/admin-client"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "claimed", label: "Claimed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  claimed: "default",
  expired: "destructive",
  cancelled: "outline",
}

const DAY_MS = 24 * 60 * 60 * 1000

type SortKey = "sender" | "amount" | "expiresAt" | "createdAt"
type Sort = { key: SortKey; direction: "asc" | "desc" }

function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getInitials(name: string | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function msRemaining(transfer: PendingTransfer) {
  return new Date(transfer.expiresAt).getTime() - Date.now()
}

function ExpiryCell({ transfer }: { transfer: PendingTransfer }) {
  const formatted = formatDateTime(transfer.expiresAt)

  if (transfer.status !== "pending") {
    return <span className="text-muted-foreground">{formatted}</span>
  }

  const remaining = msRemaining(transfer)

  if (remaining <= 0) {
    return (
      <div className="flex flex-col gap-1">
        <span>{formatted}</span>
        <Badge variant="destructive" className="w-fit">
          Past due
        </Badge>
      </div>
    )
  }

  if (remaining < DAY_MS) {
    return (
      <div className="flex flex-col gap-1">
        <span>{formatted}</span>
        <Badge variant="outline" className="w-fit gap-1 text-amber-700 dark:text-amber-400">
          <Clock className="size-3" />
          Expires soon
        </Badge>
      </div>
    )
  }

  return <span>{formatted}</span>
}

function CopyPhoneButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      aria-label="Copy phone number"
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? (
        <Check className="size-3.5 text-green-600 dark:text-green-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  )
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string
  sortKey: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
}) {
  const isActive = sort.key === sortKey

  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1 transition-colors hover:text-foreground",
          isActive && "text-foreground"
        )}
      >
        {label}
        {isActive ? (
          sort.direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-30" />
        )}
      </button>
    </TableHead>
  )
}

export function Transfers() {
  const [transfers, setTransfers] = React.useState<PendingTransfer[] | null>(
    null
  )
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [status, setStatus] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<Sort>({
    key: "expiresAt",
    direction: "asc",
  })

  React.useEffect(() => {
    let cancelled = false

    getPendingTransfers()
      .then((data) => {
        if (!cancelled) setTransfers(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = React.useMemo(() => {
    if (!transfers) return null

    const pending = transfers.filter((t) => t.status === "pending")
    const pendingValue = pending.reduce((sum, t) => sum + t.amount, 0)
    const expiringSoon = pending.filter((t) => {
      const remaining = msRemaining(t)
      return remaining > 0 && remaining < DAY_MS
    }).length
    const pastDue = pending.filter((t) => msRemaining(t) <= 0).length

    return {
      total: transfers.length,
      pendingCount: pending.length,
      pendingValue,
      expiringSoon,
      pastDue,
    }
  }, [transfers])

  const visibleTransfers = React.useMemo(() => {
    if (!transfers) return null

    const query = search.trim().toLowerCase()
    const filtered = transfers.filter((transfer) => {
      if (status && transfer.status !== status) return false
      if (!query) return true

      return (
        transfer.recipientPhoneNumber.toLowerCase().includes(query) ||
        transfer.sender?.name.toLowerCase().includes(query) ||
        transfer.sender?.email.toLowerCase().includes(query)
      )
    })

    return [...filtered].sort((a, b) => {
      let comparison = 0
      switch (sort.key) {
        case "sender":
          comparison = (a.sender?.name ?? "").localeCompare(
            b.sender?.name ?? ""
          )
          break
        case "amount":
          comparison = a.amount - b.amount
          break
        case "expiresAt":
          comparison =
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
          break
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [transfers, status, search, sort])

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">Transfers</h1>
      <p className="text-muted-foreground">
        Money sent to a phone number that hasn&apos;t claimed it yet.
        Unclaimed transfers are refunded to the sender automatically after 7
        days.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending value</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? formatCurrency(stats.pendingValue) : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stats ? `${stats.pendingCount} transfers` : ""}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring soon</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.expiringSoon : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Within 24 hours
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Past due</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.pastDue : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Awaiting refund
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">All transfers</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.total : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every status
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="size-4.5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search name, email, or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by transfer status"
        >
          {STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {visibleTransfers ? (
          <span className="text-sm text-muted-foreground">
            {visibleTransfers.length} result
            {visibleTransfers.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : visibleTransfers && visibleTransfers.length > 0 ? (
          <Card className="ring-foreground/10">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead
                      label="Sender"
                      sortKey="sender"
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>Recipient phone</TableHead>
                    <SortableHead
                      label="Amount"
                      sortKey="amount"
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>Status</TableHead>
                    <SortableHead
                      label="Expires"
                      sortKey="expiresAt"
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>Claimed by</TableHead>
                    <SortableHead
                      label="Sent"
                      sortKey="createdAt"
                      sort={sort}
                      onSort={handleSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTransfers.map((transfer) => {
                    const isUrgent =
                      transfer.status === "pending" &&
                      msRemaining(transfer) < DAY_MS

                    return (
                      <TableRow
                        key={transfer.id}
                        className={cn(
                          isUrgent &&
                            "bg-destructive/[0.03] hover:bg-destructive/5"
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm">
                              <AvatarFallback>
                                {getInitials(transfer.sender?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {transfer.sender?.name ?? "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {transfer.sender?.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${transfer.recipientPhoneNumber}`}
                              className="hover:underline"
                            >
                              {transfer.recipientPhoneNumber}
                            </a>
                            <CopyPhoneButton
                              value={transfer.recipientPhoneNumber}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transfer.amount, transfer.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              STATUS_BADGE_VARIANT[transfer.status] ??
                              "outline"
                            }
                          >
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ExpiryCell transfer={transfer} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transfer.claimedBy?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(transfer.createdAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Send />
              </EmptyMedia>
              <EmptyTitle>No transfers to show</EmptyTitle>
              <EmptyDescription>
                {search || status
                  ? "Nothing matches your current search or filter."
                  : "Money sent to phone numbers that haven't claimed it yet will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default Transfers
