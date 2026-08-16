"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";

export function VerifiedGate({
  verified,
  message,
  children,
}: {
  verified: boolean;
  message: string;
  children: React.ReactNode;
}) {
  if (verified) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so keyboard users can reveal why the disabled control inside is disabled */}
        <span tabIndex={0} className="inline-flex">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
}
