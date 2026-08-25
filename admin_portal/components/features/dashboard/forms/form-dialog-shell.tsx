"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type React from "react";

import { cn } from "@/lib/utils";

interface FormDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  triggerClassName?: string;
  title: string;
  children: React.ReactNode;
}

export function FormDialogShell({
  open,
  onOpenChange,
  trigger,
  triggerClassName,
  title,
  children,
}: FormDialogShellProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={cn("block", triggerClassName)}
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-[#1e1e1e] bg-[#111111] p-6 sm:p-8"
            >
              <h2 className="mb-6 text-lg font-medium text-[#f2f2f2]">
                {title}
              </h2>
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
