"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

import { EASE_PREMIUM } from "../../lib/motion";
import { cn } from "../../lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const TabsActiveValueContext = React.createContext<string | undefined>(undefined);

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const activeValue = value ?? uncontrolledValue;

  return (
    <TabsActiveValueContext.Provider value={activeValue}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        onValueChange={(next) => {
          setUncontrolledValue(next);
          onValueChange?.(next);
        }}
        className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
        {...props}
      />
    </TabsActiveValueContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsRegisterContext = React.createContext<
  ((value: string, node: HTMLButtonElement | null) => void) | null
>(null);

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const activeValue = React.useContext(TabsActiveValueContext);
  const triggers = React.useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  const registerTrigger = React.useCallback(
    (triggerValue: string, node: HTMLButtonElement | null) => {
      if (node) {
        triggers.current.set(triggerValue, node);
      } else {
        triggers.current.delete(triggerValue);
      }
    },
    []
  );

  useIsomorphicLayoutEffect(() => {
    const node = activeValue ? triggers.current.get(activeValue) : undefined;
    if (!node) {
      setIndicator(null);
      return;
    }

    setIndicator({ left: node.offsetLeft, width: node.offsetWidth });

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setIndicator({ left: node.offsetLeft, width: node.offsetWidth });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeValue, children]);

  return (
    <TabsRegisterContext.Provider value={registerTrigger}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        {variant === "default" && indicator && (
          <motion.div
            aria-hidden
            className="absolute inset-y-[3px] rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
            initial={false}
            animate={{ left: indicator.left, width: indicator.width }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
          />
        )}
        {children}
      </TabsPrimitive.List>
    </TabsRegisterContext.Provider>
  );
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const registerTrigger = React.useContext(TabsRegisterContext);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => registerTrigger?.(value, node)}
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-200 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent",
        "data-[state=active]:text-foreground dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
