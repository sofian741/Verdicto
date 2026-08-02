import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { JUDGES, type JudgeId, type Lang } from "@/lib/judges";

export function JudgeSelector({
  label,
  value,
  onChange,
  lang,
}: {
  label: string;
  value: JudgeId;
  onChange: (id: JudgeId) => void;
  lang: Lang;
}) {
  return (
    <div>
      <div className="mb-3 px-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-3 sm:grid-cols-3"
      >
        {JUDGES.map((judge) => {
          const copy = judge.locales[lang];
          const active = value === judge.id;
          const Icon = judge.avatar;
          return (
            <button
              key={judge.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(judge.id)}
              className={`group relative flex h-full flex-col rounded-2xl border bg-card p-4 text-start transition ${
                active
                  ? "border-gold shadow-[0_0_0_1px_var(--gold),0_18px_40px_-24px_var(--gold)]"
                  : "border-border hover:-translate-y-0.5 hover:border-gold/40"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="judge-active-ring"
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-gold/60"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-full transition ${
                    active ? judge.accent : "bg-muted text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                    active
                      ? "border-gold bg-gold text-gold-foreground"
                      : "border-border bg-transparent text-transparent"
                  }`}
                  aria-hidden
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              </div>

              <p className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
                {copy.name}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                {copy.specialty}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {copy.shortDescription}
              </p>
              <p className="mt-2 text-[12px] italic leading-snug text-muted-foreground/90">
                &ldquo;{copy.quote}&rdquo;
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {copy.personalityTags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] transition ${
                      active
                        ? "bg-gold/15 text-gold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
