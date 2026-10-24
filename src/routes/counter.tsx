import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Printer, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Btn, DeptGrid, PageTitle } from "@/components/kit";
import { createToken } from "@/lib/store";
import type { DeptId } from "@/data/departments";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/counter")({
  head: pageHead("Registration counter", "Register a visitor who has no smartphone."),
  component: CounterPage,
});
function CounterPage() {
  const { t } = useT();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [dept, setDept] = useState<DeptId>();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(age);
    if (!name.trim() || !Number.isInteger(n) || n < 0 || n > 120 || !dept) {
      setError(t("reg.ageE"));
      return;
    }
    setToken(createToken({ name: name.trim(), age: n, gender, dept }));
    setError("");
  };
  const reset = () => {
    setToken("");
    setName("");
    setAge("");
    setGender("male");
    setDept(undefined);
  };
  return (
    <AppShell staff>
      <PageTitle
        aside={
          <Link to="/staff" className="inline-flex items-center gap-2 font-display font-bold">
            <ArrowLeft aria-hidden />
            {t("counter.back")}
          </Link>
        }
      >
        {t("counter.title")}
      </PageTitle>
      {token ? (
        <div className="tile p-6">
          <p className="eyebrow">{t("counter.done", { token })}</p>
          <p className="token-type mt-3 text-6xl">{token}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/slip/$token"
              params={{ token }}
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-5 font-display font-bold text-primary-foreground"
            >
              {t("counter.openSlip")}
            </Link>
            <Btn v="outline" onClick={() => window.print()}>
              <Printer aria-hidden />
              {t("counter.print")}
            </Btn>
            <Btn v="quiet" onClick={reset}>
              <UserPlus aria-hidden />
              {t("counter.another")}
            </Btn>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 font-display font-bold">
            {t("reg.fName")}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-12 border-2 border-foreground bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-2 font-display font-bold">
            {t("reg.fAge")}
            <input
              required
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="min-h-12 border-2 border-foreground bg-background px-3"
            />
          </label>
          <fieldset>
            <legend className="font-display font-bold">{t("reg.fGender")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["male", "g.male"],
                  ["female", "g.female"],
                  ["other", "g.other"],
                ] as const
              ).map(([v, k]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setGender(v)}
                  className={`min-h-12 border-2 px-4 font-display font-bold ${gender === v ? "border-primary bg-secondary" : "border-foreground"}`}
                >
                  {t(k)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-display font-bold">{t("reg.dept")}</legend>
            <div className="mt-2">
              <DeptGrid compact value={dept} onChange={setDept} />
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="font-bold text-primary">
              {error}
            </p>
          )}
          <Btn type="submit">{t("counter.create")}</Btn>
        </form>
      )}
    </AppShell>
  );
}
