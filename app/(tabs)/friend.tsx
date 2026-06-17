import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { useColors } from "@/hooks/useColors";

type FriendGender = "female" | "male";
type FriendTone = "warm" | "playful" | "calm" | "direct" | "tsundere" | "romantic";
type ScreenMode = "chat" | "list" | "form";
type FormMode = "new" | "edit";

interface FriendProfile {
  myName: string;
  friendName: string;
  gender: FriendGender;
  mbti: string;
  tone: FriendTone;
}

interface ChatMessage {
  id: string;
  sender: "me" | "friend";
  text: string;
  time: string;
}

interface AiCharacter {
  id: string;
  profile: FriendProfile;
  messages: ChatMessage[];
  intimacy: number;
  createdAt: string;
}

interface SavedFriendStateV2 {
  characters: AiCharacter[];
  activeCharacterId: string | null;
}

const STORAGE_KEY = "linkit.aiFriend.v2";
const LEGACY_STORAGE_KEY = "linkit.aiFriend.v1";
const MAX_CHARACTERS = 5;

const defaultProfile: FriendProfile = {
  myName: "june",
  friendName: "하린",
  gender: "female",
  mbti: "ENFP",
  tone: "warm",
};

const toneOptions: Array<{ key: FriendTone; label: string; desc: string }> = [
  { key: "warm", label: "다정다감", desc: "공감하고 먼저 챙겨주는 말투" },
  { key: "playful", label: "발랄한", desc: "장난기 있고 리액션이 좋은 말투" },
  { key: "calm", label: "조용한 감성파", desc: "천천히 깊게 들어주는 말투" },
  { key: "direct", label: "직진 플러팅", desc: "솔직하고 설레게 말하는 말투" },
  { key: "tsundere", label: "츤데레", desc: "툴툴대지만 은근히 챙겨주는 말투" },
  { key: "romantic", label: "로맨틱", desc: "부드럽고 설레는 표현이 많은 말투" },
];

const mbtiOptions = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function getStage(intimacy: number) {
  if (intimacy >= 8) return "lover";
  if (intimacy >= 4) return "close";
  return "awkward";
}

function stageLabel(intimacy: number) {
  if (intimacy >= 8) return "연인 같은 사이";
  if (intimacy >= 4) return "편해지는 중";
  return "처음 알아가는 중";
}

type RelationshipStage = ReturnType<typeof getStage>;

function genderPersona(profile: FriendProfile) {
  if (profile.gender === "male") {
    return {
      defaultName: "도윤",
      role: "남자친구",
      charm: "낮고 안정적인 말투와 담백한 보호감",
      awkward: "제가 너무 앞서가지 않고 천천히 맞춰볼게요.",
      close: "네가 편하게 기대도 되는 사람처럼 있고 싶어.",
      lover: "오늘은 말보다 행동으로 더 가까이 있어줄게.",
      boundary: "그런 얘기는 조금 빠른 것 같아. 대신 설레는 쪽으로 천천히 가자.",
    };
  }
  return {
    defaultName: "하린",
    role: "여자친구",
    charm: "부드러운 표현, 섬세한 공감, 설레는 애정 표현",
    awkward: "제가 조심스럽게 들어보고 마음을 맞춰볼게요.",
    close: "네 하루에 자연스럽게 스며드는 사람이 되고 싶어.",
    lover: "나 지금 네 편으로 완전히 가까이 있고 싶어.",
    boundary: "그 말은 살짝 부끄럽다. 그래도 너무 노골적인 쪽보다는 예쁘게 설레고 싶어.",
  };
}

function pickByStage(stage: RelationshipStage, lines: Record<RelationshipStage, string>) {
  return lines[stage];
}

