import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  ShieldCheck,
  UserPlus,
  Users as UsersIcon,
  Wallet,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

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
import { getUsers, type UserSummary } from "@/lib/admin-client"

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

type SortKey = "name" | "balance" | "createdAt"
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function walletTotal(user: UserSummary) {
  if (!user.wallet) return 0
  return user.wallet.availableBalance + user.wallet.escrowedBalance
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

export function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = React.useState<UserSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<Sort>({
    key: "createdAt",
    direction: "desc",
  })

  React.useEffect(() => {
    let cancelled = false

    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data)
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
    if (!users) return null

    const admins = users.filter((user) => user.role === "admin").length
    const totalBalance = users.reduce((sum, user) => sum + walletTotal(user), 0)
    const newThisWeek = users.filter(
      (user) => Date.now() - new Date(user.createdAt).getTime() < WEEK_MS
    ).length

    return { total: users.length, admins, totalBalance, newThisWeek }
  }, [users])

  const visibleUsers = React.useMemo(() => {
    if (!users) return null

    const query = search.trim().toLowerCase()
    const filtered = users.filter((user) => {
      if (!query) return true
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phoneNumber?.toLowerCase().includes(query) ?? false) ||
        (user.city?.toLowerCase().includes(query) ?? false)
      )
    })

    return [...filtered].sort((a, b) => {
      let comparison = 0
      switch (sort.key) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "balance":
          comparison = walletTotal(a) - walletTotal(b)
          break
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [users, search, sort])

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "createdAt" ? "desc" : "asc" }
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">Users</h1>
      <p className="text-muted-foreground">
        Every account registered on Cafis. Click into one to see their
        wallet, debts, and apologies in full.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total users</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.total : "—"}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.admins : "—"}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4.5" />
            </span>
          </CardContent>
        </Card>
        <Card className="ring-foreground/10">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total balance held
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? formatCurrency(stats.totalBalance) : "—"}
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
              <p className="text-sm text-muted-foreground">New this week</p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {stats ? stats.newThisWeek : "—"}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4.5" />
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
            placeholder="Search name, email, phone, city"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        {visibleUsers ? (
          <span className="text-sm text-muted-foreground">
            {visibleUsers.length} result{visibleUsers.length === 1 ? "" : "s"}
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
        ) : visibleUsers && visibleUsers.length > 0 ? (
          <Card className="ring-foreground/10">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead
                      label="User"
                      sortKey="name"
                      sort={sort}
                      onSort={handleSort}
                    />
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Role</TableHead>
                    <SortableHead
                      label="Wallet balance"
                      sortKey="balance"
                      sort={sort}
                      onSort={handleSort}
                    />
                    <SortableHead
                      label="Joined"
                      sortKey="createdAt"
                      sort={sort}
                      onSort={handleSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phoneNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.city ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.wallet
                          ? formatCurrency(
                              walletTotal(user),
                              user.wallet.currency
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
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
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No users to show</EmptyTitle>
              <EmptyDescription>
                {search
                  ? "Nothing matches your search."
                  : "Registered users will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default Users
