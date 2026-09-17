import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F46E5] text-white",
        secondary:
          "bg-[#EEF2FF] text-[#4F46E5]",
        teal:
          "bg-[#ECFEFF] text-[#0891B2]",
        amber:
          "bg-[#FEF3C7] text-[#D97706]",
        destructive:
          "bg-[#FEE2E2] text-[#DC2626]",
        outline:
          "text-[#64748B] border border-[#E2E8F0]",
        muted:
          "bg-[#F1F5F9] text-[#64748B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
