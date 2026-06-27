import Link from "next/link";
import { CarFront, Menu, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserSwitcher } from "@/components/shared/UserSwitcher";
import { WalletBadge } from "@/components/shared/WalletBadge";

const navItems = [
  { href: "/rooms/new", label: "Tao phong" },
  { href: "/rooms/browse", label: "Tim phong" },
  { href: "/bookings", label: "Lich su" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Hub-Ride home">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CarFront className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Hub-Ride</span>
            <span className="mt-1 text-xs text-muted-foreground">Shared hub cars</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="lg">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WalletBadge />
          <div className="hidden lg:block">
            <UserSwitcher />
          </div>
          <Button asChild className="hidden sm:inline-flex" size="lg">
            <Link href="/rooms/new">
              <Plus className="size-4" strokeWidth={1.8} aria-hidden="true" />
              Tao phong
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon-lg" className="md:hidden" aria-label="Tim phong">
            <Link href="/rooms/browse">
              <Search className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" size="icon-lg" className="hidden" aria-label="Open menu">
            <Menu className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
