import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { api, type AdminCardBody } from "../lib/api";
import type { Card, CardType } from "@siege/shared/types";
import { Modal } from "../components/Modal";
import { CardPreview } from "../components/CardPreview";
import { EffectsEditor } from "../components/EffectsEditor";

const EMPTY_FORM: AdminCardBody = {
  isMonarch: true,
  typeId: 0,
  typeIcon: "",
  name: "",
  deckPoints: null,
  cost: null,
  action: "",
  effect: "",
  flavorText: "",
  selectable: true,
  meleeAttack: null,
  meleeDefense: null,
  rangedDefense: null,
  siegeAttack: null,
  wallStrength: null,
  sides: null,
  effects: null,
};

function CardForm({
  initial,
  cardTypes,
  onSubmit,
  onCancel,
  isSaving,
}: {
  initial: AdminCardBody;
  cardTypes: CardType[];
  onSubmit: (body: AdminCardBody) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<AdminCardBody>(initial);

  const selectedTypeName = cardTypes.find((ct) => ct.id === form.typeId)?.type ?? "";
  const isCastle = selectedTypeName === "Castle";
  const isSiegeType = selectedTypeName === "Siege Engine" || selectedTypeName === "Siege Defense";

  function set<K extends keyof AdminCardBody>(key: K, value: AdminCardBody[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputCls =
    "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500";
  const labelCls = "block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Faction</label>
          <select
            value={form.isMonarch ? "monarch" : "invader"}
            onChange={(e) => set("isMonarch", e.target.value === "monarch")}
            className={inputCls}
          >
            <option value="monarch">Monarch</option>
            <option value="invader">Invader</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={form.typeId || ""}
            onChange={(e) => set("typeId", Number(e.target.value))}
            className={inputCls}
            required
          >
            <option value="">Select type…</option>
            {cardTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Type Icon</label>
          <input
            type="text"
            value={form.typeIcon ?? ""}
            onChange={(e) => set("typeIcon", e.target.value || null)}
            placeholder="optional"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Deck Points</label>
          <input
            type="number"
            value={form.deckPoints ?? ""}
            onChange={(e) =>
              set("deckPoints", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="optional"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Cost</label>
          <input
            type="number"
            value={form.cost ?? ""}
            onChange={(e) =>
              set("cost", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="optional"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Melee Attack</label>
          <input
            type="number"
            value={form.meleeAttack ?? ""}
            onChange={(e) => set("meleeAttack", e.target.value ? Number(e.target.value) : null)}
            placeholder="—"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Melee Defense</label>
          <input
            type="number"
            value={form.meleeDefense ?? ""}
            onChange={(e) => set("meleeDefense", e.target.value ? Number(e.target.value) : null)}
            placeholder="—"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ranged Defense</label>
          <input
            type="number"
            value={form.rangedDefense ?? ""}
            onChange={(e) => set("rangedDefense", e.target.value ? Number(e.target.value) : null)}
            placeholder="—"
            className={inputCls}
          />
        </div>
      </div>

      {isSiegeType && (
        <div>
          <label className={labelCls}>Siege Attack</label>
          <input
            type="number"
            value={form.siegeAttack ?? ""}
            onChange={(e) => set("siegeAttack", e.target.value ? Number(e.target.value) : null)}
            placeholder="—"
            className={inputCls}
          />
        </div>
      )}

      {isCastle && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Wall Strength</label>
            <input
              type="number"
              value={form.wallStrength ?? ""}
              onChange={(e) => set("wallStrength", e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Lanes (sides)</label>
            <input
              type="number"
              min={3}
              max={5}
              value={form.sides ?? ""}
              onChange={(e) => set("sides", e.target.value ? Number(e.target.value) : null)}
              placeholder="3–5"
              className={inputCls}
            />
          </div>
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <label className={labelCls + " mb-3"}>Structured Effects</label>
        <EffectsEditor
          value={form.effects ?? null}
          onChange={(v) => set("effects", v)}
        />
      </div>

      <div>
        <label className={labelCls}>Action</label>
        <textarea
          value={form.action}
          onChange={(e) => set("action", e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Effect</label>
        <textarea
          value={form.effect}
          onChange={(e) => set("effect", e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Flavor Text</label>
        <textarea
          value={form.flavorText}
          onChange={(e) => set("flavorText", e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.selectable}
          onChange={(e) => set("selectable", e.target.checked)}
          className="w-4 h-4 accent-sky-500"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">Selectable in deck builder</span>
      </label>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || !form.typeId || !form.name}
          className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-semibold rounded"
        >
          {isSaving ? "Saving…" : "Save Card"}
        </button>
      </div>
    </form>
  );
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; card: Card }
  | null;

export function AdminCardsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [tab, setTab] = useState<"monarch" | "invader">("monarch");

  const authLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.isAdmin === true;

  // All hooks must run unconditionally — guard is after
  const { data: cardTypes = [], error: typesError } = useQuery({
    queryKey: ["admin", "card-types"],
    queryFn: api.admin.cardTypes,
    enabled: isAdmin,
  });

  const {
    data: cards = [],
    isLoading,
    error: cardsError,
  } = useQuery({
    queryKey: ["admin", "cards"],
    queryFn: api.admin.cards.list,
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: api.admin.cards.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      setModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminCardBody }) =>
      api.admin.cards.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      setModal(null);
    },
  });

  const toggleSelectableMutation = useMutation({
    mutationFn: ({ card }: { card: Card }) =>
      api.admin.cards.update(card.id, {
        isMonarch: card.isMonarch,
        typeId: card.typeId,
        typeIcon: card.typeIcon,
        name: card.name,
        deckPoints: card.deckPoints,
        cost: card.cost,
        action: card.action,
        effect: card.effect,
        flavorText: card.flavorText,
        selectable: !card.selectable,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.admin.cards.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      setDeleteConfirm(null);
    },
  });

  if (authLoading) return null;
  if (!isAdmin) {
    navigate({ to: "/" });
    return null;
  }

  function handleSubmit(body: AdminCardBody) {
    if (modal?.mode === "edit") {
      updateMutation.mutate({ id: modal.card.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError =
    createMutation.error?.message ?? updateMutation.error?.message ?? null;

  const monarchCards = cards.filter((c) => c.isMonarch);
  const invaderCards = cards.filter((c) => !c.isMonarch);
  const apiError = typesError?.message ?? cardsError?.message ?? null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <Link to="/admin" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm">← Admin</Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin — Cards</h1>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm px-4 py-2 rounded"
        >
          + Add Card
        </button>
      </div>

      {apiError && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-6">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <div>
          <div className="flex gap-1 mb-4 border-b border-slate-200 dark:border-slate-700">
            {(["monarch", "invader"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t === "monarch" ? `Monarch (${monarchCards.length})` : `Invader (${invaderCards.length})`}
              </button>
            ))}
          </div>
          {(() => {
            const rows = tab === "monarch" ? monarchCards : invaderCards;
            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-2">ID</th>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-right px-4 py-2">Pts</th>
                      <th className="text-right px-4 py-2">Cost</th>
                      <th className="text-right px-4 py-2">Selectable</th>
                      <th className="text-right px-4 py-2">Preview</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-2 text-slate-400 dark:text-slate-500">{card.id}</td>
                        <td className="px-4 py-2 text-slate-900 dark:text-white font-medium">
                          <button className="cursor-pointer" onClick={() => setModal({ mode: "edit", card })}>

                            {card.name}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                          {card.typeName}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-300">
                          {card.deckPoints ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-300">
                          {card.cost ?? "—"}
                        </td>
                        
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => toggleSelectableMutation.mutate({ card })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${card.selectable ? "bg-sky-500" : "bg-slate-600"}`}
                          >
                            <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${card.selectable ? "translate-x-5" : "translate-x-1"}`} />
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => setPreviewCard(card)}
                            className="text-slate-400 hover:text-white"
                            title="Preview card"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setModal({ mode: "edit", card })}
                              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs"
                            >
                              Edit
                            </button>
                            {deleteConfirm === card.id ? (
                              <span className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteMutation.mutate(card.id)}
                                  className="text-red-400 hover:text-red-300 text-xs font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-slate-500 hover:text-slate-300 text-xs"
                                >
                                  Cancel
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(card.id)}
                                className="text-slate-400 dark:text-slate-500 hover:text-red-400 text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          No cards yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {modal.mode === "edit" ? `Edit: ${modal.card.name}` : "New Card"}
            </h2>

            {mutationError && (
              <p className="text-red-400 text-sm mb-4">{mutationError}</p>
            )}

            <CardForm
              initial={
                modal.mode === "edit"
                  ? {
                      isMonarch: modal.card.isMonarch,
                      typeId: modal.card.typeId,
                      typeIcon: modal.card.typeIcon,
                      name: modal.card.name,
                      deckPoints: modal.card.deckPoints,
                      cost: modal.card.cost,
                      action: modal.card.action,
                      effect: modal.card.effect,
                      flavorText: modal.card.flavorText,
                      selectable: modal.card.selectable,
                      meleeAttack: modal.card.meleeAttack,
                      meleeDefense: modal.card.meleeDefense,
                      rangedDefense: modal.card.rangedDefense,
                      siegeAttack: modal.card.siegeAttack,
                      wallStrength: modal.card.wallStrength,
                      sides: modal.card.sides,
                      effects: modal.card.effects,
                    }
                  : EMPTY_FORM
              }
              cardTypes={cardTypes}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              isSaving={isSaving}
            />
          </div>
        </Modal>
      )}

      {previewCard && (
        <Modal onClose={() => setPreviewCard(null)}>
          <CardPreview card={previewCard} />
        </Modal>
      )}
    </main>
  );
}
