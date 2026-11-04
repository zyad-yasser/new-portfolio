"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Input, type InputProps } from "./input";

function PasswordInput({ className, ...props }: InputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
