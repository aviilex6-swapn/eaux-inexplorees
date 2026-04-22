interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="font-cinzel text-gold text-sm font-semibold tracking-widest uppercase">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="label-pixel text-cream-muted mt-1 ml-0.5">{subtitle}</p>
      )}
      <div className="mt-2 h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
    </div>
  );
}
