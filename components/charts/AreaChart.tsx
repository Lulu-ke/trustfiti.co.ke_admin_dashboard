import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartAreaProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  className?: string;
}

export default function ChartArea({ title, data, color = "#10B981", className }: ChartAreaProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className || ""}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#colorGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