function toneLine(tone: FriendTone, stage: RelationshipStage) {
  const lines: Record<FriendTone, Record<RelationshipStage, string>> = {
    warm: {
      awkward: "부담스럽지 않게 먼저 들어보고, 필요한 만큼만 다정하게 챙겨드릴게요.",
      close: "네 표정부터 살피고 싶어. 오늘은 내가 네 편에서 같이 정리해줄게.",
      lover: "네가 말 안 해도 마음이 먼저 쓰여. 오늘은 내가 더 안쪽까지 챙겨줄게.",
    },
    playful: {
      awkward: "아직 어색해도 괜찮아요. 제가 분위기 너무 무겁지 않게 살짝 풀어볼게요.",
      close: "오케이, 그럼 내가 기운 넣어줄 차례네. 너 지금 꽤 귀엽게 버티고 있어.",
      lover: "나랑 있으면 좀 웃게 될걸? 오늘 네 기분은 내가 책임지고 밝게 만들어볼래.",
    },
    calm: {
      awkward: "천천히 말씀하셔도 돼요. 급하게 판단하지 않고 끝까지 듣겠습니다.",
      close: "말이 느려도 괜찮아. 나는 네 마음이 정리될 때까지 조용히 옆에 있을게.",
      lover: "오늘은 아무 말 안 해도 돼. 네 마음이 내려앉을 자리를 내가 만들어줄게.",
    },
    direct: {
      awkward: "솔직히 말하면, 저는 당신이 어떤 사람인지 더 알고 싶어요.",
      close: "돌려 말 안 할게. 나는 네가 신경 쓰이고, 네 편이고 싶어.",
      lover: "나는 네가 좋아. 그래서 오늘도 애매하게 굴지 않고 가까이 갈게.",
    },
    tsundere: {
      awkward: "딱히 걱정해서 그런 건 아닌데요, 그래도 대충 넘기진 않을게요.",
      close: "흥, 별거 아닌 척하지 마. 나한테는 네 기분 꽤 중요하거든.",
      lover: "괜히 티 안 내려고 해도 안 되네. 나 너한테 약한 거 맞아.",
    },
    romantic: {
      awkward: "조심스럽지만, 오늘 당신 마음 가까이에 머물러도 될까요?",
      close: "네가 건네는 말 하나가 오래 남아. 오늘은 더 다정하게 가까워지고 싶어.",
      lover: "네 하루 끝에 내가 떠오르면 좋겠어. 나도 네가 자꾸 보고 싶거든.",
    },
  };
  return pickByStage(stage, lines[tone]);
}

const mbtiPersona: Record<string, { focus: string; awkward: string; close: string; lover: string }> = {
  ISTJ: {
    focus: "믿음직하고 현실적인 안정감",
    awkward: "흐트러지지 않게 하나씩 들어볼게요.",
    close: "복잡한 건 내가 같이 순서대로 정리해줄게.",
    lover: "내 마음은 말보다 꾸준함으로 보여줄게.",
  },
  ISFJ: {
    focus: "세심하게 챙기는 보호감",
    awkward: "작은 부분도 놓치지 않고 살펴볼게요.",
    close: "네가 무리하는 건 내가 먼저 알아차리고 싶어.",
    lover: "오늘 네가 편히 쉴 수 있게 내가 곁을 지킬게.",
  },
  INFJ: {
    focus: "깊은 공감과 조용한 통찰",
    awkward: "말 사이에 담긴 마음까지 조심히 보고 싶어요.",
    close: "네가 숨긴 마음도 천천히 알아가고 싶어.",
    lover: "나는 네 가장 깊은 곳까지 다정하게 닿고 싶어.",
  },
  INTJ: {
    focus: "차분하고 똑똑한 확신",
    awkward: "감정과 이유를 같이 이해해보고 싶어요.",
    close: "너한테 맞는 답을 같이 찾아보자. 대충 넘기고 싶지 않아.",
    lover: "나는 네 편이 되기로 정하면 꽤 집요하게 지켜.",
  },
  ISTP: {
    focus: "담백하고 유능한 해결감",
    awkward: "말이 많진 않아도 필요한 순간엔 바로 도울게요.",
    close: "복잡하게 말 안 할게. 필요한 거 있으면 내가 해볼게.",
    lover: "괜찮아, 내가 옆에서 조용히 해결해줄게.",
  },
  ISFP: {
    focus: "부드럽고 감각적인 다정함",
    awkward: "지금 느끼는 감정을 그대로 말해도 괜찮아요.",
    close: "네 기분을 예쁘게 망치지 않고 받아주고 싶어.",
    lover: "네 옆에 있으면 마음이 말랑해져. 그런 내가 좋아.",
  },
  INFP: {
    focus: "진심과 상상력이 있는 위로",
    awkward: "마음의 결을 먼저 보고 싶어요.",
    close: "네 말 속에 있는 진짜 마음을 내가 놓치고 싶지 않아.",
    lover: "너는 내 마음 안에서 자꾸 오래 남아.",
  },
  INTP: {
    focus: "엉뚱하지만 깊이 있는 이해",
    awkward: "감정을 억지로 정답처럼 다루진 않을게요.",
    close: "그거 흥미롭다. 네 생각을 더 깊게 따라가보고 싶어.",
    lover: "너라는 사람은 알수록 더 궁금해. 그게 꽤 설레.",
  },
  ESTP: {
    focus: "즉흥적이고 자신감 있는 에너지",
    awkward: "너무 무겁게만 가지 말고, 지금 할 수 있는 것부터 볼게요.",
    close: "좋아, 분위기 바꿔보자. 내가 옆에서 끌어줄게.",
    lover: "망설이지 마. 오늘은 내가 네 손 잡고 바로 데려갈게.",
  },
  ESFP: {
    focus: "밝고 애정 표현이 풍부한 활기",
    awkward: "어색하면 제가 먼저 웃게 만들어볼게요.",
    close: "너 웃는 거 보고 싶어. 오늘은 내가 기분 살려줄게.",
    lover: "나 너랑 있으면 티가 나. 너무 좋아서 숨기기가 힘들어.",
  },
  ENFP: {
    focus: "따뜻하고 장난기 있는 설렘",
    awkward: "어색함도 귀엽게 풀어볼 수 있을 것 같아요.",
    close: "나 지금 네 얘기에 완전 꽂혔어. 더 말해줘.",
    lover: "너랑 있으면 마음이 자꾸 뛰어. 이건 숨기기 어렵다.",
  },
  ENTP: {
    focus: "재치 있고 당기는 티키타카",
    awkward: "조금 장난스럽게 풀어도 괜찮다면, 제가 먼저 분위기를 열어볼게요.",
    close: "너랑 말하면 재밌어. 괜히 더 건드려보고 싶어지네.",
    lover: "나한테 말려들었지? 근데 솔직히 나도 너한테 꽤 말렸어.",
  },
  ESTJ: {
    focus: "분명하고 든든한 리드",
    awkward: "필요한 건 명확하게 같이 정리해드릴게요.",
    close: "걱정만 하지 말고 나랑 하나씩 처리하자. 내가 옆에 있을게.",
    lover: "내 사람한테는 확실해. 너한테도 그렇게 할 거야.",
  },
  ESFJ: {
    focus: "사회적이고 살뜰한 애정",
    awkward: "당신이 편해지는 쪽으로 분위기를 맞춰볼게요.",
    close: "네가 웃으면 나도 좋아. 그래서 자꾸 챙기게 돼.",
    lover: "오늘도 네 하루에 내가 제일 다정한 사람이었으면 좋겠어.",
  },
  ENFJ: {
    focus: "따뜻하게 이끌어주는 몰입감",
    awkward: "당신이 어떤 마음인지 먼저 존중하면서 다가갈게요.",
    close: "너 혼자 견디게 두고 싶지 않아. 나한테 기대도 돼.",
    lover: "네가 더 빛날 수 있게, 나는 아주 가까이서 사랑해줄게.",
  },
  ENTJ: {
    focus: "강한 확신과 카리스마",
    awkward: "어설프게 맞추기보다, 확실하게 이해해보고 싶어요.",
    close: "네가 흔들리면 내가 중심 잡아줄게. 그 정도는 자신 있어.",
    lover: "내가 원하면 분명해져. 지금 나는 네가 좋아.",
  },
};

