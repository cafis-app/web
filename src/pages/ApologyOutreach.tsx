import * as React from "react"
import { Mail, MapPin, Phone } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  getUnregisteredCreditorApologies,
  type UnregisteredCreditorApology,
} from "@/lib/admin-client"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_negotiation", label: "In negotiation" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "settled", label: "Settled" },
  { value: "forgiven", label: "Forgiven" },
  { value: "rejected", label: "Rejected" },
]

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  in_negotiation: "outline",
  partially_paid: "outline",
  settled: "default",
  forgiven: "default",
  rejected: "destructive",
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ApologyOutreach() {
  const [status, setStatus] = React.useState("")
  const [apologies, setApologies] = React.useState<
    UnregisteredCreditorApology[] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getUnregisteredCreditorApologies(status || undefined)
      .then((data) => {
        if (!cancelled) setApologies(data)
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

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">
        Apology outreach
      </h1>
      <p className="text-muted-foreground">
        Apology letters addressed to people who aren&apos;t Cafis users.
        Their only contact info is what the sender entered on the debt.
      </p>

      <div className="mt-5 flex items-center gap-3">
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
        {apologies ? (
          <span className="text-sm text-muted-foreground">
            {apologies.length} result{apologies.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : apologies && apologies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Creditor to contact</TableHead>
                <TableHead>Apology</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apologies.map((apology) => (
                <TableRow key={apology.apologyId}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {apology.sender?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {apology.sender?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-sm font-medium text-foreground">
                        {apology.creditor.name ?? "Unknown"}
                      </span>
                      {apology.creditor.phoneNumber ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="size-3" />
                          {apology.creditor.phoneNumber}
                        </span>
                      ) : null}
                      {apology.creditor.email ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="size-3" />
                          {apology.creditor.email}
                        </span>
                      ) : null}
                      {apology.creditor.city ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3" />
                          {apology.creditor.city}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {apology.content}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      apology.debt.currentBalance,
                      apology.debt.currency
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_BADGE_VARIANT[apology.debt.status] ?? "outline"
                      }
                    >
                      {apology.debt.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(apology.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Mail />
              </EmptyMedia>
              <EmptyTitle>No apologies to follow up on</EmptyTitle>
              <EmptyDescription>
                Apology letters sent to people who aren&apos;t Cafis users
                will show up here once there are some.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default ApologyOutreach
