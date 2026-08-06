"use client";

import React from "react";
import { Icon } from "@workspace/ui";
import { icons } from "lucide-react";
import { cn } from "@workspace/utils";

export interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof icons;
  badge?: React.ReactNode;
  fields?: MobileCardField[];
  footerAction?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  icon,
  badge,
  fields,
  footerAction,
  onClick,
  className,
}: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-xs space-y-3 transition-all",
        onClick && "cursor-pointer active:scale-[0.99] hover:border-primary/40",
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon name={icon as any} className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Key-Value Fields Grid */}
      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t text-xs">
          {fields.map((f, idx) => (
            <div key={idx} className="space-y-0.5 min-w-0">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider truncate">
                {f.label}
              </p>
              <div className="text-xs font-semibold text-foreground truncate">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Action Row */}
      {footerAction && (
        <div className="pt-2 border-t flex items-center justify-end text-xs">
          {footerAction}
        </div>
      )}
    </div>
  );
}
