import React from "react";
import { cn, formatNumber } from "@/lib/utils";

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color: "emerald" | "blue" | "amber" | "red" | "purple" | "gray";
}

const colorStyles = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-red-600 border-red-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  gray: "bg-gray-50 text-gray-600 border-gray-100",
};

const iconBgStyles = {
  emerald: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  purple: "bg-purple-100 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
};

interface StatsGridProps {
  stats: Stat[];
  className?: string;
}

export default function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn("rounded-xl border p-5 transition-shadow hover:shadow-md", colorStyles[stat.color])}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-70">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">
                {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
              </p>
            </div>
            <div className={cn("p-2.5 rounded-lg", iconBgStyles[stat.color])}>
              {stat.icon}
            </div>
          </div>
          {stat.change !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium",
                  stat.change >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {stat.change >= 0 ? "+" : ""}{stat.change}%
              </span>
              {stat.changeLabel && <span className="text-xs opacity-50">{stat.changeLabel}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
