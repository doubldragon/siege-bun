import type { Card, DeckDetail, AuthUser } from "@siege/shared/types";

export type CreateDeckBody = {
  name: string;
  leadId: number;
  isMonarch: boolean;
  cards: Array<{ cardId: number; quantity: number }>;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  cards: {
    list: (isMonarch?: boolean) =>
      apiFetch<Card[]>(
        `/api/cards${isMonarch !== undefined ? `?isMonarch=${isMonarch}` : ""}`
      ),
  },
  decks: {
    list: () => apiFetch<DeckDetail[]>("/api/decks"),
    recent: () => apiFetch<DeckDetail[]>("/api/decks/recent"),
    get: (id: number) => apiFetch<DeckDetail>(`/api/decks/${id}`),
    create: (body: CreateDeckBody) =>
      apiFetch<DeckDetail>("/api/decks", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: CreateDeckBody) =>
      apiFetch<DeckDetail>(`/api/decks/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/api/decks/${id}`, {
        method: "DELETE",
      }),
  },
  user: {
    me: () => apiFetch<AuthUser>("/api/user"),
  },
};
