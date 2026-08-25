"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";

import { FormDialogShell } from "@/components/features/dashboard/forms/form-dialog-shell";
import { Button, TriggerLabel } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

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
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(qrToken, {
      width: 320,
      margin: 1,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    }).then(setDataUrl);
  }, [open, qrToken]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${memberName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    if (!cardRef.current) return;
    const printWindow = window.open("", "_blank", "width=420,height=640");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${memberName} — Club Card</title>
          <style>
            @page { size: 3.5in 2.2in; margin: 0; }
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: system-ui, sans-serif;
            }
          </style>
        </head>
        <body>${cardRef.current.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  return (
    <FormDialogShell
      open={open}
      onOpenChange={setOpen}
      trigger={
        <TriggerLabel variant="secondary" className="px-4 py-1.5 text-xs">
          QR
        </TriggerLabel>
      }
      title={`${memberName}'s club card`}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          ref={cardRef}
          className="flex w-full max-w-[340px] items-center gap-4 rounded-2xl border border-[#1e1e1e] bg-white p-4"
        >
          {dataUrl ? (
            <img src={dataUrl} alt="Member QR code" width={110} height={110} />
          ) : (
            <div className="flex h-[110px] w-[110px] items-center justify-center text-xs text-black/40">
              Generating…
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-black/40">
              {siteConfig.name}
            </p>
            <p className="mt-1 truncate text-base font-bold text-black">
              {memberName}
            </p>
            <p className="text-xs font-light text-black/50">{membershipType}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            Print card
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!dataUrl}
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download PNG
          </Button>
        </div>
      </div>
    </FormDialogShell>
  );
}
