"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

import { FormDialogShell } from "@/components/features/dashboard/forms/form-dialog-shell";
import { Button, TriggerLabel } from "@/components/ui/button";
import {
  LABEL_WIDTH_MM,
  LABEL_HEIGHT_MM,
  generateMemberLabel,
  buildPrintDocument,
  slugify,
  truncateForDisplay,
} from "@/config/label";

interface MemberQrDialogProps {
  qrToken: string;
  memberName: string;
  membershipType: string;
}

export function MemberQrDialog({
  qrToken,
  memberName,
  membershipType,
}: MemberQrDialogProps) {
  const [open, setOpen] = useState(false);
  const [labelDataUrl, setLabelDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setLabelDataUrl(null);

    generateMemberLabel(qrToken, memberName, membershipType)
      .then((composited) => {
        if (!cancelled) setLabelDataUrl(composited);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't generate the label. Try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, qrToken, memberName, membershipType]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setLabelDataUrl(null);
      setError(null);
    }
  }

  function handleDownload() {
    if (!labelDataUrl) return;
    const link = document.createElement("a");
    link.href = labelDataUrl;
    link.download = `${slugify(memberName)}_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    if (!labelDataUrl) return;

    const printWindow = window.open("", "_blank", "width=420,height=300");
    if (!printWindow) return;

    printWindow.document.write(buildPrintDocument(labelDataUrl));
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  const previewScale = 7;
  const previewWidth = LABEL_WIDTH_MM * previewScale;
  const previewHeight = LABEL_HEIGHT_MM * previewScale;

  return (
    <FormDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <TriggerLabel variant="secondary" className="px-4 py-1.5 text-xs">
          QR
        </TriggerLabel>
      }
      title={`${truncateForDisplay(memberName, 24)}'s club label`}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          role="img"
          aria-label={`Label preview for ${memberName}, printed at ${LABEL_WIDTH_MM} by ${LABEL_HEIGHT_MM} millimeters`}
          className="flex items-center justify-center rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] p-6"
        >
          {error ? (
            <div
              style={{ width: previewWidth, height: previewHeight }}
              className="flex items-center justify-center rounded-sm bg-white px-2 text-center text-[10px] text-red-500"
            >
              {error}
            </div>
          ) : labelDataUrl ? (
            <img
              src={labelDataUrl}
              alt={`QR code and label for ${memberName}`}
              width={previewWidth}
              height={previewHeight}
              className="rounded-sm shadow-sm"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{ width: previewWidth, height: previewHeight }}
              className="animate-pulse rounded-sm bg-white/10"
            />
          )}
        </div>

        <p className="text-center text-xs font-light text-white/40">
          Actual print size: {LABEL_WIDTH_MM} × {LABEL_HEIGHT_MM}mm
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={!labelDataUrl}
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            Print label
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDownload}
            disabled={!labelDataUrl}
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download PNG
          </Button>
        </div>
      </div>
    </FormDialogShell>
  );
}
