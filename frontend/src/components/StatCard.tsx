interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: StatCardProps) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        {icon && <span className="text-lg text-gray-400">{icon}</span>}
      </div>
      
      <p className="text-3xl font-semibold text-gray-900">
        {value}
      </p>
      
      {hint && (
        <p className="text-xs text-gray-500 mt-2">
          {hint}
        </p>
      )}
    </div>
  );
}
