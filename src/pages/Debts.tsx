import * as React from "react"
import { Check, HandCoins, Search, Wallet, X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { ApiError } from "@/lib/api-client"
import {
  forgiveDebt,
  getDebts,
  rejectDebt,
  type Debt,
  type DebtParty,
} from "@/lib/admin-client"
import { formatCurrency, formatCurrencyTotals, sumByCurrency } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_negotiation", label: "In negotiation" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "awaiting_payout", label: "Awaiting payout" },
  { value: "settled", label: "Settled" },
  { value: "forgiven", label: "Forgiven" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  in_negotiation: "secondary",
  partially_paid: "outline",
  awaiting_payout: "outline",
  settled: "default",
  forgiven: "default",
  rejected: "destructive",
  cancelled: "outline",
}

// Mirrors TERMINAL_DEBT_STATUSES in the backend admin controller — once a
// debt lands in one of these, forgive/reject are no longer offered.
const TERMINAL_STATUSES = new Set(["settled", "forgiven", "rejected"])

function getInitials(name: string | null | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
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

function PartyCell({
  party,
  unregisteredLabel,
}: {
  party: DebtParty | null
  unregisteredLabel: string
}) {
  if (!party) {
    return <span className="text-muted-foreground">Unknown</span>
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar size="sm">
        <AvatarFallback>{getInitials(party.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{party.name ?? "Unknown"}</span>
        <span className="text-xs text-muted-foreground">
          {party.id ? party.email : unregisteredLabel}
        </span>
      </div>
    </div>
  )
}

export function Debts() {
  const [debts, setDebts] = React.useState<Debt[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [status, setStatus] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [actingIds, setActingIds] = React.useState<Set<string>>(new Set())
  const [rowErrors, setRowErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getDebts(status || undefined)
      .then((data) => {
        if (!cancelled) setDebts(data)
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
  }, [status])

  const stats = React.useMemo(() => {
    if (!debts) return null

    const outstanding = debts.filter(
      (debt) => !TERMINAL_STATUSES.has(debt.status) && debt.status !== "cancelled"
    )

    return {
      total: debts.length,
      outstandingCount: outstanding.length,
      outstandingValueByCurrency: sumByCurrency(
        outstanding,
        (debt) => debt.currentBalance,
        (debt) => debt.currency
      ),
    }
  }, [debts])

  const visibleDebts = React.useMemo(() => {
    if (!debts) return null

    const query = search.trim().toLowerCase()
    if (!query) return debts

    return debts.filter((debt) => {
      const haystack = [
        debt.debtor?.name,
        debt.debtor?.email,
        debt.creditor?.name,
        debt.creditor?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [debts, search])

  async function handleForgive(id: string) {
    setRowErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setActingIds((current) => new Set(current).add(id))

    try {
      const result = await forgiveDebt(id)
      setDebts(
        (current) =>
          current?.map((debt) =>
            debt.id === id
              ? {
                  ...debt,
                  status: result.status,
                  currentBalance: result.currentBalance,
                }
              : debt
          ) ?? current
      )
    } catch (err) {
      setRowErrors((current) => ({
        ...current,
        [id]:
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
      }))
    } finally {
      setActingIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  async function handleReject(id: string) {
    setRowErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setActingIds((current) => new Set(current).add(id))

    try {
      const result = await rejectDebt(id)
      setDebts(
        (current) =>
          current?.map((debt) =>
            debt.id === id
              ? {
                  ...debt,
                  status: result.status,
                  currentBalance: result.currentBalance,
                }
              : debt
          ) ?? current
      )
    } catch (err) {
      setRowErrors((current) => ({
        ...current,
        [id]:
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
      }))
    } finally {
      setActingIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">Debts</h1>
      <p className="text-muted-foreground">
        Every debt request across the platform — sent by a debtor, pending
        the creditor&apos;s response, accepted (settled or awaiting payout),
        or denied.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding value</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats
                  ? formatCurrencyTotals(stats.outstandingValueByCurrency) ||
                    "—"
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stats ? `${stats.outstandingCount} debts` : ""}
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
              <p className="text-sm text-muted-foreground">All debts</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.total : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every status
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HandCoins className="size-4.5" />
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
            placeholder="Search debtor or creditor"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by debt status"
        >
          {STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {visibleDebts ? (
          <span className="text-sm text-muted-foreground">
            {visibleDebts.length} result
            {visibleDebts.length === 1 ? "" : "s"}
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
        ) : visibleDebts && visibleDebts.length > 0 ? (
          <Card className="ring-foreground/10">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debtor</TableHead>
                    <TableHead>Creditor</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDebts.map((debt) => {
                    const isTerminal = TERMINAL_STATUSES.has(debt.status)

                    return (
                      <TableRow key={debt.id}>
                        <TableCell>
                          <PartyCell
                            party={debt.debtor}
                            unregisteredLabel="Unregistered"
                          />
                        </TableCell>
                        <TableCell>
                          <PartyCell
                            party={debt.creditor}
                            unregisteredLabel="Off-platform"
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(debt.originalAmount, debt.currency)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(debt.currentBalance, debt.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              STATUS_BADGE_VARIANT[debt.status] ?? "outline"
                            }
                          >
                            {debt.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {debt.dueDate ? formatDateTime(debt.dueDate) : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(debt.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isTerminal ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex justify-end gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={actingIds.has(debt.id)}
                                      />
                                    }
                                  >
                                    {actingIds.has(debt.id) ? (
                                      <Spinner className="size-3.5" />
                                    ) : (
                                      <>
                                        <Check className="size-3.5" /> Forgive
                                      </>
                                    )}
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>
                                      Forgive this debt?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {formatCurrency(
                                        debt.currentBalance,
                                        debt.currency
                                      )}{" "}
                                      owed by {debt.debtor?.name ?? "Unknown"}{" "}
                                      will be waived and any escrowed balance
                                      refunded. This can&apos;t be undone.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Keep debt
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleForgive(debt.id)}
                                      >
                                        Forgive debt
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={actingIds.has(debt.id)}
                                      />
                                    }
                                  >
                                    {actingIds.has(debt.id) ? (
                                      <Spinner className="size-3.5" />
                                    ) : (
                                      <>
                                        <X className="size-3.5" /> Reject
                                      </>
                                    )}
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>
                                      Reject this debt?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Any escrowed balance will be refunded to{" "}
                                      {debt.debtor?.name ?? "the debtor"}, and
                                      the request will be closed. This
                                      can&apos;t be undone.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Keep debt
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => handleReject(debt.id)}
                                      >
                                        Reject debt
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              {rowErrors[debt.id] ? (
                                <span className="text-xs text-destructive">
                                  {rowErrors[debt.id]}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
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
                <HandCoins />
              </EmptyMedia>
              <EmptyTitle>No debts to show</EmptyTitle>
              <EmptyDescription>
                {search || status
                  ? "Nothing matches your current search or filter."
                  : "Debt requests sent between users will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default Debts
