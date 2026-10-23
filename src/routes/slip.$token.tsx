import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Printer, Volume2, Maximize2, ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Btn, btn } from "@/components/kit";
import { QR, useQrDataUrl } from "@/components/QR";
import { useT, fmtTime } from "@/lib/i18n";
import { etaFor, findEntry, peopleAhead, useQueue } from "@/lib/store";
import { speak } from "@/lib/browser";
import { deptById } from "@/data/departments";
import { placeById } from "@/data/hospital";
import { pageHead } from "@/lib/head";
import type { Key } from "@/i18n/en";

export const Route = createFileRoute("/slip/$token")({
  head: pageHead("OPD slip", "Your printable OPD token slip with QR code."),
  component: SlipPage,
});

export function NotFoundToken() {
  const { t } = useT();
  return (
    <div className="tile p-6">
      <h1 className="text-2xl">{t("slip.notFound")}</h1>
      <p className="mt-2">{t("slip.notFoundD")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to="/have-slip" className={btn({ v: "outline" })}>{t("nav.slip")}</Link>
        <Link to="/register" className={btn()}>{t("nav.register")}</Link>
      </div>
    </div>
  );
}

function SlipPage() {
  const { token } = Route.useParams();
  const { t, l, lang } = useT();
  const s = useQueue();
  const [big, setBig] = useState(false);
  const e = findEntry(s, token);
  const qrText = typeof window !== "undefined" ? `${window.location.origin}/turn/${token}` : `/turn/${token}`;
  const qrUrl = useQrDataUrl(qrText);
  if (!e) return <AppShell><NotFoundToken /></AppShell>;
  const dept = deptById(e.dept)!; const room = placeById(dept.placeId)!;
  const ahead = peopleAhead(s, token); const eta = etaFor(s, token, Date.now());
  const floor = t(`floor.${room.floor}` as Key);
  const rows: [Key, string][] = [["slip.name", e.name], ["slip.dept", l(dept.name)], ["slip.room", String(dept.room)], ["slip.floor", floor], ["slip.doctor", dept.doctor], ["slip.ahead", String(ahead)], ["slip.wait", t("c.about", { n: eta })]];

  const save = () => {
    try {
      const c = document.createElement("canvas"); c.width = 600; c.height = 900;
      const g = c.getContext("2d")!; g.fillStyle = "#fff"; g.fillRect(0, 0, 600, 900);
      g.fillStyle = "#C62020"; g.fillRect(0, 0, 600, 16);
      g.fillStyle = "#141414"; g.font = "bold 30px Helvetica, Arial"; g.fillText("OPD Saathi · City District Hospital", 40, 70);
      g.font = "16px monospace"; g.fillText(t("slip.token").toUpperCase(), 40, 120);
      g.font = "bold 96px monospace"; g.fillText(token, 40, 210);
      g.font = "22px Helvetica, Arial";
      rows.forEach(([k, v], i) => { g.fillStyle = "#555"; g.fillText(t(k), 40, 270 + i * 50); g.fillStyle = "#141414"; g.fillText(v, 300, 270 + i * 50); });
      const done = () => { const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `OPD-slip-${token}.png`; a.click(); toast(t("slip.saved")); };
      if (qrUrl) { const im = new Image(); im.onload = () => { g.drawImage(im, 200, 640, 200, 200); done(); }; im.src = qrUrl; } else done();
    } catch { toast(t("slip.saveFail")); }
  };
  const read = () => { if (!speak(`${t("slip.token")} ${token}. ${rows.map(([k, v]) => `${t(k)}: ${v}`).join(". ")}`, lang)) toast(t("read.none")); };

  return (
    <AppShell>
      <article className="print-slip relative overflow-hidden rounded-md border-2 border-foreground bg-background">
        <div className="h-3 bg-primary" />
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><p className="font-display text-lg font-bold">OPD <span className="text-primary">Saathi</span></p><p className="eyebrow">{t("app.hospital")}</p></div>
            <p className="eyebrow">{t("slip.issued")} {fmtTime(e.createdAt)}</p>
          </div>
          <p className="eyebrow mt-6">{t("slip.token")}</p>
          <p className={big ? "token-type text-7xl sm:text-9xl" : "token-type text-6xl sm:text-7xl"}>{token}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
            <dl className="divide-y divide-border border-y border-border">
              {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2"><dt className="text-muted-foreground">{t(k)}</dt><dd className="text-right font-display font-bold">{v}</dd></div>)}
            </dl>
            <div className="flex flex-col items-center gap-2"><QR text={qrText} label={`QR ${token}`} /><p className="max-w-40 text-center text-xs text-muted-foreground">{t("slip.qr")}</p></div>
          </div>
        </div>
      </article>
      <div className="no-print mt-5 grid gap-3 sm:grid-cols-2">
        <Link to="/turn/$token" params={{ token }} className={btn({ v: "primary", size: "lg" })}>{t("slip.viewTurn")}<ArrowRight className="size-5" aria-hidden /></Link>
        <Link to="/find-place" search={{ to: dept.placeId }} className={btn({ v: "ink", size: "lg" })}><MapPin className="size-5" aria-hidden />{t("slip.findRoom")}</Link>
      </div>
      <div className="no-print mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Btn v="outline" size="sm" onClick={save}><Download className="size-4" aria-hidden />{t("slip.save")}</Btn>
        <Btn v="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" aria-hidden />{t("slip.print")}</Btn>
        <Btn v="outline" size="sm" onClick={read}><Volume2 className="size-4" aria-hidden />{t("read.btn")}</Btn>
        <Btn v="outline" size="sm" aria-pressed={big} onClick={() => setBig(!big)}><Maximize2 className="size-4" aria-hidden />{t("slip.enlarge")}</Btn>
      </div>
    </AppShell>
  );
}
