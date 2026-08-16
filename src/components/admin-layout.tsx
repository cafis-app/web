import {
  ArrowLeftRight,
  Banknote,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Mail,
  Repeat,
  Users,
} from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"

import logo from "@/assets/cafis-logo-no-bg.png"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/apology-outreach", label: "Apology outreach", icon: Mail },
  { to: "/dashboard/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/dashboard/debts", label: "Debts", icon: HandCoins },
  { to: "/dashboard/payout-requests", label: "Payout requests", icon: Banknote },
  {
    to: "/dashboard/gateway-transactions",
    label: "Gateway transactions",
    icon: Repeat,
  },
  { to: "/dashboard/users", label: "Users", icon: Users },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <img
                src={logo}
                alt="Cafis logo"
                width={28}
                height={28}
                className="rounded-lg"
              />
            </span>
            <span className="font-heading font-semibold group-data-[collapsible=icon]:hidden">
              Cafis Admin
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<Link to={item.to} />}
                      isActive={
                        item.to === "/dashboard"
                          ? location.pathname === item.to
                          : location.pathname.startsWith(item.to)
                      }
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center">
            <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">{user?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
