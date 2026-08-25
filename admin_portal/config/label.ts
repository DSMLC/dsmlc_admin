import QRCode from "qrcode";

export const LABEL_WIDTH_MM = 40;
export const LABEL_HEIGHT_MM = 14;

export const PRINT_DPI = 300;
export const PX_PER_MM = PRINT_DPI / 25.4;

export const LABEL_WIDTH_PX = Math.round(LABEL_WIDTH_MM * PX_PER_MM);
export const LABEL_HEIGHT_PX = Math.round(LABEL_HEIGHT_MM * PX_PER_MM);
export const MARGIN_PX = Math.round(1.2 * PX_PER_MM);
export const QR_SIZE_PX = LABEL_HEIGHT_PX - MARGIN_PX * 2;

export const TEXT_GAP_PX = Math.round(3 * PX_PER_MM);

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncateForDisplay(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function truncateToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (
    truncated.length > 1 &&
    ctx.measureText(`${truncated}…`).width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

export function resolveDisplayName(
  ctx: CanvasRenderingContext2D,
  fullName: string,
  maxWidth: number
): string {
  const firstName = getFirstName(fullName);
  if (ctx.measureText(firstName).width <= maxWidth) return firstName;

  const initials = getInitials(fullName);
  if (ctx.measureText(initials).width <= maxWidth) return initials;

  return truncateToWidth(ctx, initials, maxWidth);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load QR image"));
    img.src = src;
  });
}

export async function buildLabelImage(
  qrDataUrl: string,
  memberName: string,
  membershipType: string
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_WIDTH_PX;
  canvas.height = LABEL_HEIGHT_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, MARGIN_PX, MARGIN_PX, QR_SIZE_PX, QR_SIZE_PX);

  const textX = MARGIN_PX + QR_SIZE_PX + TEXT_GAP_PX;
  const textMaxWidth = canvas.width - textX - MARGIN_PX;

  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#0a0a0a";
  ctx.font = `700 ${Math.round(LABEL_HEIGHT_PX * 0.32)}px -apple-system, "Segoe UI", sans-serif`;
  const name = resolveDisplayName(ctx, memberName, textMaxWidth);
  ctx.fillText(name, textX, LABEL_HEIGHT_PX * 0.55);

  ctx.fillStyle = "rgba(10, 10, 10, 0.6)";
  ctx.font = `400 ${Math.round(LABEL_HEIGHT_PX * 0.24)}px -apple-system, "Segoe UI", sans-serif`;
  const type = truncateToWidth(ctx, membershipType, textMaxWidth);
  ctx.fillText(type, textX, LABEL_HEIGHT_PX * 0.85);

  return canvas.toDataURL("image/png");
}

export async function generateMemberLabel(
  qrToken: string,
  memberName: string,
  membershipType: string
): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "L",
    margin: 1,
    width: QR_SIZE_PX,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  return buildLabelImage(qrDataUrl, memberName, membershipType);
}

export function buildPrintDocument(labelDataUrl: string): string {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Label — ${LABEL_WIDTH_MM}×${LABEL_HEIGHT_MM}mm</title>
        <style>
          @page {
            size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: ${LABEL_WIDTH_MM}mm;
            height: ${LABEL_HEIGHT_MM}mm;
          }
          img {
            display: block;
            width: ${LABEL_WIDTH_MM}mm;
            height: ${LABEL_HEIGHT_MM}mm;
          }
        </style>
      </head>
      <body>
        <img src="${labelDataUrl}" alt="" />
      </body>
    </html>
  `;
}