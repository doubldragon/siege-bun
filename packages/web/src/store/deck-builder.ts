import { create } from "zustand";
import type { CardTypeName } from "@siege/shared/types";

interface DeckBuilderState {
  isMonarch: boolean | null;
  leaderId: number | null;
  castleId: number | null;
  entries: Map<number, number>;
  searchText: string;
  typeFilters: Set<CardTypeName>;
  editingDeckId: number | null;
  deckName: string;

  setFaction: (isMonarch: boolean) => void;
  setLeader: (leaderId: number) => void;
  setCastle: (castleId: number | null) => void;
  setEntry: (cardId: number, quantity: number) => void;
  removeEntry: (cardId: number) => void;
  setSearchText: (text: string) => void;
  toggleTypeFilter: (type: CardTypeName) => void;
  clearTypeFilters: () => void;
  setDeckName: (name: string) => void;
  loadDeck: (deck: {
    id: number;
    name: string;
    isMonarch: boolean;
    leadId: number;
    castleId: number | null;
    cards: Array<{ cardId: number; quantity: number }>;
  }) => void;
  reset: () => void;
}

const initialState = {
  isMonarch: null as boolean | null,
  leaderId: null as number | null,
  castleId: null as number | null,
  entries: new Map<number, number>(),
  searchText: "",
  typeFilters: new Set<CardTypeName>(),
  editingDeckId: null as number | null,
  deckName: "",
};

export const useDeckBuilderStore = create<DeckBuilderState>((set) => ({
  ...initialState,

  setFaction: (isMonarch) =>
    set({
      isMonarch,
      leaderId: null,
      castleId: null,
      entries: new Map(),
      typeFilters: new Set(),
    }),

  setLeader: (leaderId) => set({ leaderId }),

  setCastle: (castleId) =>
    set((s) => {
      const entries = new Map(s.entries);
      if (s.castleId !== null) entries.delete(s.castleId);
      if (castleId !== null) entries.set(castleId, 1);
      return { castleId, entries };
    }),

  setEntry: (cardId, quantity) =>
    set((s) => {
      const entries = new Map(s.entries);
      if (quantity <= 0) entries.delete(cardId);
      else entries.set(cardId, Math.min(quantity, 3));
      return { entries };
    }),

  removeEntry: (cardId) =>
    set((s) => {
      const entries = new Map(s.entries);
      entries.delete(cardId);
      return { entries };
    }),

  setSearchText: (searchText) => set({ searchText }),

  toggleTypeFilter: (type) =>
    set((s) => {
      const typeFilters = new Set(s.typeFilters);
      if (typeFilters.has(type)) typeFilters.delete(type);
      else typeFilters.add(type);
      return { typeFilters };
    }),

  clearTypeFilters: () => set({ typeFilters: new Set() }),

  setDeckName: (deckName) => set({ deckName }),

  loadDeck: (deck) => {
    const entries = new Map<number, number>();
    for (const e of deck.cards) entries.set(e.cardId, e.quantity);
    set({
      editingDeckId: deck.id,
      deckName: deck.name,
      isMonarch: deck.isMonarch,
      leaderId: deck.leadId,
      castleId: deck.castleId,
      entries,
      searchText: "",
      typeFilters: new Set(),
    });
  },

  reset: () =>
    set({
      ...initialState,
      entries: new Map(),
      typeFilters: new Set(),
    }),
}));
