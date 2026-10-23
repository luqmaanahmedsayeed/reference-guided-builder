import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function useQrDataUrl(text: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { QRCode.toDataURL(text, { margin: 1, width: 320, color: { dark: "#141414", light: "#FFFFFF" } }).then(setUrl).catch(() => setUrl(null)); }, [text]);
  return url;
}

export function QR({ text, label }: { text: string; label: string }) {
  const url = useQrDataUrl(text);
  return url ? <img src={url} alt={label} className="size-36 border border-border" /> : <div className="size-36 bg-muted" aria-label={label} />;
}
