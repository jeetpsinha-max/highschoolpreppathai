import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        gold: "border-transparent bg-secondary/15 text-secondary",
        boarding: "border-transparent bg-accent text-accent-foreground",
        competitive: "border-transparent bg-primary/10 text-primary",
        "girls-only": "border-transparent bg-pink-100 text-pink-700",
        "boys-only": "border-transparent bg-blue-100 text-blue-700",
        stem: "border-transparent bg-emerald-100 text-emerald-700",
        arts: "border-transparent bg-purple-100 text-purple-700",
        religious: "border-transparent bg-amber-100 text-amber-700",
        ld: "border-transparent bg-cyan-100 text-cyan-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
