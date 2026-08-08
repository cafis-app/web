import * as React from "react"
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api-client"
import { getUserDetail, type UserDetail as UserDetailData } from "@/lib/admin-client"

const DEBT_STATUS_VARIANT: Record<
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

const TRANSFER_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  claimed: "default",
  expired: "destructive",
  cancelled: "outline",
}

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-10 text-center text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  )
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = React.useState<UserDetailData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getUserDetail(id)
      .then((result) => {
        if (!cancelled) setData(result)
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
  }, [id])

  return (
    <div className="flex flex-col gap-1">
      <Link
        to="/dashboard/users"
        className="mb-4 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading || !data ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : (
        <>
          <Card className="ring-foreground/10">
            <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">
                    {getInitials(data.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-heading text-xl font-semibold">
                      {data.user.name}
                    </h1>
                    <Badge
                      variant={
                        data.user.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {data.user.role}
                    </Badge>
                    {data.user.emailVerified ? (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="size-3" />
                        Verified
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5" />
                      {data.user.email}
                    </span>
                    {data.user.phoneNumber ? (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3.5" />
                        {data.user.phoneNumber}
                      </span>
                    ) : null}
                    {data.user.city ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {data.user.city}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      Joined {formatDate(data.user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="ring-foreground/10">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Available balance
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold">
                    {data.wallet
                      ? formatCurrency(
                          data.wallet.availableBalance,
                          data.wallet.currency
                        )
                      : "—"}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <WalletIcon className="size-4.5" />
                </span>
              </CardContent>
            </Card>
            <Card className="ring-foreground/10">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Escrowed balance
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold">
                    {data.wallet
                      ? formatCurrency(
                          data.wallet.escrowedBalance,
                          data.wallet.currency
                        )
                      : "—"}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Landmark className="size-4.5" />
                </span>
              </CardContent>
            </Card>
            <Card className="ring-foreground/10">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total balance
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold">
                    {data.wallet
                      ? formatCurrency(
                          data.wallet.availableBalance +
                            data.wallet.escrowedBalance,
                          data.wallet.currency
                        )
                      : "—"}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Send className="size-4.5" />
                </span>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="debts" className="mt-8">
            <TabsList>
              <TabsTrigger value="debts">
                Debts ({data.debts.length})
              </TabsTrigger>
              <TabsTrigger value="apologies">
                Apologies ({data.apologies.length})
              </TabsTrigger>
              <TabsTrigger value="wallet">
                Wallet activity ({data.walletTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="transfers">
                Transfers sent ({data.transfersSent.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="debts" className="mt-4">
              <Card className="ring-foreground/10">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Counterparty</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.debts.length === 0 ? (
                        <EmptyRow colSpan={6} message="No debts yet." />
                      ) : (
                        data.debts.map((debt) => (
                          <TableRow key={debt.id}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="gap-1"
                              >
                                {debt.role === "debtor" ? (
                                  <ArrowUpRight className="size-3 text-destructive" />
                                ) : (
                                  <ArrowDownLeft className="size-3 text-green-600 dark:text-green-500" />
                                )}
                                {debt.role === "debtor" ? "Owes" : "Owed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {debt.counterpartyName}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                debt.currentBalance,
                                debt.currency
                              )}
                              {debt.currentBalance !==
                              debt.originalAmount ? (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  of{" "}
                                  {formatCurrency(
                                    debt.originalAmount,
                                    debt.currency
                                  )}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  DEBT_STATUS_VARIANT[debt.status] ??
                                  "outline"
                                }
                              >
                                {debt.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {debt.dueDate ? formatDate(debt.dueDate) : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(debt.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apologies" className="mt-4">
              <Card className="ring-foreground/10">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Direction</TableHead>
                        <TableHead>Counterparty</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.apologies.length === 0 ? (
                        <EmptyRow colSpan={4} message="No apologies yet." />
                      ) : (
                        data.apologies.map((apology) => (
                          <TableRow key={apology.id}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="gap-1"
                              >
                                {apology.direction === "sent" ? (
                                  <ArrowUpRight className="size-3" />
                                ) : (
                                  <ArrowDownLeft className="size-3" />
                                )}
                                {apology.direction === "sent"
                                  ? "Sent"
                                  : "Received"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {apology.counterpartyName}
                            </TableCell>
                            <TableCell className="max-w-sm whitespace-normal text-muted-foreground">
                              {apology.content}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(apology.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="mt-4">
              <Card className="ring-foreground/10">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.walletTransactions.length === 0 ? (
                        <EmptyRow
                          colSpan={4}
                          message="No wallet activity yet."
                        />
                      ) : (
                        data.walletTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="capitalize">
                              {transaction.type.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell
                              className={
                                transaction.amount < 0
                                  ? "text-destructive"
                                  : "text-green-600 dark:text-green-500"
                              }
                            >
                              {transaction.amount < 0 ? "-" : "+"}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTime(transaction.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfers" className="mt-4">
              <Card className="ring-foreground/10">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient phone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.transfersSent.length === 0 ? (
                        <EmptyRow
                          colSpan={5}
                          message="No transfers sent yet."
                        />
                      ) : (
                        data.transfersSent.map((transfer) => (
                          <TableRow key={transfer.id}>
                            <TableCell>
                              {transfer.recipientPhoneNumber}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                transfer.amount,
                                transfer.currency
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  TRANSFER_STATUS_VARIANT[transfer.status] ??
                                  "outline"
                                }
                              >
                                {transfer.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTime(transfer.expiresAt)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTime(transfer.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default UserDetail
