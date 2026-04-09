interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  gradient?: 'primary' | 'accent' | 'success' | 'warning';
}

const gradients = {
  primary: 'from-primary/20 to-primary-dark/10',
  accent: 'from-accent-light/20 to-accent/10',
  success: 'from-success/20 to-success/5',
  warning: 'from-warning/20 to-warning/5',
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  gradient = 'primary',
}: StatCardProps) {
  return (
    <div className={`card-hover group relative overflow-hidden bg-gradient-to-br ${gradients[gradient]} border border-primary/20 hover:border-primary/60`}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
            {label}
          </p>
          {icon && <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform">{icon}</span>}
        </div>
        
        <p className="font-serif-display text-4xl lg:text-5xl bg-gradient-to-r from-primary via-primary to-accent-light bg-clip-text text-transparent group-hover:via-accent-light transition-all duration-500">
          {value}
        </p>
        
        {hint && (
          <p className="text-text-secondary text-sm mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
            ↳ {hint}
          </p>
        )}
      </div>

      {/* Accent border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
