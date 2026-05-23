import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { api, type AdminCardBody } from "../lib/api";
import type { Card, CardType } from "@siege/shared/types";

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

  function set<K extends keyof AdminCardBody>(key: K, value: AdminCardBody[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputCls =
    "w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500";
  const labelCls = "block text-xs text-slate-400 uppercase tracking-wide mb-1";

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
          className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-semibold rounded"
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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
        <h1 className="text-xl font-bold text-white">Admin — Cards</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded"
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
        <div className="space-y-8">
          {[
            { label: "Monarch", rows: monarchCards },
            { label: "Invader", rows: invaderCards },
          ].map(({ label, rows }) => (
            <section key={label}>
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                {label} ({rows.length})
              </h2>
              <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-2">ID</th>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-right px-4 py-2">Pts</th>
                      <th className="text-right px-4 py-2">Cost</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-2 text-slate-500">{card.id}</td>
                        <td className="px-4 py-2 text-white font-medium">
                          {card.name}
                        </td>
                        <td className="px-4 py-2 text-slate-300">
                          {card.typeName}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-300">
                          {card.deckPoints ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-300">
                          {card.cost ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setModal({ mode: "edit", card })}
                              className="text-slate-400 hover:text-white text-xs"
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
                                className="text-slate-500 hover:text-red-400 text-xs"
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
                          colSpan={6}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          No cards yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-6">
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
                    }
                  : EMPTY_FORM
              }
              cardTypes={cardTypes}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}
    </main>
  );
}
