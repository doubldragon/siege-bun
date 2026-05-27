import { useState } from "react";
import type {
  CardEffect,
  CardEffects,
  CardTypeName,
  EffectOperation,
  EffectScope,
  EffectTarget,
  EffectTrigger,
} from "@siege/shared/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const TARGETS: EffectTarget[] = [
  "food", "morale", "melee_attack", "melee_defense", "ranged_defense",
  "siege_attack", "wall_strength", "gate_defense", "movement_speed", "troop_count",
];
const SCOPES: EffectScope[] = ["self", "opponent", "both", "lane", "zone"];
const TRIGGERS: EffectTrigger[] = [
  "on_play", "start_of_turn", "end_of_turn", "on_attack", "on_defend", "on_card_played", "passive",
];
const CARD_TYPES: CardTypeName[] = [
  "Leader", "Castle", "Food", "Morale", "Siege Engine", "Siege Defense", "Espionage", "Troops",
];
const EMPTY_OP: EffectOperation = { target: "food", scope: "self", value: 0 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDefault(kind: CardEffect["kind"]): CardEffect {
  switch (kind) {
    case "instant":
      return { kind, trigger: "on_play", operations: [{ ...EMPTY_OP }] };
    case "persistent":
      return { kind, trigger: "start_of_turn", operations: [{ ...EMPTY_OP }], durationTurns: 1 };
    case "reactive":
      return { kind, trigger: "on_card_played", operations: [{ ...EMPTY_OP }], negates: false };
    case "effect_modifier":
      return { kind, target: "food", affects: "reduce", multiplier: 0, durationTurns: 1 };
  }
}

function summarize(e: CardEffect): string {
  if (e.kind === "effect_modifier") {
    const dur = e.durationTurns != null ? ` for ${e.durationTurns}t` : " (permanent)";
    return `[modifier] ${e.target} · ${e.affects} · ×${e.multiplier}${dur}`;
  }
  const ops = e.operations
    .map((o) => `${o.scope}:${o.target} ${o.value >= 0 ? "+" : ""}${o.value}`)
    .join(", ");
  const dur =
    "durationTurns" in e && e.durationTurns != null ? ` for ${e.durationTurns}t` : "";
  const neg = e.kind === "reactive" && e.negates ? " [negates]" : "";
  return `[${e.kind}] ${e.trigger} → ${ops}${dur}${neg}`;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const sel =
  "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500";
const numInput =
  "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500";
const miniLabel = "block text-[10px] text-slate-500 uppercase tracking-wide mb-0.5";

// ── Operations list ───────────────────────────────────────────────────────────

function OperationsEditor({
  ops,
  onChange,
}: {
  ops: EffectOperation[];
  onChange: (ops: EffectOperation[]) => void;
}) {
  function update(i: number, patch: Partial<EffectOperation>) {
    onChange(ops.map((op, idx) => (idx === i ? { ...op, ...patch } : op)));
  }

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1fr_1fr_5rem_1.5rem] gap-1 text-[10px] text-slate-500 uppercase tracking-wide px-0.5">
        <span>Target</span>
        <span>Scope</span>
        <span>Value</span>
        <span />
      </div>
      {ops.map((op, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_5rem_1.5rem] gap-1 items-center">
          <select
            value={op.target}
            onChange={(e) => update(i, { target: e.target.value as EffectTarget })}
            className={sel}
          >
            {TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={op.scope}
            onChange={(e) => update(i, { scope: e.target.value as EffectScope })}
            className={sel}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={op.value}
            onChange={(e) => update(i, { value: Number(e.target.value) })}
            className={numInput}
          />
          <button
            type="button"
            onClick={() => onChange(ops.filter((_, idx) => idx !== i))}
            className="text-red-400 hover:text-red-300 text-xs text-center"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...ops, { ...EMPTY_OP }])}
        className="text-xs text-sky-400 hover:text-sky-300"
      >
        + Add operation
      </button>
    </div>
  );
}

// ── Single effect editor ──────────────────────────────────────────────────────

function EffectEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: CardEffect;
  onSave: (e: CardEffect) => void;
  onCancel: () => void;
}) {
  const [effect, setEffect] = useState<CardEffect>(initial);

  function changeKind(kind: CardEffect["kind"]) {
    setEffect(makeDefault(kind));
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-sky-500/30 rounded-lg p-3 space-y-3">
      {/* Kind + trigger row */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className={miniLabel}>Kind</label>
          <select
            value={effect.kind}
            onChange={(e) => changeKind(e.target.value as CardEffect["kind"])}
            className={sel}
          >
            <option value="instant">Instant</option>
            <option value="persistent">Persistent</option>
            <option value="reactive">Reactive</option>
            <option value="effect_modifier">Effect Modifier</option>
          </select>
        </div>

        {effect.kind !== "effect_modifier" && (
          <div>
            <label className={miniLabel}>Trigger</label>
            <select
              value={effect.trigger}
              onChange={(e) => {
                const t = e.target.value as EffectTrigger;
                setEffect((prev) => ({ ...prev, trigger: t } as CardEffect));
              }}
              className={sel}
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {(effect.kind === "persistent" || effect.kind === "effect_modifier") && (
          <div>
            <label className={miniLabel}>Duration (turns, blank=∞)</label>
            <input
              type="number"
              min={1}
              value={effect.durationTurns ?? ""}
              placeholder="∞"
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setEffect((prev) => ({ ...prev, durationTurns: v } as CardEffect));
              }}
              className={`w-24 ${numInput}`}
            />
          </div>
        )}

        {effect.kind === "reactive" && (
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer self-end pb-1.5">
            <input
              type="checkbox"
              checked={effect.negates ?? false}
              onChange={(e) =>
                setEffect((prev) => ({
                  ...prev,
                  negates: e.target.checked,
                } as CardEffect))
              }
              className="accent-sky-500"
            />
            Negates triggering card
          </label>
        )}
      </div>

      {/* Effect modifier specifics */}
      {effect.kind === "effect_modifier" && (
        <div className="flex flex-wrap gap-3">
          <div>
            <label className={miniLabel}>Target stat</label>
            <select
              value={effect.target}
              onChange={(e) =>
                setEffect((prev) => ({
                  ...prev,
                  target: e.target.value as EffectTarget,
                } as CardEffect))
              }
              className={sel}
            >
              {TARGETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={miniLabel}>Affects</label>
            <select
              value={effect.affects}
              onChange={(e) =>
                setEffect((prev) => ({
                  ...prev,
                  affects: e.target.value as "reduce" | "increase" | "any",
                } as CardEffect))
              }
              className={sel}
            >
              <option value="reduce">reduce</option>
              <option value="increase">increase</option>
              <option value="any">any</option>
            </select>
          </div>
          <div>
            <label className={miniLabel}>Multiplier (0=block, 2=double)</label>
            <input
              type="number"
              step="0.1"
              value={effect.multiplier}
              onChange={(e) =>
                setEffect((prev) => ({
                  ...prev,
                  multiplier: Number(e.target.value),
                } as CardEffect))
              }
              className={`w-28 ${numInput}`}
            />
          </div>
        </div>
      )}

      {/* Operations */}
      {effect.kind !== "effect_modifier" && (
        <div>
          <label className={miniLabel}>Operations</label>
          <OperationsEditor
            ops={effect.operations}
            onChange={(ops) =>
              setEffect((prev) => ({ ...prev, operations: ops } as CardEffect))
            }
          />
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(effect)}
          className="text-xs bg-sky-500 hover:bg-sky-400 text-white font-semibold px-3 py-1 rounded"
        >
          Save effect
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EffectsEditor({
  value,
  onChange,
}: {
  value: CardEffects | null;
  onChange: (v: CardEffects) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const current: CardEffects = value ?? { effects: [] };

  function patch(partial: Partial<CardEffects>) {
    onChange({ ...current, ...partial });
  }

  function saveEffect(index: number | null, effect: CardEffect) {
    if (index === null) {
      patch({ effects: [...current.effects, effect] });
      setIsAdding(false);
    } else {
      patch({ effects: current.effects.map((e, i) => (i === index ? effect : e)) });
      setEditingIndex(null);
    }
  }

  function removeEffect(index: number) {
    patch({ effects: current.effects.filter((_, i) => i !== index) });
    if (editingIndex === index) setEditingIndex(null);
  }

  const sectionLabel = "text-[10px] text-slate-500 uppercase tracking-wide";

  return (
    <div className="space-y-4">
      {/* Single-use toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 select-none">
        <input
          type="checkbox"
          checked={current.singleUse ?? false}
          onChange={(e) => patch({ singleUse: e.target.checked || undefined })}
          className="accent-sky-500"
        />
        Single use (discard after triggering)
      </label>

      {/* Cost modifiers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={sectionLabel}>Cost Modifiers</span>
          <button
            type="button"
            onClick={() =>
              patch({
                costModifiers: [
                  ...(current.costModifiers ?? []),
                  { targetCardType: "Food", foodCostDelta: -1 },
                ],
              })
            }
            className="text-xs text-sky-400 hover:text-sky-300"
          >
            + Add
          </button>
        </div>
        {(current.costModifiers ?? []).length === 0 && (
          <p className="text-xs text-slate-600">None</p>
        )}
        {(current.costModifiers ?? []).map((mod, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <select
              value={mod.targetCardType}
              onChange={(e) => {
                const next = [...(current.costModifiers ?? [])];
                next[i] = { ...next[i], targetCardType: e.target.value as CardTypeName };
                patch({ costModifiers: next });
              }}
              className={sel}
            >
              {CARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">food cost</span>
            <input
              type="number"
              value={mod.foodCostDelta}
              onChange={(e) => {
                const next = [...(current.costModifiers ?? [])];
                next[i] = { ...next[i], foodCostDelta: Number(e.target.value) };
                patch({ costModifiers: next });
              }}
              className={`w-16 ${numInput}`}
            />
            <button
              type="button"
              onClick={() =>
                patch({
                  costModifiers: (current.costModifiers ?? []).filter((_, idx) => idx !== i),
                })
              }
              className="text-red-400 hover:text-red-300 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Effects list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={sectionLabel}>
            Effects ({current.effects.length})
          </span>
          {!isAdding && editingIndex === null && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              + Add effect
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {current.effects.length === 0 && !isAdding && (
            <p className="text-xs text-slate-600">No effects defined.</p>
          )}

          {current.effects.map((e, i) =>
            editingIndex === i ? (
              <EffectEditor
                key={i}
                initial={e}
                onSave={(updated) => saveEffect(i, updated)}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 gap-2"
              >
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate">
                  {summarize(e)}
                </span>
                <div className="flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingIndex(i);
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEffect(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          )}

          {isAdding && (
            <EffectEditor
              initial={makeDefault("instant")}
              onSave={(e) => saveEffect(null, e)}
              onCancel={() => setIsAdding(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
