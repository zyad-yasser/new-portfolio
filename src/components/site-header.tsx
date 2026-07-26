"use client";

import { useActiveSection } from "@/lib/use-active-section";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { id: "about", label: "About", href: "/#about" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "services", label: "Services", href: "/#services" },
  { id: "projects", label: "Work", href: "/#projects" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeId = useActiveSection(NAV_ITEMS.map((item) => item.id));

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          Zyad<span className="text-gradient-brand">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === "/" && activeId === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
                  "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full",
                  isActive && "text-foreground after:w-full"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden flex items-center justify-center h-11 w-11 rounded-md hover:bg-accent transition-colors duration-200"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="md:hidden glass-strong border-t border-border px-4 py-4 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="min-h-[44px] flex items-center px-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
