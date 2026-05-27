import type { Card } from "@siege/shared/types";

const TYPE_COLORS: Record<string, string> = {
  Leader: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Castle: "bg-blue-900/60 text-blue-300 border-blue-700",
  Food: "bg-green-900/60 text-green-300 border-green-700",
  Morale: "bg-purple-900/60 text-purple-300 border-purple-700",
  "Siege Engine": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Siege Defense": "bg-cyan-900/60 text-cyan-300 border-cyan-700",
  Espionage: "bg-pink-900/60 text-pink-300 border-pink-700",
  Troops: "bg-slate-700/60 text-slate-300 border-slate-600",
};

const ART_BG: Record<string, string> = {
  Monarch: "from-emerald-950 via-slate-800 to-slate-900",
  Invader: "from-orange-950 via-slate-800 to-slate-900",
};

export function CardPreview({ card, scale = 1, noWrapper = false }: { card: Card; scale?: number; noWrapper?: boolean }) {
  const faction = card.isMonarch ? "Monarch" : "Invader";
  const borderColor = card.isMonarch ? "border-emerald-500" : "border-orange-600";
  const factionText = card.isMonarch ? "text-emerald-400" : "text-orange-400";
  const typeBadge = TYPE_COLORS[card.typeName] ?? "bg-slate-700 text-slate-300 border-slate-600";

  const combatStats = [
    card.meleeAttack != null && { label: "ATK", value: card.meleeAttack },
    card.meleeDefense != null && { label: "DEF", value: card.meleeDefense },
    card.rangedDefense != null && { label: "RNG", value: card.rangedDefense },
    card.siegeAttack != null && { label: "SIEGE", value: card.siegeAttack },
  ].filter(Boolean) as { label: string; value: number }[];

  const castleStats = [
    card.wallStrength != null && { label: "WALL", value: card.wallStrength },
    card.sides != null && { label: "LANES", value: card.sides },
  ].filter(Boolean) as { label: string; value: number }[];

  const allStats = [...combatStats, ...castleStats];

  const card_ = (
      <div
        className={`w-64 flex flex-col bg-white dark:bg-slate-900 border-2 ${borderColor} rounded-2xl overflow-hidden shadow-2xl select-none`}
        style={noWrapper && scale !== 1 ? { zoom: scale } : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-3 pt-3 pb-2 gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight truncate">{card.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${typeBadge}`}
              >
                {card.typeName}
              </span>
              <span className={`text-[10px] font-medium ${factionText}`}>{faction}</span>
            </div>
          </div>
          {card.cost != null && (
            <div className="flex flex-col items-center shrink-0">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide">Cost</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{card.cost}</span>
            </div>
          )}
        </div>

        {/* Art */}
        <div className="mx-3 mb-2">
          <div
            className={`h-32 rounded-lg bg-gradient-to-br ${ART_BG[faction]} border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden`}
          >
            {card.typeIcon ? (
              <img src={card.typeIcon} alt={card.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-slate-500 dark:text-slate-600 text-xs">{card.typeName}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        {allStats.length > 0 && (
          <div className="mx-3 mb-2 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className={`grid gap-1 text-center`} style={{ gridTemplateColumns: `repeat(${allStats.length}, 1fr)` }}>
              {allStats.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wide">{label}</p>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules text */}
        <div className="mx-3 mb-2 px-3 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-1 min-h-[4rem]">
          <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-snug">{card.action}</p>
          {card.effect && card.effect !== "None" && (
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-1">{card.effect}</p>
          )}
        </div>

        {/* Flavor + points */}
        <div className="flex items-end justify-between px-3 pt-1 pb-3 gap-2">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] italic leading-snug flex-1">
            &ldquo;{card.flavorText}&rdquo;
          </p>
          {card.deckPoints != null && (
            <span className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0 whitespace-nowrap">
              {card.deckPoints} pts
            </span>
          )}
        </div>
      </div>
  );

  if (noWrapper) return card_;

  return (
    <div className="p-6 rounded-2xl bg-slate-200 dark:bg-slate-800" style={scale !== 1 ? { zoom: scale } : undefined}>
      {card_}
    </div>
  );
}
