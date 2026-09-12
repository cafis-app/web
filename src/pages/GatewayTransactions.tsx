import * as React from "react"
import { ArrowLeftRight, Check, X } from "lucide-react"

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
  getGatewayTransactions,
  resolveGatewayTransaction,
  type GatewayTransaction,
} from "@/lib/admin-client"
import { formatCurrency } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
]

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  processing: "outline",
  pending: "secondary",
  succeeded: "default",
  failed: "destructive",
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

export function GatewayTransactions() {
  const [transactions, setTransactions] = React.useState<
    GatewayTransaction[] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [status, setStatus] = React.useState("")
  const [resolvingIds, setResolvingIds] = React.useState<Set<string>>(
    new Set()
  )
  const [rowErrors, setRowErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getGatewayTransactions(status || undefined)
      .then((data) => {
        if (!cancelled) setTransactions(data)
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
    if (!transactions) return null
    const pending = transactions.filter(
      (t) => t.resolvable ?? t.status === "pending"
    )
    return { total: transactions.length, pendingCount: pending.length }
  }, [transactions])

  async function handleResolve(id: string, outcome: "succeeded" | "failed") {
    setRowErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setResolvingIds((current) => new Set(current).add(id))

    try {
      const result = await resolveGatewayTransaction(id, outcome)
      setTransactions(
        (current) =>
          current?.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status: result.status }
              : transaction
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
      setResolvingIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">
        Gateway transactions
      </h1>
      <p className="text-muted-foreground">
        Sifalo deposit attempts. A &quot;pending&quot; transaction came back
        as awaiting approval with no documented way to confirm the outcome —
        check the Sifalo portal and mark it here once you know.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pending confirmation
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.pendingCount : "—"}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ArrowLeftRight className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">All attempts</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.total : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every status
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowLeftRight className="size-4.5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by gateway transaction status"
        >
          {STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
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
        ) : transactions && transactions.length > 0 ? (
          <Card className="ring-foreground/10">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Charged</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="capitalize">
                        {transaction.gateway}
                      </TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(
                          transaction.requestedAmount,
                          transaction.requestedCurrency
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          transaction.chargedAmount,
                          transaction.chargedCurrency
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.responseCode ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            STATUS_BADGE_VARIANT[transaction.status] ??
                            "outline"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(transaction.resolvable ??
                          transaction.status === "pending") ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex justify-end gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      size="sm"
                                      disabled={resolvingIds.has(
                                        transaction.id
                                      )}
                                    />
                                  }
                                >
                                  {resolvingIds.has(transaction.id) ? (
                                    <Spinner className="size-3.5" />
                                  ) : (
                                    <>
                                      <Check className="size-3.5" /> Succeeded
                                    </>
                                  )}
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>
                                    Mark deposit succeeded?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Confirm on the Sifalo portal that this
                                    transaction went through before
                                    confirming — the wallet will be credited{" "}
                                    {formatCurrency(
                                      transaction.requestedAmount,
                                      transaction.requestedCurrency
                                    )}
                                    .
                                  </AlertDialogDescription>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleResolve(
                                          transaction.id,
                                          "succeeded"
                                        )
                                      }
                                    >
                                      Mark succeeded
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
                                      disabled={resolvingIds.has(
                                        transaction.id
                                      )}
                                    />
                                  }
                                >
                                  {resolvingIds.has(transaction.id) ? (
                                    <Spinner className="size-3.5" />
                                  ) : (
                                    <>
                                      <X className="size-3.5" /> Failed
                                    </>
                                  )}
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>
                                    Mark deposit failed?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    The wallet will not be credited. This
                                    can&apos;t be undone.
                                  </AlertDialogDescription>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() =>
                                        handleResolve(transaction.id, "failed")
                                      }
                                    >
                                      Mark failed
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            {rowErrors[transaction.id] ? (
                              <span className="text-xs text-destructive">
                                {rowErrors[transaction.id]}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArrowLeftRight />
              </EmptyMedia>
              <EmptyTitle>No gateway transactions to show</EmptyTitle>
              <EmptyDescription>
                {status
                  ? "Nothing matches the current filter."
                  : "Sifalo deposit attempts will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default GatewayTransactions
