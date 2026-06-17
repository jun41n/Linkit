import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { DEFAULT_EMOJI_STICKERS } from "@/constants/defaultEmojiStickers";

export interface Sticker {
  id: string;
  emoji: string;
  label?: string;
  keywords?: string[];
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  price: number;
  isPaid: boolean;
  themeColor: string;
  coverEmoji: string;
  stickers: Sticker[];
}

interface StickersContextType {
  packs: StickerPack[];
  ownedPackIds: string[];
  isOwned: (packId: string) => boolean;
  ownedStickers: Sticker[];
  searchStickers: (query: string) => Array<Sticker & { packId: string }>;
  purchasePack: (packId: string) => Promise<void>;
  loading: boolean;
}

const StickersContext = createContext<StickersContextType | null>(null);

const makeStickers = (prefix: string, items: Array<[string, string, string[]?]>): Sticker[] =>
  items.map(([emoji, label, keywords = []], index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    emoji,
    label,
    keywords: [label, ...keywords],
  }));

const basicDecorStickers = makeStickers("basic", [
  ["💙", "파란 하트", ["heart", "love"]],
  ["💖", "반짝 하트", ["heart", "pink"]],
  ["💕", "두근 하트", ["heart", "love"]],
  ["💗", "핑크 하트", ["heart"]],
  ["💜", "보라 하트", ["heart"]],
  ["🤍", "화이트 하트", ["heart"]],
  ["✨", "반짝", ["sparkle"]],
  ["⭐", "별", ["star"]],
  ["🌟", "빛나는 별", ["star"]],
  ["💫", "빙글 별", ["star"]],
  ["🎀", "리본", ["ribbon"]],
  ["🧸", "테디베어", ["bear", "cute"]],
  ["🌸", "벚꽃", ["flower"]],
  ["🌷", "튤립", ["flower"]],
  ["🌹", "장미", ["flower"]],
  ["🌼", "꽃", ["flower"]],
  ["🍀", "네잎클로버", ["lucky"]],
  ["🌿", "잎사귀", ["leaf"]],
  ["☁️", "구름", ["cloud"]],
  ["🌙", "초승달", ["moon"]],
  ["☀️", "햇살", ["sun"]],
  ["🌈", "무지개", ["rainbow"]],
  ["🫧", "버블", ["bubble"]],
  ["🪄", "마법봉", ["magic"]],
  ["📌", "핀", ["pin"]],
  ["📎", "클립", ["clip"]],
  ["🧷", "옷핀", ["pin"]],
  ["✏️", "연필", ["pencil"]],
  ["🖊️", "펜", ["pen"]],
  ["🖍️", "크레용", ["crayon"]],
  ["📝", "메모", ["memo"]],
  ["📒", "노트", ["note"]],
  ["📖", "책", ["book"]],
  ["📷", "카메라", ["photo"]],
  ["🎧", "헤드폰", ["music"]],
  ["🎵", "음표", ["music"]],
  ["🎶", "음악", ["music"]],
  ["☕", "커피", ["coffee"]],
  ["🍰", "케이크", ["cake"]],
  ["🍓", "딸기", ["strawberry"]],
  ["🍒", "체리", ["cherry"]],
  ["🍑", "복숭아", ["peach"]],
  ["🍭", "사탕", ["candy"]],
  ["🍬", "캔디", ["candy"]],
  ["🧁", "컵케이크", ["cupcake"]],
  ["🎁", "선물", ["gift"]],
  ["🎈", "풍선", ["balloon"]],
  ["🎉", "축하", ["party"]],
  ["🪩", "미러볼", ["party"]],
  ["💌", "러브레터", ["letter", "love"]],
]);

