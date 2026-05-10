import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartLineProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  className?: string;
}

export default function ChartLine({ title, data, color = "#10B981", className }: ChartLineProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className || ""}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
