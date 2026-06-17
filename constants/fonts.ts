export interface DiaryFontOption {
  id: string;
  label: string;
  family: string;
  preview: string;
  weight?: "regular" | "bold";
  vibe: string;
}

export const DIARY_FONTS: DiaryFontOption[] = [
  {
    id: "gaegu",
    label: "개구쟁이",
    family: "Gaegu_700Bold",
    preview: "오늘의 다꾸",
    weight: "bold",
    vibe: "귀여운 손글씨",
  },
  {
    id: "nanum_pen",
    label: "나눔펜",
    family: "NanumPenScript_400Regular",
    preview: "오늘의 다꾸",
    vibe: "감성 펜글씨",
  },
  {
    id: "single_day",
    label: "싱글데이",
    family: "SingleDay_400Regular",
    preview: "오늘의 다꾸",
    vibe: "예쁜 손글씨",
  },
  {
    id: "hi_melody",
    label: "하이멜로디",
    family: "HiMelody_400Regular",
    preview: "오늘의 다꾸",
    vibe: "둥글둥글",
  },
  {
    id: "black_han",
    label: "검은고딕",
    family: "BlackHanSans_400Regular",
    preview: "오늘의 다꾸",
    weight: "bold",
    vibe: "굵은 디스플레이",
  },
  {
    id: "do_hyeon",
    label: "도현",
    family: "DoHyeon_400Regular",
    preview: "오늘의 다꾸",
    vibe: "단정한 고딕",
  },
  {
    id: "jua",
    label: "주아",
    family: "Jua_400Regular",
    preview: "오늘의 다꾸",
    vibe: "말랑한 둥근",
  },
  {
    id: "gowun_dodum",
    label: "고운도담",
    family: "GowunDodum_400Regular",
    preview: "오늘의 다꾸",
    vibe: "수수한 명조",
  },
  {
    id: "noto_sans",
    label: "노토산스",
    family: "NotoSansKR_500Medium",
    preview: "오늘의 다꾸",
    vibe: "모던 산세리프",
  },
];

export const DEFAULT_DIARY_FONT = DIARY_FONTS[0];

export function getFontFamily(id?: string): string {
  if (!id) return DEFAULT_DIARY_FONT.family;
  return DIARY_FONTS.find((f) => f.id === id)?.family ?? DEFAULT_DIARY_FONT.family;
}

export const UI = {
  body: "NotoSansKR_400Regular",
  bodyMd: "NotoSansKR_500Medium",
  bodyBold: "NotoSansKR_700Bold",
};
