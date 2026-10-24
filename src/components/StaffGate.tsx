import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn } from "@/components/kit";

const STAFF_SESSION_KEY = "sahai-setu-staff-unlocked";
const DEMO_PASSWORD = "STAFF-ONLY"; // Frontend-only demo gate; replace with real authentication before production.

export function lockStaffSession() {
  sessionStorage.removeItem(STAFF_SESSION_KEY);
}

export function StaffGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STAFF_SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const unlock = (event: FormEvent) => {
    event.preventDefault();
    if (password !== DEMO_PASSWORD) {
      setError(true);
      return;
    }
    sessionStorage.setItem(STAFF_SESSION_KEY, "true");
    setUnlocked(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl tile border-2 border-primary p-6 sm:p-8">
        <LockKeyhole className="text-primary" aria-hidden />
        <p className="eyebrow mt-5">Staff access</p>
        <h1 className="mt-1 text-3xl">Hospital staff screens (demo)</h1>
        <p className="mt-3 text-muted-foreground">This demonstration area is for hospital staff workflows.</p>
        <form onSubmit={unlock} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 font-display font-bold" htmlFor="staff-password">
            Demo password
            <span className="flex min-h-12 items-center border-2 border-foreground px-3 focus-within:border-primary">
              <input id="staff-password" autoFocus type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} className="min-w-0 flex-1 bg-transparent outline-none" aria-invalid={error} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="p-2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </button>
            </span>
          </label>
          {error && <p role="alert" className="text-sm font-bold text-primary">Incorrect password. Please try again.</p>}
          <Btn type="submit">Unlock staff screens</Btn>
        </form>
        <Link to="/home" className="mt-6 inline-flex font-display font-bold underline underline-offset-4">Return to patient app</Link>
      </div>
    </AppShell>
  );
}
