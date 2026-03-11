"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cx("border border-slate-200 bg-white/90", className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cx("px-6 pt-6", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cx("px-6 pb-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx("text-xl font-semibold text-slate-900", className)} {...props} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
};

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "border-slate-900 bg-slate-900 text-white hover:bg-slate-800",
  secondary: "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-600",
  outline: "border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100"
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
};

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-transparent bg-slate-900 text-white",
  secondary: "border-transparent bg-slate-100 text-slate-800",
  outline: "border-slate-300 bg-white text-slate-700"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", badgeVariants[variant], className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500",
        className
      )}
      {...props}
    />
  );
}

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cx("overflow-hidden rounded-full bg-slate-200", className)}>
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  className,
  children
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useMemo(() => ({ value, onValueChange }), [onValueChange, value]);
  return (
    <TabsContext.Provider value={context}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("gap-2 border border-slate-200 bg-white/85 p-2", className)} {...props} />;
}

export function TabsTrigger({
  value,
  className,
  children
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) return null;
  const active = context.value === value;

  return (
    <button
      type="button"
      className={cx(
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active ? "bg-slate-900 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100",
        className
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div className={className}>{children}</div>;
}

type AccordionContextValue = {
  openItem: string | null;
  setOpenItem: React.Dispatch<React.SetStateAction<string | null>>;
  collapsible: boolean;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

export function Accordion({
  type,
  collapsible = false,
  className,
  children
}: {
  type: "single";
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const context = useMemo(() => ({ openItem, setOpenItem, collapsible }), [collapsible, openItem]);

  return (
    <AccordionContext.Provider value={context}>
      <div className={cx("space-y-3", className)} data-type={type}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cx("rounded-2xl border border-slate-200 bg-white/80", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(AccordionContext);
  const itemValue = useContext(AccordionItemContext);
  if (!context || !itemValue) return null;
  const open = context.openItem === itemValue;

  return (
    <button
      type="button"
      className={cx("flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900", className)}
      onClick={() =>
        context.setOpenItem((current) => {
          if (current === itemValue) return context.collapsible ? null : current;
          return itemValue;
        })
      }
    >
      <span>{children}</span>
      <span className="text-slate-400">{open ? "−" : "+"}</span>
    </button>
  );
}

export function AccordionContent({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(AccordionContext);
  const itemValue = useContext(AccordionItemContext);
  if (!context || !itemValue || context.openItem !== itemValue) return null;

  return <div className={cx("px-4 pb-4 text-sm leading-6 text-slate-700", className)}>{children}</div>;
}
