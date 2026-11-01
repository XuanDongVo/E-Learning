"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type BusyButtonProps = React.ComponentProps<typeof Button> & {
  busy?: boolean;
  busyLabel?: string;
};

export function BusyButton({
  busy = false,
  busyLabel,
  disabled,
  children,
  className,
  ...props
}: BusyButtonProps) {
  return (
    <Button
      disabled={disabled || busy}
      className={cn(className)}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy ? (
        <>
          <Spinner size="sm" className="text-current" />
          {busyLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
