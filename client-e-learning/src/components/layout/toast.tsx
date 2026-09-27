"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: "rounded-lg border border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.12)]",
                },
            }}
        />
    );
}