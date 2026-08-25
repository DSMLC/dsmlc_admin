"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

import {
  checkInByToken,
  type CheckInResult,
} from "@/lib/actions/member-checkin";
import { FormDialogShell } from "@/components/features/dashboard/forms/form-dialog-shell";
import { TriggerLabel } from "@/components/ui/button";

interface CheckInScannerProps {
  eventId: string;
}

export function CheckInScanner({ eventId }: CheckInScannerProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    const scanner = new Html5Qrcode("checkin-reader");

    const startPromise = scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 240 },
      async (decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;

        const res = await checkInByToken(eventId, decodedText.trim());
        setResult(res);

        setTimeout(() => {
          processingRef.current = false;
        }, 1500);
      },
      () => {},
    );

    startPromise.catch(() => {
      setResult({ status: "error", message: "Couldn't access the camera." });
    });

    return () => {
      // Wait for start() to settle (success or failure) before ever
      // touching the scanner — this is what prevents the race.
      startPromise
        .catch(() => null)
        .then(() => {
          if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
            return scanner.stop().then(() => scanner.clear());
          }
          return scanner.clear();
        })
        .catch(() => {});
    };
  }, [open, eventId]);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(null);
      }}
      trigger={
        <TriggerLabel
          variant="outline"
          className="w-full justify-center sm:w-auto"
        >
          Scan check-in
        </TriggerLabel>
      }
      triggerClassName="w-full sm:w-auto"
      title="Scan member QR code"
    >
      <div id="checkin-reader" className="overflow-hidden rounded-[10px]" />

      <div className="mt-4 min-h-[52px]">
        {result?.status === "checked_in" && (
          <p className="text-sm font-medium text-green-400">
            ✓ Checked in {result.name}
          </p>
        )}
        {result?.status === "already_checked_in" && (
          <p className="text-sm font-medium text-yellow-400">
            {result.name} is already checked in.
          </p>
        )}
        {result?.status === "not_found" && (
          <p className="text-sm font-medium text-red-400">{result.message}</p>
        )}
        {result?.status === "error" && (
          <p className="text-sm font-medium text-red-400">
            {result.message ?? "Something went wrong."}
          </p>
        )}
      </div>
    </FormDialogShell>
  );
}
