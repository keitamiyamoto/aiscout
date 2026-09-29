import type { ComponentProps, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "accent"; size?: "sm" | "md" | "lg" };

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-150 active:translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
        size === "sm" && "px-3.5 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        variant === "primary" && "bg-leaf-600 text-white hover:bg-leaf-700",
        variant === "accent" && "border-2 border-leaf-600 bg-sun-500 text-leaf-700 hover:brightness-95",
        variant === "secondary" && "border border-sand-300 bg-white text-ink-900 hover:border-ink-300 hover:bg-sand-50",
        variant === "ghost" && "text-ink-700 hover:bg-sand-100",
        variant === "danger" && "border border-coral-100 bg-white text-coral-600 hover:bg-coral-100/60",
        className,
      )}
    />
  );
}

const control =
  "rounded-xl border border-sand-300 bg-white text-base text-ink-900 placeholder:text-ink-300 transition-shadow focus:border-leaf-600 focus:outline-none focus:ring-4 focus:ring-leaf-100 disabled:bg-sand-100";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input {...rest} className={cx("w-full px-3.5 py-2.5", control, className)} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea {...rest} className={cx("w-full px-3.5 py-2.5 leading-relaxed", control, className)} />;
}

export function Select({ className, auto, ...rest }: ComponentProps<"select"> & { auto?: boolean }) {
  return <select {...rest} className={cx(auto ? "w-auto" : "w-full", "px-3.5 py-2.5", control, className)} />;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink-700">
        {label}
        {required && (
          <span className="text-coral-600" aria-label="必須">
            *
          </span>
        )}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-medium text-coral-600">{error}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-lg border border-sand-200 bg-white p-6 shadow-soft", className)}>{children}</div>;
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "indigo" | "green" | "sun" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "gray" && "bg-sand-100 text-ink-700",
        tone === "indigo" && "bg-ink-900 text-white",
        tone === "green" && "bg-leaf-100 text-leaf-800",
        tone === "sun" && "bg-sun-100 text-ink-900",
      )}
    >
      {children}
    </span>
  );
}

/** 処理中のマスク。画面全体を覆い、連打や二重送信を防ぐ。 */
export function BusyOverlay({ show, label = "処理中です…" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-sand-50/75 backdrop-blur-[2px]" role="status" aria-live="polite" aria-busy="true">
      <div className="rise-in flex flex-col items-center gap-3 rounded-lg border border-sand-200 bg-white px-10 py-7 shadow-pop">
        <div className="spinner" />
        <p className="text-sm font-semibold text-ink-900">{label}</p>
      </div>
    </div>
  );
}

/** セクション見出し (丸ゴシック) */
export function Heading({ as: Tag = "h1", className, children }: { as?: "h1" | "h2" | "h3"; className?: string; children: ReactNode }) {
  return <Tag className={cx("font-display font-bold tracking-tight text-ink-900", className)}>{children}</Tag>;
}
