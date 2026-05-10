import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 bg-gray-100 p-1 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === tab.key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn("ml-2 text-xs", activeTab === tab.key ? "text-emerald-600" : "text-gray-400")}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
