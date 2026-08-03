import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

function Label({
  className,
  ref,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> &
  VariantProps<typeof labelVariants> & { ref?: React.Ref<HTMLLabelElement> }) {
  return <label ref={ref} className={cn(labelVariants(), className)} {...props} />;
}
Label.displayName = "Label";

export { Label };
