import * as React from "react"
import { ArrowRight, Landmark, Mail, Send, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  getAdminStats,
  getUnregisteredCreditorApologies,
  type AdminStats,
  type UnregisteredCreditorApology,
} from "@/lib/admin-client"
import { useAuth } from "@/lib/auth-context"

const STAT_CARDS = [
  { key: "totalUsers", label: "Total users", icon: Users },
  { key: "pendingDebts", label: "Pending debts", icon: Landmark },
  {
    key: "unregisteredCreditorApologies",
    label: "Apologies needing outreach",
    icon: Mail,
  },
  { key: "pendingTransfers", label: "Pending transfers", icon: Send },
] as const

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

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = React.useState<AdminStats | null>(null)
  const [recentApologies, setRecentApologies] = React.useState<
    UnregisteredCreditorApology[] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    Promise.all([getAdminStats(), getUnregisteredCreditorApologies()])
      .then(([statsData, apologies]) => {
        if (cancelled) return
        setStats(statsData)
        setRecentApologies(apologies.slice(0, 5))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
        )
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Signed in as {user?.email}.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.key} className="ring-foreground/10">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {stats ? (
                  <p className="mt-1 font-heading text-2xl font-semibold">
                    {stats[card.key].toLocaleString()}
                  </p>
                ) : (
                  <Skeleton className="mt-2 h-7 w-12" />
                )}
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="size-4.5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            Recent apology outreach
          </h2>
          <Link
            to="/dashboard/apology-outreach"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Card className="mt-4 ring-foreground/10">
          <CardContent className="px-0">
            {recentApologies === null ? (
              <div className="px-(--card-spacing)">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : recentApologies.length === 0 ? (
              <p className="px-(--card-spacing) text-sm text-muted-foreground">
                No apologies to follow up on yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-(--card-spacing)">
                      Sender
                    </TableHead>
                    <TableHead>Creditor</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="pr-(--card-spacing)">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApologies.map((apology) => (
                    <TableRow key={apology.apologyId}>
                      <TableCell className="pl-(--card-spacing)">
                        {apology.sender?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell>{apology.creditor.name ?? "Unknown"}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          apology.debt.currentBalance,
                          apology.debt.currency
                        )}
                      </TableCell>
                      <TableCell className="pr-(--card-spacing)">
                        <Badge variant="secondary">
                          {apology.debt.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