const moodDecorStickers = makeStickers("mood", [
  ["😊", "미소", ["smile"]],
  ["🥰", "설렘", ["love"]],
  ["😍", "반함", ["love"]],
  ["😘", "쪽", ["kiss"]],
  ["😌", "평온", ["calm"]],
  ["🥹", "감동", ["touching"]],
  ["🥲", "울컥", ["sad"]],
  ["😭", "눈물", ["cry"]],
  ["😂", "웃김", ["laugh"]],
  ["🤣", "빵터짐", ["laugh"]],
  ["😆", "신남", ["happy"]],
  ["😎", "쿨함", ["cool"]],
  ["😴", "졸림", ["sleepy"]],
  ["🤔", "생각중", ["think"]],
  ["😳", "부끄러움", ["shy"]],
  ["😤", "흥", ["angry"]],
  ["😡", "화남", ["angry"]],
  ["😇", "천사", ["angel"]],
  ["🤍", "맑은 마음", ["heart"]],
  ["💭", "생각풍선", ["thought"]],
  ["💬", "말풍선", ["chat"]],
  ["💤", "쿨쿨", ["sleep"]],
  ["🔥", "열정", ["fire"]],
  ["💪", "화이팅", ["fighting"]],
  ["👏", "박수", ["clap"]],
  ["🙌", "만세", ["yay"]],
  ["👍", "좋아요", ["like"]],
  ["🙏", "기도", ["pray"]],
  ["🤝", "약속", ["promise"]],
  ["👀", "눈", ["eyes"]],
  ["👑", "왕관", ["crown"]],
  ["🪽", "날개", ["wing"]],
  ["🕊️", "평화", ["peace"]],
  ["🐰", "토끼", ["bunny"]],
  ["🐻", "곰", ["bear"]],
  ["🐱", "고양이", ["cat"]],
  ["🐶", "강아지", ["dog"]],
  ["🐥", "병아리", ["chick"]],
  ["🦋", "나비", ["butterfly"]],
  ["🐾", "발자국", ["paw"]],
  ["🌊", "파도", ["wave"]],
  ["🌧️", "비", ["rain"]],
  ["❄️", "눈꽃", ["snow"]],
  ["🍃", "바람", ["wind"]],
  ["🕯️", "촛불", ["candle"]],
  ["🧺", "피크닉", ["picnic"]],
  ["🛼", "롤러스케이트", ["skate"]],
  ["🎬", "영화", ["movie"]],
  ["🗓️", "캘린더", ["calendar"]],
  ["✅", "체크", ["check"]],
]);

const PACKS: StickerPack[] = [
  {
    id: "pack_emoji",
    name: "전체 이모지 무료팩",
    description: "인스타그램 이모지 키보드처럼 검색해서 쓰는 Unicode Emoji 17.0 기본 이모지 3,944종",
    price: 0,
    isPaid: false,
    themeColor: "#C7B8FF",
    coverEmoji: "😀",
    stickers: DEFAULT_EMOJI_STICKERS,
  },
  {
    id: "pack_basic",
    name: "기본 다꾸 무료팩",
    description: "다이어리 꾸미기에 바로 쓰는 기본 장식 스티커 50종",
    price: 0,
    isPaid: false,
    themeColor: "#FFD86B",
    coverEmoji: "✨",
    stickers: basicDecorStickers,
  },
  {
    id: "pack_mood",
    name: "감정 다꾸 무료팩",
    description: "오늘의 기분과 순간을 표현하는 감정 스티커 50종",
    price: 0,
    isPaid: false,
    themeColor: "#FFB7C5",
    coverEmoji: "😊",
    stickers: moodDecorStickers,
  },
  {
    id: "pack_premium",
    name: "프리미엄 미리보기",
    description: "구매 흐름 확인용 스티커팩",
    price: 3900,
    isPaid: true,
    themeColor: "#C9B6F2",
    coverEmoji: "🌙",
    stickers: makeStickers("premium", [
      ["🌙", "달", ["moon"]],
      ["☁️", "구름", ["cloud"]],
    ]),
  },
];

export function StickersProvider({ children }: { children: React.ReactNode }) {
  const [ownedPackIds, setOwnedPackIds] = useState<string[]>(["pack_emoji", "pack_basic", "pack_mood"]);

  const isOwned = useCallback((id: string) => ownedPackIds.includes(id), [ownedPackIds]);

  const purchasePack = useCallback(async (id: string) => {
    setOwnedPackIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const ownedStickers = useMemo(
    () => PACKS.filter((p) => ownedPackIds.includes(p.id)).flatMap((p) => p.stickers),
    [ownedPackIds],
  );

  const searchStickers = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const results: Array<Sticker & { packId: string }> = [];
      for (const pack of PACKS) {
        if (!ownedPackIds.includes(pack.id)) continue;
        for (const sticker of pack.stickers) {
          const haystack = [sticker.emoji, sticker.label ?? "", ...(sticker.keywords ?? [])].join(" ").toLowerCase();
          if (haystack.includes(q)) results.push({ ...sticker, packId: pack.id });
        }
      }
      return results;
    },
    [ownedPackIds],
  );

  return (
    <StickersContext.Provider
      value={{ packs: PACKS, ownedPackIds, isOwned, ownedStickers, searchStickers, purchasePack, loading: false }}
    >
      {children}
    </StickersContext.Provider>
  );
}

export function useStickers() {
  const ctx = useContext(StickersContext);
  if (!ctx) throw new Error("useStickers must be used within StickersProvider");
  return ctx;
}