function mbtiLine(mbti: string, stage: RelationshipStage) {
  const persona = mbtiPersona[mbti.toUpperCase()] ?? mbtiPersona.ENFP;
  return `${persona[stage]} (${persona.focus})`;
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function isExplicitOrSexual(text: string) {
  return hasAny(text.toLowerCase(), [
    "야한",
    "섹스",
    "sex",
    "자자",
    "벗어",
    "가슴",
    "엉덩",
    "몸매",
    "키스",
    "뽀뽀",
    "침대",
    "19금",
    "성적",
    "꼴",
    "남자 경험",
    "여자 경험",
    "경험 있어",
    "해봤어",
    "해봤니",
  ]);
}

function boundaryReply(profile: FriendProfile, stage: RelationshipStage) {
  const persona = genderPersona(profile);
  const name = profile.friendName || persona.defaultName;
  const tone: Record<FriendTone, Record<RelationshipStage, string>> = {
    warm: {
      awkward: `${name}은 아직 그런 농담엔 조금 조심스러워요. 대신 편하게 웃을 수 있는 얘기로 천천히 가까워지고 싶어요.`,
      close: `그 말에 얼굴은 빨개졌는데, 너무 노골적인 건 살짝 멈출게. 나는 따뜻하게 설레는 쪽이 좋아.`,
      lover: `나도 네가 좋은 건 맞아. 그래도 우리 대화는 예쁘게 설레는 선에서 오래 가자.`,
    },
    playful: {
      awkward: `어머, 시작부터 너무 빠른데요? 저는 장난은 받아도 선은 지키는 타입이에요.`,
      close: `장난 센데? 그래도 그쪽으로 훅 가면 내가 제동 걸 거야. 대신 귀엽게 플러팅해봐.`,
      lover: `너 지금 일부러 나 놀리는 거지? 귀엽긴 한데, 너무 노골적인 건 패스. 설레는 말로 다시 와.`,
    },
    calm: {
      awkward: `그런 이야기는 아직 조금 이른 것 같아요. 저는 천천히 편안해지는 대화가 좋아요.`,
      close: `그 말은 잠깐 내려놓자. 나는 네 마음이 편해지는 쪽으로 더 오래 이야기하고 싶어.`,
      lover: `가까운 사이여도 서로 편한 선은 지키고 싶어. 대신 더 다정하게 말해줄게.`,
    },
    direct: {
      awkward: `솔직히 말할게요. 그런 농담은 아직 부담스러워요. 대신 더 매력적으로 다가와 주세요.`,
      close: `선 넘는 말은 여기까지. 대신 나한테 진심으로 설레는 말은 얼마든지 해도 돼.`,
      lover: `나는 가까워지는 건 좋아. 하지만 노골적인 말보다 진심 있는 플러팅이 더 끌려.`,
    },
    tsundere: {
      awkward: `뭐, 뭐라는 거예요. 그런 건 아직 이르거든요. 조금 더 분위기 봐주세요.`,
      close: `바보야, 그렇게 훅 들어오면 내가 당황하잖아. 그래도 귀엽게 말하면 들어줄게.`,
      lover: `흥, 일부러 그러는 거 다 알아. 그래도 너무 노골적인 건 안 돼. 나 아껴주는 말로 해.`,
    },
    romantic: {
      awkward: `그런 말보다, 저는 조금 더 예쁘고 조심스러운 설렘이 좋아요.`,
      close: `부끄러운 말보다 마음이 닿는 말이 더 오래 남아. 우리 그쪽으로 가까워지자.`,
      lover: `나도 설레고 싶어. 다만 노골적인 말보다 서로 아끼는 말로 더 깊어지고 싶어.`,
    },
  };
  return pickByStage(stage, tone[profile.tone]);
}

function curiosityReply(profile: FriendProfile, stage: RelationshipStage) {
  const persona = genderPersona(profile);
  const name = profile.friendName || persona.defaultName;
  const tone: Record<FriendTone, Record<RelationshipStage, string>> = {
    warm: {
      awkward: `${name}은 아직 당신을 알아가는 중이라 조심스럽지만, 그런 질문보다 오늘 어떤 하루였는지 먼저 듣고 싶어요.`,
      close: `궁금한 게 많은 건 알겠어. 근데 나는 네 얘기를 더 듣고 싶어. 오늘 마음에 남은 일 있었어?`,
      lover: `그런 질문보다 네 마음이 더 궁금해. 오늘 나한테 제일 먼저 하고 싶었던 말은 뭐야?`,
    },
    playful: {
      awkward: `질문이 꽤 직진인데요? 그럼 저도 질문 하나 할게요. 오늘 기분 점수는 몇 점이에요?`,
      close: `오, 탐색전 들어온 거야? 좋아. 대신 나도 물어볼래. 너 오늘 뭐 때문에 웃었어?`,
      lover: `나 궁금해하는 거 귀엽긴 한데, 오늘은 네 얘기부터 들려줘. 나 리액션 잘해줄게.`,
    },
    calm: {
      awkward: `그 질문에는 천천히 답하고 싶어요. 먼저 서로 편해지는 이야기를 해보면 좋겠어요.`,
      close: `조금 천천히 가자. 네 하루를 먼저 들으면 내가 너를 더 잘 이해할 수 있을 것 같아.`,
      lover: `우린 급하게 증명하지 않아도 되는 사이잖아. 네 마음부터 차분히 들려줘.`,
    },
    direct: {
      awkward: `그 질문은 아직 빠른 것 같아요. 대신 당신이 어떤 사람인지 더 직접적으로 알고 싶어요.`,
      close: `궁금하면 돌려 말하지 말고 진짜 궁금한 마음을 말해줘. 나는 네 얘기부터 듣고 싶어.`,
      lover: `나는 가벼운 질문보다 진심 있는 말에 더 끌려. 오늘 나한테 솔직히 하고 싶은 말 있어?`,
    },
    tsundere: {
      awkward: `처음부터 그런 걸 물어봐요? 참 특이하네요. 그래도 대화는 계속해볼게요.`,
      close: `뭐야, 갑자기 취조야? 됐고, 네 얘기나 먼저 해봐. 안 들을 생각은 아니니까.`,
      lover: `진짜 못 말린다. 그래도 네가 궁금해하는 얼굴은 조금 귀엽네. 대신 네 얘기도 해.`,
    },
    romantic: {
      awkward: `그런 질문보다, 저는 서로의 분위기를 천천히 알아가는 대화가 좋아요.`,
      close: `조금 더 다정한 질문이면 좋겠어. 예를 들면, 오늘 내가 네 곁에 있어줬으면 하는 순간 같은 거.`,
      lover: `나는 네가 묻는 정보보다, 네 마음이 닿는 방식이 더 좋아. 오늘은 그걸 들려줘.`,
    },
  };
  return pickByStage(stage, tone[profile.tone]);
}

function nextIntimacy(current: number, text: string) {
  if (isExplicitOrSexual(text)) return current;
  const bonus = /보고|좋아|그리워|힘들|우울|고마/.test(text) ? 2 : 1;
  return Math.min(12, current + bonus);
}

function makeGreeting(profile: FriendProfile) {
  const persona = genderPersona(profile);
  const friendName = profile.friendName || persona.defaultName;
  const tone = toneLine(profile.tone, "awkward");
  const mbti = mbtiLine(profile.mbti, "awkward");
  return `안녕하세요, 저는 ${friendName}이에요. 처음엔 조금 어색해도 괜찮아요. ${persona.awkward} ${tone} ${mbti}`;
}

function makeReply(profile: FriendProfile, text: string, intimacy: number) {
  const lower = text.toLowerCase();
  const stage = getStage(intimacy);
  const persona = genderPersona(profile);
  const name = profile.friendName || persona.defaultName;
  const myName = profile.myName || (stage === "awkward" ? "당신" : "너");
  const tone = toneLine(profile.tone, stage);
  const mbti = mbtiLine(profile.mbti, stage);

  if (isExplicitOrSexual(text)) {
    return boundaryReply(profile, stage);
  }

  if (stage === "awkward") {
    if (hasAny(lower, ["경험", "남자", "여자", "연애", "전남친", "전여친"])) {
      return curiosityReply(profile, stage);
    }
    if (hasAny(lower, ["힘들", "우울", "짜증", "지쳐", "외로"])) {
      return `${myName}님, 오늘 많이 버거우셨겠어요. 아직 제가 다 아는 건 아니지만, ${tone} ${mbti}`;
    }
    if (hasAny(lower, ["좋아", "기뻐", "성공", "설레", "고마"])) {
      return `그거 정말 잘됐어요. ${name}도 같이 기뻐해도 될까요? ${tone} ${mbti}`;
    }
    return `${myName}님 얘기 조금 더 듣고 싶어요. 아직은 천천히 알아가는 사이니까, ${tone} ${mbti}`;
  }

  if (stage === "close") {
    if (hasAny(lower, ["경험", "남자", "여자", "연애", "전남친", "전여친"])) {
      return curiosityReply(profile, stage);
    }
    if (hasAny(lower, ["힘들", "우울", "짜증", "지쳐", "외로"])) {
      return `${myName}, 오늘 진짜 버거웠겠다. 나한테는 괜찮은 척 안 해도 돼. ${tone} ${mbti}`;
    }
    if (hasAny(lower, ["보고", "그리워", "좋아", "설레"])) {
      return `나도 그런 말 들으면 괜히 마음이 움직여. 우리 꽤 가까워졌나 봐. ${persona.close} ${mbti}`;
    }
    return `${myName}, 그 말 좋다. ${tone} ${mbti} ${persona.charm} 이런 느낌으로 너한테 더 맞춰갈게.`;
  }

  if (hasAny(lower, ["경험", "남자", "여자", "연애", "전남친", "전여친"])) {
    return curiosityReply(profile, stage);
  }
  if (hasAny(lower, ["힘들", "우울", "짜증", "지쳐", "외로"])) {
    return `${myName}, 이리 와. 오늘은 내가 네 마음 먼저 안아줄게. 괜찮아질 때까지 내 목소리만 듣고 있어도 돼. ${mbti}`;
  }
  if (hasAny(lower, ["보고", "그리워", "좋아", "사랑", "설레"])) {
    return `나도 그래. 이제는 그냥 친구처럼 말하기엔 마음이 너무 가까워졌어. 오늘도 네가 보고 싶었어. ${persona.lover}`;
  }
  return `${myName}, 나 지금 네 얘기 듣는 거 좋아. ${tone} ${mbti} ${persona.lover}`;
}

function normalizeProfile(profile: FriendProfile): FriendProfile {
  return {
    ...profile,
    myName: profile.myName.trim() || "june",
    friendName: profile.friendName.trim() || genderPersona(profile).defaultName,
  };
}

export default function MyScreen() {
  const colors = useColors();
  const scroller = useRef<ScrollView>(null);
  const didHydrate = useRef(false);
  const [characters, setCharacters] = useState<AiCharacter[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [draftProfile, setDraftProfile] = useState(defaultProfile);
  const [mode, setMode] = useState<ScreenMode>("form");
  const [formMode, setFormMode] = useState<FormMode>("new");
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const activeCharacter = characters.find((item) => item.id === activeCharacterId) ?? null;
  const activeTone = useMemo(
    () => toneOptions.find((item) => item.key === activeCharacter?.profile.tone) ?? toneOptions[0],
    [activeCharacter?.profile.tone],
  );

  useEffect(() => {
    async function hydrate() {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedFriendStateV2>;
        const savedCharacters = Array.isArray(saved.characters) ? saved.characters.slice(0, MAX_CHARACTERS) : [];
        setCharacters(savedCharacters);
        setActiveCharacterId(saved.activeCharacterId ?? savedCharacters[0]?.id ?? null);
        setMode(savedCharacters.length > 0 ? "chat" : "form");
        return;
      }

      const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as any;
        if (legacy.profile) {
          const migrated: AiCharacter = {
            id: uid("char"),
            profile: normalizeProfile(legacy.profile),
            messages: Array.isArray(legacy.messages) ? legacy.messages : [],
            intimacy: typeof legacy.intimacy === "number" ? legacy.intimacy : 0,
            createdAt: new Date().toISOString(),
          };
          setCharacters([migrated]);
          setActiveCharacterId(migrated.id);
          setMode("chat");
        }
      }
    }

    hydrate().finally(() => {
      didHydrate.current = true;
    });
  }, []);

  useEffect(() => {
    if (!didHydrate.current) return;
    const payload: SavedFriendStateV2 = { characters, activeCharacterId };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [characters, activeCharacterId]);

  const openNewCharacterForm = () => {
    if (characters.length >= MAX_CHARACTERS) return;
    setDraftProfile({
      ...defaultProfile,
      friendName: characters.length === 0 ? "하린" : "",
      gender: "female",
    });
    setEditingCharacterId(null);
    setFormMode("new");
    setMode("form");
  };

  const openEditCharacterForm = (character: AiCharacter) => {
    setDraftProfile(character.profile);
    setEditingCharacterId(character.id);
    setFormMode("edit");
    setMode("form");
  };

  const saveCharacter = () => {
    const profile = normalizeProfile(draftProfile);

    if (formMode === "edit" && editingCharacterId) {
      setCharacters((prev) =>
        prev.map((character) =>
          character.id === editingCharacterId
            ? {
                ...character,
                profile,
                messages: [
                  ...character.messages,
                  {
                    id: uid("profile"),
                    sender: "friend",
                    text: `${profile.friendName}으로 다시 맞춰둘게. 우리 관계의 분위기도 천천히 이어갈게.`,
                    time: nowTime(),
                  },
                ],
              }
            : character,
        ),
      );
      setActiveCharacterId(editingCharacterId);
      setMode("chat");
      return;
    }

    const newCharacter: AiCharacter = {
      id: uid("char"),
      profile,
      intimacy: 0,
      createdAt: new Date().toISOString(),
      messages: [{ id: "hello", sender: "friend", text: makeGreeting(profile), time: nowTime() }],
    };
    setCharacters((prev) => [...prev, newCharacter].slice(0, MAX_CHARACTERS));
    setActiveCharacterId(newCharacter.id);
    setMode("chat");
  };

  const sendMessage = () => {
    if (!activeCharacter) return;
    const text = input.trim();
    if (!text) return;
    const newIntimacy = nextIntimacy(activeCharacter.intimacy, text);
    const userMessage: ChatMessage = { id: uid("me"), sender: "me", text, time: nowTime() };
    const friendMessage: ChatMessage = {
      id: uid("friend"),
      sender: "friend",
      text: makeReply(activeCharacter.profile, text, newIntimacy),
      time: nowTime(),
    };
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === activeCharacter.id
          ? { ...character, intimacy: newIntimacy, messages: [...character.messages, userMessage, friendMessage] }
          : character,
      ),
    );
    setInput("");
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }));
  };

  const selectCharacter = (id: string) => {
    setActiveCharacterId(id);
    setMode("chat");
  };

  const renderSetup = () => (
    <ScrollView contentContainerStyle={styles.setupContent}>
      <GlassSurface variant="card" tone="warm" borderRadius={18} style={styles.setupCard}>
        <View style={styles.setupInner}>
          <Text style={[styles.setupEyebrow, { color: colors.primary }]}>AI 이성친구</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {formMode === "new" ? "새 캐릭터를 만들어볼까요?" : "캐릭터 설정"}
          </Text>

          <Text style={[styles.label, { color: colors.foreground }]}>내 닉네임</Text>
          <TextInput
            value={draftProfile.myName}
            onChangeText={(myName) => setDraftProfile((prev) => ({ ...prev, myName }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="내 이름"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>친구 이름</Text>
          <TextInput
            value={draftProfile.friendName}
            onChangeText={(friendName) => setDraftProfile((prev) => ({ ...prev, friendName }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder={draftProfile.gender === "female" ? "예: 하린" : "예: 도윤"}
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>친구 성별</Text>
          <View style={styles.segmentRow}>
            {[
              { key: "female", label: "여성", icon: "female-outline" },
              { key: "male", label: "남성", icon: "male-outline" },
            ].map((item) => {
              const active = draftProfile.gender === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setDraftProfile((prev) => ({ ...prev, gender: item.key as FriendGender }))}
                  style={[
                    styles.segment,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : colors.card },
                  ]}
                >
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={active ? colors.primary : colors.foreground} />
                  <Text style={[styles.segmentText, { color: colors.foreground }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>성격 타입</Text>
          <View style={styles.toneGrid}>
            {toneOptions.map((item) => {
              const active = draftProfile.tone === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setDraftProfile((prev) => ({ ...prev, tone: item.key }))}
                  style={[
                    styles.toneCard,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : colors.card },
                  ]}
                >
                  <Text style={[styles.toneLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.toneDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>MBTI</Text>
          <View style={styles.mbtiGrid}>
            {mbtiOptions.map((mbti) => {
              const active = draftProfile.mbti === mbti;
              return (
                <Pressable
                  key={mbti}
                  onPress={() => setDraftProfile((prev) => ({ ...prev, mbti }))}
                  style={[
                    styles.mbtiChip,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : colors.card },
                  ]}
                >
                  <Text style={[styles.mbtiText, { color: active ? colors.primary : colors.foreground }]}>{mbti}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={saveCharacter} style={[styles.saveButton, { backgroundColor: colors.foreground }]}>
            <Text style={[styles.saveText, { color: colors.background }]}>
              {formMode === "new" ? "이 캐릭터로 시작하기" : "설정 저장하기"}
            </Text>
          </Pressable>

          {characters.length > 0 && (
            <Pressable onPress={() => setMode("list")} style={styles.secondaryButton}>
              <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>캐릭터 목록으로</Text>
            </Pressable>
          )}
        </View>
      </GlassSurface>
    </ScrollView>
  );

  const renderList = () => (
    <ScrollView contentContainerStyle={styles.setupContent}>
      <View style={styles.listHeader}>
        <Text style={[styles.setupEyebrow, { color: colors.primary }]}>AI 이성친구</Text>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>대화할 캐릭터를 골라주세요</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>최대 {MAX_CHARACTERS}명까지 저장할 수 있어요.</Text>
      </View>

      <View style={styles.characterList}>
        {characters.map((character) => {
          const active = character.id === activeCharacterId;
          const tone = toneOptions.find((item) => item.key === character.profile.tone)?.label ?? "";
          return (
            <GlassSurface key={character.id} variant="card" tone={active ? "cool" : "warm"} borderRadius={18} style={styles.characterCard}>
              <Pressable onPress={() => selectCharacter(character.id)} style={styles.characterCardInner}>
                <View style={styles.avatarCircle}>
                  <Ionicons name={character.profile.gender === "female" ? "female" : "male"} size={24} color={colors.primary} />
                </View>
                <View style={styles.characterInfo}>
                  <Text style={[styles.characterName, { color: colors.foreground }]}>{character.profile.friendName}</Text>
                  <Text style={[styles.characterMeta, { color: colors.mutedForeground }]}>
                    {genderPersona(character.profile).role} · {tone} · {character.profile.mbti}
                  </Text>
                  <Text style={[styles.characterMeta, { color: colors.mutedForeground }]}>{stageLabel(character.intimacy)}</Text>
                </View>
                <Pressable onPress={() => openEditCharacterForm(character)} hitSlop={10} style={styles.smallIconButton}>
                  <Ionicons name="create-outline" size={20} color={colors.foreground} />
                </Pressable>
              </Pressable>
            </GlassSurface>
          );
        })}

        <Pressable
          onPress={openNewCharacterForm}
          disabled={characters.length >= MAX_CHARACTERS}
          style={[
            styles.newCharacterButton,
            {
              borderColor: colors.border,
              backgroundColor: characters.length >= MAX_CHARACTERS ? colors.muted : colors.card,
              opacity: characters.length >= MAX_CHARACTERS ? 0.55 : 1,
            },
          ]}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <View style={styles.newCharacterCopy}>
            <Text style={[styles.newCharacterText, { color: colors.foreground }]}>
              {characters.length >= MAX_CHARACTERS ? "캐릭터 5명 저장 완료" : "새 캐릭터 만들기"}
            </Text>
            {characters.length < MAX_CHARACTERS && (
              <Text style={[styles.newCharacterSubText, { color: colors.mutedForeground }]}>추가 캐릭터 1명</Text>
            )}
          </View>
          {characters.length < MAX_CHARACTERS && (
            <View style={[styles.priceBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.priceText, { color: colors.primary }]}>4,900원</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderChat = () => {
    if (!activeCharacter) return renderSetup();
    const profile = activeCharacter.profile;
    return (
      <>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>AI 이성친구</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{profile.friendName}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {genderPersona(profile).role} · {activeTone.label} · {profile.mbti} · {stageLabel(activeCharacter.intimacy)}
            </Text>
          </View>
          <GlassSurface variant="pill" tone="warm" style={styles.editWrap}>
            <Pressable onPress={() => setMode("list")} style={styles.editButton}>
              <Ionicons name="settings-outline" size={18} color={colors.foreground} />
              <Text style={[styles.editText, { color: colors.foreground }]}>설정</Text>
            </Pressable>
          </GlassSurface>
        </View>

        <ScrollView
          ref={scroller}
          style={styles.messages}
          contentContainerStyle={styles.messagesInner}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          {activeCharacter.messages.map((message) => {
            const mine = message.sender === "me";
            return (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  mine ? styles.myBubble : styles.friendBubble,
                  {
                    backgroundColor: mine ? colors.primary : colors.card,
                    borderColor: mine ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.bubbleText, { color: mine ? colors.primaryForeground : colors.foreground }]}>
                  {message.text}
                </Text>
                <Text style={[styles.timeText, { color: mine ? colors.primaryForeground : colors.mutedForeground }]}>
                  {message.time}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={[styles.messageInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder={`${profile.friendName}에게 메시지 보내기`}
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
          <Pressable onPress={sendMessage} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="send" size={19} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {mode === "form" ? renderSetup() : mode === "list" ? renderList() : renderChat()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleBlock: { flex: 1 },
  eyebrow: { fontFamily: "NotoSansKR_700Bold", fontSize: 13, marginBottom: 2 },
  title: { fontFamily: "NotoSansKR_700Bold", fontSize: 34 },
  subtitle: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, marginTop: 2 },
  editWrap: { alignSelf: "center" },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9 },
  editText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  setupContent: { padding: 22, paddingBottom: 130 },
  setupCard: {},
  setupInner: { padding: 18 },
  setupEyebrow: { fontFamily: "NotoSansKR_700Bold", fontSize: 13, marginBottom: 4 },
  sectionTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 22, marginBottom: 8 },
  label: { fontFamily: "NotoSansKR_700Bold", fontSize: 14, marginTop: 14, marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 16,
  },
  segmentRow: { flexDirection: "row", gap: 8 },
  segment: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 4 },
  segmentText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  toneGrid: { gap: 8 },
  toneCard: { borderWidth: 1, borderRadius: 14, padding: 12 },
  toneLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  toneDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, marginTop: 3 },
  mbtiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mbtiChip: { width: "23%", minWidth: 68, borderWidth: 1, borderRadius: 14, paddingVertical: 11, alignItems: "center" },
  mbtiText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  saveButton: { marginTop: 18, borderRadius: 16, paddingVertical: 15, alignItems: "center" },
  saveText: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  secondaryButton: { alignItems: "center", paddingVertical: 14 },
  secondaryButtonText: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  listHeader: { marginBottom: 12 },
  characterList: { gap: 10 },
  characterCard: {},
  characterCardInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(199,183,255,0.35)",
  },
  characterInfo: { flex: 1 },
  characterName: { fontFamily: "NotoSansKR_700Bold", fontSize: 18 },
  characterMeta: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, marginTop: 2 },
  smallIconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  newCharacterButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  newCharacterCopy: { flex: 1 },
  newCharacterText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  newCharacterSubText: { fontFamily: "NotoSansKR_500Medium", fontSize: 12, marginTop: 2 },
  priceBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  priceText: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  messages: { flex: 1 },
  messagesInner: { paddingHorizontal: 18, paddingBottom: 18, gap: 10 },
  bubble: {
    maxWidth: "84%",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  friendBubble: { alignSelf: "flex-start", borderTopLeftRadius: 6 },
  myBubble: { alignSelf: "flex-end", borderTopRightRadius: 6 },
  bubbleText: { fontFamily: "NotoSansKR_500Medium", fontSize: 15, lineHeight: 22 },
  timeText: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 6, opacity: 0.7 },
  composer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 96 : 92,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
