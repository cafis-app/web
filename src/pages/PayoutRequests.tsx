import * as React from "react"
import { Banknote, Check, Send, X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api-client"
import {
  getPayoutRequests,
  resolvePayoutRequest,
  type PayoutRequest,
} from "@/lib/admin-client"
import { formatCurrency, formatCurrencyTotals, sumByCurrency } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
]

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  completed: "default",
  failed: "destructive",
}

const SOURCE_LABEL: Record<PayoutRequest["sourceType"], string> = {
  apology_acceptance: "Apology payout",
  wallet_withdraw: "Withdrawal",
}

function getInitials(name: string | undefined) {
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

function ResolveDialog({
  label,
  title,
  description,
  confirmLabel,
  destructive,
  disabled,
  onConfirm,
}: {
  label: React.ReactNode
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  disabled?: boolean
  onConfirm: (note: string) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [dialogError, setDialogError] = React.useState<string | null>(null)

  async function handleConfirm() {
    setSubmitting(true)
    setDialogError(null)
    try {
      await onConfirm(note)
      setOpen(false)
      setNote("")
    } catch (err) {
      setDialogError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) setOpen(next)
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant={destructive ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          />
        }
      >
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Optional note (e.g. Sifalo portal reference, or reason for failure)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        {dialogError ? (
          <p className="text-sm text-destructive">{dialogError}</p>
        ) : null}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={submitting} />}>
            Cancel
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? <Spinner className="size-3.5" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PayoutRequests() {
  const [payoutRequests, setPayoutRequests] = React.useState<
    PayoutRequest[] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [status, setStatus] = React.useState("")
  const [resolvingIds, setResolvingIds] = React.useState<Set<string>>(
    new Set()
  )

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getPayoutRequests(status || undefined)
      .then((data) => {
        if (!cancelled) setPayoutRequests(data)
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
    if (!payoutRequests) return null
    const pending = payoutRequests.filter((p) => p.status === "pending")
    return {
      total: payoutRequests.length,
      pendingCount: pending.length,
      // A single sum would add dollars to shillings — keep per-currency
      // totals apart instead.
      pendingValueByCurrency: sumByCurrency(
        pending,
        (p) => p.amount,
        (p) => p.currency
      ),
    }
  }, [payoutRequests])

  async function handleResolve(
    id: string,
    outcome: "completed" | "failed",
    resolutionNote: string
  ) {
    setResolvingIds((current) => new Set(current).add(id))
    try {
      const result = await resolvePayoutRequest(
        id,
        outcome,
        resolutionNote || undefined
      )
      setPayoutRequests(
        (current) =>
          current?.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: result.status,
                  resolutionNote: result.resolutionNote,
                }
              : request
          ) ?? current
      )
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
      <h1 className="font-heading text-2xl font-semibold">Payout requests</h1>
      <p className="text-muted-foreground">
        Sifalo can only collect money, not send it — apology-acceptance
        payouts and wallet withdrawals land here for an admin to send
        manually and mark resolved.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending value</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats
                  ? formatCurrencyTotals(stats.pendingValueByCurrency) || "—"
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stats ? `${stats.pendingCount} requests` : ""}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Banknote className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">All requests</p>
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
        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by payout request status"
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
        ) : payoutRequests && payoutRequests.length > 0 ? (
          <Card className="ring-foreground/10">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{SOURCE_LABEL[request.sourceType]}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {getInitials(request.recipient?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {request.recipient?.name ?? "Unknown"}
                            </span>
                            <a
                              href={`tel:${request.recipientPhoneNumber}`}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              {request.recipientPhoneNumber}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(request.amount, request.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            STATUS_BADGE_VARIANT[request.status] ?? "outline"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-muted-foreground">
                        {request.resolutionNote ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(request.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <ResolveDialog
                              label={
                                resolvingIds.has(request.id) ? (
                                  <Spinner className="size-3.5" />
                                ) : (
                                  <>
                                    <Check className="size-3.5" /> Mark
                                    completed
                                  </>
                                )
                              }
                              title="Mark payout completed?"
                              description={`Confirm you've manually sent ${formatCurrency(
                                request.amount,
                                request.currency
                              )} to ${request.recipient?.name ?? "Unknown"} (${request.recipientPhoneNumber}).`}
                              confirmLabel="Mark completed"
                              disabled={resolvingIds.has(request.id)}
                              onConfirm={(note) =>
                                handleResolve(request.id, "completed", note)
                              }
                            />
                            <ResolveDialog
                              label={
                                resolvingIds.has(request.id) ? (
                                  <Spinner className="size-3.5" />
                                ) : (
                                  <>
                                    <X className="size-3.5" /> Mark failed
                                  </>
                                )
                              }
                              title="Mark payout failed?"
                              description="Record why this payout couldn't be sent."
                              confirmLabel="Mark failed"
                              destructive
                              disabled={resolvingIds.has(request.id)}
                              onConfirm={(note) =>
                                handleResolve(request.id, "failed", note)
                              }
                            />
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
                <Banknote />
              </EmptyMedia>
              <EmptyTitle>No payout requests to show</EmptyTitle>
              <EmptyDescription>
                {status
                  ? "Nothing matches the current filter."
                  : "Apology payouts and withdrawals will show up here once real money moves through Sifalo."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default PayoutRequests
