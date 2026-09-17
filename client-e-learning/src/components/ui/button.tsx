import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-indigo-200 focus-visible:ring-primary",
        secondary:
          "bg-primary-light text-primary hover:bg-indigo-100 focus-visible:ring-primary",
        outline:
          "border border-border-color bg-white text-neutral-dark hover:bg-background-app hover:border-slate-300 focus-visible:ring-primary",
        ghost:
          "text-neutral-muted hover:text-neutral-dark hover:bg-slate-100 focus-visible:ring-primary",
        inverted:
          "bg-neutral-dark text-white hover:bg-slate-800 shadow-sm focus-visible:ring-neutral-dark",
        teal:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm shadow-cyan-200 focus-visible:ring-secondary",
        amber:
          "bg-accent text-accent-foreground hover:bg-amber-600 shadow-sm shadow-amber-200 focus-visible:ring-accent",
        danger:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200 focus-visible:ring-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
