import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type DiaryKind = "SOLO" | "SHARED" | "FAVORITE";
export type DiaryColor = "red" | "mint" | "yellow" | "lavender" | "blue" | "orange";

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface PlacedText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontId?: string;
}

export type PhotoFrame = "none" | "polaroid" | "rounded" | "circle" | "sticker" | "tape";

export interface PlacedPhoto {
  id: string;
  uri: string;
  x: number;
  y: number;
  widthPct: number;
  aspectRatio: number;
  scale: number;
  rotation: number;
  frame: PhotoFrame;
}

export type PaperPattern = "plain" | "grid" | "dotted" | "lined";

export interface DiaryEntry {
  id: string;
  diaryId: string;
  createdAt: string;
  title?: string;
  body: string;
  mood?: string;
  photoUri?: string;
  videoUri?: string;
  isVideo?: boolean;
  bgColor?: string;
  paperPattern?: PaperPattern;
  stickers: PlacedSticker[];
  texts: PlacedText[];
  photos?: PlacedPhoto[];
}

export interface Diary {
  id: string;
  name: string;
  kind: DiaryKind;
  color: DiaryColor;
  members: string[];
  createdAt: string;
  coverNumber?: string;
}

interface DiariesContextType {
  diaries: Diary[];
  entries: DiaryEntry[];
  loading: boolean;
  addDiary: (d: Omit<Diary, "id" | "createdAt" | "members"> & { members?: string[] }) => Promise<Diary>;
  updateDiary: (id: string, updates: Partial<Diary>) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getDiary: (id: string) => Diary | undefined;
  getEntriesForDiary: (id: string) => DiaryEntry[];
}

const DiariesContext = createContext<DiariesContextType | null>(null);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const now = new Date().toISOString();

const starterDiaries: Diary[] = [
  { id: "solo-demo", name: "260529", kind: "SOLO", color: "red", members: ["me"], createdAt: now, coverNumber: "260529" },
  { id: "shared-demo", name: "우리의 봄날", kind: "SHARED", color: "mint", members: ["me", "friend"], createdAt: now },
  { id: "favorite-demo", name: "좋아하는 기록", kind: "FAVORITE", color: "lavender", members: ["me"], createdAt: now },
];

const starterEntries: DiaryEntry[] = [
  {
    id: "entry-demo",
    diaryId: "solo-demo",
    createdAt: now,
    title: "로컬 미리보기",
    body: "삭제된 모바일 앱 화면을 localhost:3001에서 확인할 수 있게 복구했습니다.",
    mood: "calm",
    stickers: [{ id: "sticker-demo", stickerId: "heart", emoji: "💙", x: 40, y: 40, scale: 1, rotation: 0 }],
    texts: [],
    photos: [],
  },
];

export function DiariesProvider({ children }: { children: React.ReactNode }) {
  const [diaries, setDiaries] = useState<Diary[]>(starterDiaries);
  const [entries, setEntries] = useState<DiaryEntry[]>(starterEntries);

  const addDiary: DiariesContextType["addDiary"] = useCallback(async (d) => {
    const created: Diary = {
      id: uid(),
      name: d.name,
      kind: d.kind,
      color: d.color,
      members: d.members ?? ["me"],
      coverNumber: d.coverNumber,
      createdAt: new Date().toISOString(),
    };
    setDiaries((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDiary: DiariesContextType["updateDiary"] = useCallback(async (id, updates) => {
    setDiaries((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDiary: DiariesContextType["deleteDiary"] = useCallback(async (id) => {
    setDiaries((prev) => prev.filter((d) => d.id !== id));
    setEntries((prev) => prev.filter((e) => e.diaryId !== id));
  }, []);

  const toggleFavorite: DiariesContextType["toggleFavorite"] = useCallback(async (id) => {
    setDiaries((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, kind: d.kind === "FAVORITE" ? (d.members.length > 1 ? "SHARED" : "SOLO") : "FAVORITE" }
          : d
      )
    );
  }, []);

  const addEntry: DiariesContextType["addEntry"] = useCallback(async (entry) => {
    const created: DiaryEntry = { ...entry, id: uid(), createdAt: new Date().toISOString() };
    setEntries((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateEntry: DiariesContextType["updateEntry"] = useCallback(async (id, updates) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEntry: DiariesContextType["deleteEntry"] = useCallback(async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getDiary = useCallback((id: string) => diaries.find((d) => d.id === id), [diaries]);
  const getEntriesForDiary = useCallback(
    (id: string) => entries.filter((e) => e.diaryId === id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [entries]
  );

  const value = useMemo(
    () => ({
      diaries,
      entries,
      loading: false,
      addDiary,
      updateDiary,
      deleteDiary,
      toggleFavorite,
      addEntry,
      updateEntry,
      deleteEntry,
      getDiary,
      getEntriesForDiary,
    }),
    [diaries, entries, addDiary, updateDiary, deleteDiary, toggleFavorite, addEntry, updateEntry, deleteEntry, getDiary, getEntriesForDiary]
  );

  return <DiariesContext.Provider value={value}>{children}</DiariesContext.Provider>;
}

export function useDiaries() {
  const ctx = useContext(DiariesContext);
  if (!ctx) throw new Error("useDiaries must be used within DiariesProvider");
  return ctx;
}
