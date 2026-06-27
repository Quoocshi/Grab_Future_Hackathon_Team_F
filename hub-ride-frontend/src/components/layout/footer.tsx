import Link from "next/link";
import { CircleHelp, ShieldCheck } from "lucide-react";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/35">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
            Built for reliable urban trips
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            A foundation for rider booking, driver availability, and operations views. Data falls
            back to local mocks until the API is connected.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span className="flex items-center gap-2">
            <CircleHelp className="size-4" strokeWidth={1.8} aria-hidden="true" />
            24/7 help center
          </span>
        </div>
      </div>
    </footer>
  );
}
