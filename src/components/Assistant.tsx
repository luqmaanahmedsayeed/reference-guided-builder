import { useState } from "react";
import { Bot, Send, Square } from "lucide-react";
import { useT } from "@/lib/i18n";
import { LOCALE, speak, speechRecognitionCtor } from "@/lib/browser";
import { Btn } from "@/components/kit";
import { toast } from "sonner";

export function Assistant() {
  const { lang, t } = useT();
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const ask = async () => {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, language: lang }) });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) { toast(data.error ?? t("assistant.unavailable")); return; }
      setAnswer(data.answer);
      setMessage("");
    } catch { toast(t("assistant.unavailable")); }
    finally { setBusy(false); }
  };
  const listen = () => {
    const Ctor = speechRecognitionCtor();
    if (!Ctor) { toast(t("mic.unsupported")); return; }
    const recognition = new Ctor();
    recognition.lang = LOCALE[lang];
    recognition.interimResults = false;
    recognition.onresult = (event: any) => setMessage(event.results[0][0].transcript.trim());
    recognition.onerror = () => toast(t("mic.unsupported"));
    try { recognition.start(); } catch { toast(t("mic.unsupported")); }
  };
  const readAnswer = () => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    if (!answer || !speak(answer, lang)) { toast(t("read.none")); return; }
    setSpeaking(true);
    window.speechSynthesis?.addEventListener("end", () => setSpeaking(false), { once: true });
    window.speechSynthesis?.addEventListener("error", () => setSpeaking(false), { once: true });
  };
  return <section className="mt-8 rounded-md border-2 border-foreground bg-secondary p-5" aria-labelledby="assistant-title">
    <div className="flex items-start gap-3"><Bot className="mt-1 size-7 text-primary" aria-hidden /><div><h2 id="assistant-title" className="text-xl">{t("assistant.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("assistant.desc")}</p></div></div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) void ask(); }} placeholder={t("assistant.placeholder")} aria-label={t("assistant.placeholder")} maxLength={800} className="min-h-14 min-w-0 flex-1 rounded-md border-2 border-foreground bg-background px-4 text-base" /><Btn type="button" v="outline" onClick={listen} aria-label={t("mic.start")} className="sm:w-14 sm:px-0"><span className="sr-only">{t("mic.start")}</span>Mic</Btn><Btn type="button" onClick={() => void ask()} disabled={busy || !message.trim()} aria-label={t("assistant.ask")} className="sm:w-14 sm:px-0"><Send className="size-5" aria-hidden /><span className="sr-only">{t("assistant.ask")}</span></Btn></div>
    {answer && <div className="mt-4 border-l-4 border-primary bg-background p-4"><p className="text-base leading-relaxed">{answer}</p><Btn type="button" v="quiet" size="sm" onClick={readAnswer} className="mt-3">{speaking ? <Square className="size-4" aria-hidden /> : null}{speaking ? t("read.stop") : t("read.btn")}</Btn></div>}
  </section>;
}
