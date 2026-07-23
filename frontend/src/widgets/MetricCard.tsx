import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          {icon}
        </div>
      )}
    </div>
  );
}
