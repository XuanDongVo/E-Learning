"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone for the confirm button */
  tone?: "default" | "destructive";
};

type ConfirmState = ConfirmDialogOptions & {
  open: boolean;
  resolve: (value: boolean) => void;
};

const defaultState: Omit<ConfirmState, "resolve"> = {
  open: false,
  title: "",
  description: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  tone: "default",
};

const ConfirmDialogContext = React.createContext<
  ((options: ConfirmDialogOptions) => Promise<boolean>) | null
>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState | null>(null);

  const confirm = React.useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...defaultState,
        ...options,
        open: true,
        resolve,
      });
    });
  }, []);

  const close = React.useCallback(
    (value: boolean) => {
      state?.resolve(value);
      setState((current) => (current ? { ...current, open: false } : null));
    },
    [state],
  );

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={Boolean(state?.open)}
        onOpenChange={(open) => {
          if (!open) close(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state?.title}</AlertDialogTitle>
            {state?.description ? (
              <AlertDialogDescription>{state.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>
              {state?.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className={cn(
                state?.tone === "destructive" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {state?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return ctx;
}
