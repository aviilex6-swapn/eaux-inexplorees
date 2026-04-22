import Link from "next/link";
import type { CrewMember } from "@/lib/types";
import { XpBar } from "@/components/ui/XpBar";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface CrewMemberCardProps {
  member: CrewMember;
  compact?: boolean;
}

export function CrewMemberCard({ member, compact = false }: CrewMemberCardProps) {
  const isCapitain = member.role.toLowerCase().includes("capitaine");

  return (
    <div
      className={`panel p-3 transition-all duration-200 hover:border-gold/30 hover:shadow-gold-sm ${
        isCapitain ? "border-gold/20 bg-gradient-to-br from-gold/5 to-transparent" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar / emoji */}
        <div
          className={`flex-shrink-0 flex items-center justify-center rounded-full text-lg ${
            compact ? "w-8 h-8" : "w-10 h-10"
          }`}
          style={{
            background: isCapitain
              ? "linear-gradient(135deg, rgba(232,168,56,0.3), rgba(232,168,56,0.1))"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${isCapitain ? "rgba(232,168,56,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          {member.humeur}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-cinzel font-semibold ${compact ? "text-xs" : "text-sm"} ${
                isCapitain ? "text-gold" : "text-cream-DEFAULT"
              }`}
            >
              {member.nom}
            </span>
            {isCapitain && (
              <span className="label-pixel text-gold/70 text-[7px] border border-gold/30 px-1 rounded">
                ⚓ CAP.
              </span>
            )}
          </div>
          <p className="label-pixel text-cream-muted text-[8px] truncate">{member.role}</p>

          {!compact && (
            <div className="mt-2">
              <XpBar xp={member.xp} xpMax={member.xp_max} level={member.niveau} />
            </div>
          )}
        </div>

        {compact && (
          <span className="label-pixel text-gold text-[8px] flex-shrink-0">
            Niv.{member.niveau}
          </span>
        )}
      </div>

      {!compact && member.competence && (
        <p className="label-pixel text-cream-muted/60 text-[8px] mt-2 pl-1 border-l border-white/10">
          {member.competence}
        </p>
      )}
    </div>
  );
}

interface CrewPanelProps {
  crew: CrewMember[];
}

export function CrewPanel({ crew }: CrewPanelProps) {
  return (
    <div>
      <SectionHeader title="Équipage" icon="👥" />
      <div className="space-y-2">
        {crew.map((member) => (
          <CrewMemberCard key={member.id} member={member} compact />
        ))}
      </div>
      <Link
        href="/equipage"
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 hover:border-gold/30 transition-colors group"
      >
        <span className="label-pixel text-cream-muted text-[8px] group-hover:text-gold transition-colors">
          {"VOIR L'ÉQUIPAGE COMPLET"}
        </span>
        <span className="text-xs text-gold">→</span>
      </Link>
    </div>
  );
}
