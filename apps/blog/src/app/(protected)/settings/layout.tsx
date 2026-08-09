"use client";

import { SiteHeader } from "@/components/site-header";
import { cn } from "@repo/ui/lib/utils";
import { Ban, KeyRound, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/sessions", label: "Sessions", icon: KeyRound },
  { href: "/settings/blocked", label: "Blocked users", icon: Ban },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 sm:flex-row sm:gap-10">
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-accent font-medium text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </>
  );
}
