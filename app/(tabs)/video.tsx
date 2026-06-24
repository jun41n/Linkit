import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { Diary, useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const inviteUrl = "http://158.179.162.39:8031/";
const inviteText = "진짜 링킷에서 같이 기록해요.";

type LogType = "daily" | "travel" | "shared";

type ShareTarget = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  bg: string;
  color: string;
  action: "copy" | "native" | "url";
  url?: string;
};

type LogCollection = {
  id: string;
  title: string;
  description: string;
  accent: string;
  soft: string;
  icon: keyof typeof Ionicons.glyphMap;
  memberCount: number;
  diaryId?: string;
};

const encodedInviteUrl = encodeURIComponent(inviteUrl);
const encodedInviteText = encodeURIComponent(inviteText);

const shareTargets: ShareTarget[] = [
  { label: "링크 복사", icon: "link-outline", bg: "#8D49B3", color: "white", action: "copy" },
  { label: "X", text: "X", bg: "#050008", color: "white", action: "url", url: `https://twitter.com/intent/tweet?text=${encodedInviteText}&url=${encodedInviteUrl}` },
  { label: "페북", icon: "logo-facebook", bg: "#1877F2", color: "white", action: "url", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedInviteUrl}` },
  { label: "인스타", icon: "logo-instagram", bg: "#F15A80", color: "white", action: "native" },
  { label: "카카오", text: "K", bg: "#FFE500", color: "#3C1E1E", action: "url", url: `https://sharer.kakao.com/talk/friends/picker/link?url=${encodedInviteUrl}` },
  { label: "틱톡", text: "♪", bg: "#050008", color: "white", action: "native" },
  { label: "라인", text: "LINE", bg: "#06C755", color: "white", action: "url", url: `https://social-plugins.line.me/lineit/share?url=${encodedInviteUrl}` },
  { label: "스레드", text: "@", bg: "#050008", color: "white", action: "url", url: `https://www.threads.net/intent/post?text=${encodedInviteText}%20${encodedInviteUrl}` },
  { label: "왓츠앱", icon: "logo-whatsapp", bg: "#25D366", color: "white", action: "url", url: `https://wa.me/?text=${encodedInviteText}%20${encodedInviteUrl}` },
];

function formatHour(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

async function copyInviteLink() {
  const clipboard = (globalThis.navigator as any)?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(inviteUrl);
      return true;
    } catch {
      // HTTP deployments may block the modern Clipboard API.
    }
  }

  const documentRef = (globalThis as any).document;
  if (documentRef?.body?.appendChild && documentRef?.execCommand) {
    const textArea = documentRef.createElement("textarea");
    textArea.value = inviteUrl;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    documentRef.body.appendChild(textArea);
    textArea.select();
    const copied = documentRef.execCommand("copy");
    documentRef.body.removeChild(textArea);
    return copied;
  }

  return false;
}

async function openShare(target: ShareTarget) {
  if (target.action === "copy") {
    await copyInviteLink();
    return;
  }

  if (target.action === "native") {
    const nav = globalThis.navigator as any;
    if (nav?.share) {
      await nav.share({ title: "진짜 링킷", text: inviteText, url: inviteUrl });
      return;
    }
    await copyInviteLink();
    return;
  }

  if (target.url) {
    await Linking.openURL(target.url);
  }
}

function sharedCollection(diary: Diary, index: number): LogCollection {
  const palettes = [
    { accent: "#FF7994", soft: "#FFF0F4" },
    { accent: "#6E8FEA", soft: "#EEF3FF" },
    { accent: "#6CB7A7", soft: "#ECF8F5" },
    { accent: "#A17BD4", soft: "#F4EEFC" },
  ];
  const palette = palettes[index % palettes.length];

  return {
    id: diary.id,
    title: diary.name,
    description: "초대한 친구들과 오늘을 함께 기록해요",
    icon: "people",
    memberCount: Math.max(diary.members.length, 2),
    diaryId: diary.id,
    ...palette,
  };
}

export default function VideoLogScreen() {
  const colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { entries, diaries } = useDiaries();
  const [search, setSearch] = useState("");
  const [logType, setLogType] = useState<LogType>("daily");
  const [selectedCollectionId, setSelectedCollectionId] = useState("daily-log");
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const soloDiary = diaries.find((d) => d.kind === "SOLO");
  const travelDiary = diaries.find((d) => d.kind === "FAVORITE");
  const sharedDiaries = diaries.filter((d) => d.kind === "SHARED");

  const collections = useMemo<LogCollection[]>(() => {
    if (logType === "daily") {
      return [{
        id: "daily-log",
        title: "데일리 로그",
        description: "매시간 짧게, 오늘의 장면을 이어 붙여요",
        accent: "#FF6B72",
        soft: "#FFF0F1",
        icon: "sunny",
        memberCount: 1,
        diaryId: soloDiary?.id,
      }];
    }

    if (logType === "travel") {
      return [{
        id: "travel-log",
        title: "여행 로그",
        description: "여행의 순간을 한 편의 기록으로 모아요",
        accent: "#668BE6",
        soft: "#EEF3FF",
        icon: "airplane",
        memberCount: 1,
        diaryId: travelDiary?.id,
      }];
    }

    return sharedDiaries.map(sharedCollection);
  }, [logType, sharedDiaries, soloDiary?.id, travelDiary?.id]);

  useEffect(() => {
    const first = collections[0]?.id;
    if (first && !collections.some((collection) => collection.id === selectedCollectionId)) {
      setSelectedCollectionId(first);
    }
  }, [collections, selectedCollectionId]);

  const selectedCollection = collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0];
  const videoEntries = useMemo(
    () => entries.filter((entry) => entry.isVideo || entry.videoUri),
    [entries]
  );

  const filteredVideoEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return videoEntries.filter((entry) => {
      if (selectedCollection?.diaryId && entry.diaryId !== selectedCollection.diaryId) return false;
      if (!keyword) return true;
      const diaryName = diaries.find((d) => d.id === entry.diaryId)?.name ?? "";
      return diaryName.toLowerCase().includes(keyword) || (entry.body ?? "").toLowerCase().includes(keyword);
    });
  }, [videoEntries, diaries, search, selectedCollection?.diaryId]);

  const cardWidth = Math.min(Math.max(width - 72, 286), 348);

  const changeLogType = (nextType: LogType) => {
    setLogType(nextType);
    setSelectedCollectionId(
      nextType === "daily"
        ? "daily-log"
        : nextType === "travel"
          ? "travel-log"
          : sharedDiaries[0]?.id ?? ""
    );
  };

  const showInvitePanel = () => {
    setShareMessage("초대 방법을 선택해 주세요.");
    setSharePanelOpen(true);
  };

  const handleShareTarget = async (target: ShareTarget) => {
    try {
      await openShare(target);
      setShareMessage(target.action === "copy" ? "링크가 복사되었습니다." : `${target.label} 공유창을 열었습니다.`);
    } catch {
      const copied = await copyInviteLink();
      setShareMessage(copied ? "공유창 대신 링크를 복사했습니다." : "공유창을 열지 못했습니다.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>june 님의</Text>
          <View style={styles.titleRow}>
            <View style={styles.highlightWrap}>
              <View style={[styles.highlight, { backgroundColor: colors.highlightYellow }]} />
              <Text style={[styles.bookshelfTitle, { color: colors.foreground }]}>브이로그</Text>
            </View>
            <Text style={[styles.smile, { color: colors.foreground }]}>:)</Text>
          </View>
        </View>
        <GlassSurface variant="pill" tone="warm" style={styles.shareBtnGlass}>
          <Pressable onPress={showInvitePanel} style={styles.shareBtnInner}>
            <Ionicons name="share-outline" size={16} color={colors.foreground} />
            <Text style={[styles.shareBtnText, { color: colors.foreground }]}>공유</Text>
          </Pressable>
        </GlassSurface>
      </View>

      <GlassSurface variant="pill" tone="warm" style={styles.searchBar}>
        <View style={styles.searchBarInner}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="브이로그 이름 검색"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
        </View>
      </GlassSurface>

      <View style={styles.tabsRow}>
        {[
          { key: "daily", label: "데일리" },
          { key: "travel", label: "여행" },
          { key: "shared", label: "함께 찍은" },
        ].map((tab) => {
          const active = logType === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => changeLogType(tab.key as LogType)}
              style={[styles.tab, { backgroundColor: active ? colors.paperWhite : colors.muted }, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={{ backgroundColor: colors.paperWhite }}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
              {logType === "shared" ? "FRIENDS LOG" : logType === "travel" ? "TRAVEL LOG" : "TODAY LOG"}
            </Text>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {logType === "shared" ? "함께 만드는 로그" : logType === "travel" ? "나의 여행 기록" : "오늘의 브이로그"}
            </Text>
          </View>
          <View style={styles.sectionActions}>
            <Text style={[styles.collectionCount, { color: colors.mutedForeground }]}>
              {logType === "shared" ? `${collections.length}개 모임` : "1개"}
            </Text>
            {logType === "shared" && (
              <Pressable onPress={showInvitePanel} style={[styles.addMemberButton, { backgroundColor: colors.foreground }]}>
                <Ionicons name="person-add" size={14} color={colors.card} />
                <Text style={[styles.addMemberText, { color: colors.card }]}>인원 추가</Text>
              </Pressable>
            )}
          </View>
        </View>

        {collections.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.collectionRail}
          >
            {collections.map((collection) => {
              const active = selectedCollection?.id === collection.id;
              return (
                <Pressable
                  key={collection.id}
                  onPress={() => setSelectedCollectionId(collection.id)}
                  style={[
                    styles.collectionCard,
                    { width: cardWidth, backgroundColor: collection.soft, borderColor: active ? collection.accent : "transparent" },
                    active && styles.collectionCardActive,
                  ]}
                >
                  <View style={styles.collectionTop}>
                    <View style={[styles.collectionIcon, { backgroundColor: collection.accent }]}>
                      <Ionicons name={collection.icon} size={20} color="white" />
                    </View>
                    <View style={[styles.liveBadge, { backgroundColor: `${collection.accent}18` }]}>
                      <View style={[styles.liveDot, { backgroundColor: collection.accent }]} />
                      <Text style={[styles.liveText, { color: collection.accent }]}>
                        {logType === "shared" ? `${collection.memberCount}명 참여` : "나의 공간"}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={[styles.collectionTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {collection.title}
                    </Text>
                    <Text style={[styles.collectionDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {collection.description}
                    </Text>
                  </View>

                  <View style={styles.collectionFooter}>
                    <View style={styles.avatarStack}>
                      {Array.from({ length: Math.min(collection.memberCount, 3) }).map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.miniAvatar,
                            { backgroundColor: index === 0 ? collection.accent : colors.card, marginLeft: index === 0 ? 0 : -8 },
                          ]}
                        >
                          <Ionicons name={index === 0 ? "person" : "happy-outline"} size={13} color={index === 0 ? "white" : collection.accent} />
                        </View>
                      ))}
                    </View>
                    <View style={[styles.openCircle, { backgroundColor: collection.accent }]}>
                      <Ionicons name="arrow-forward" size={18} color="white" />
                    </View>
                  </View>
                </Pressable>
              );
            })}

          </ScrollView>
        ) : (
          <Pressable onPress={showInvitePanel} style={[styles.noCollectionCard, { borderColor: colors.border }]}>
            <View style={[styles.inviteIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="people-outline" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.inviteCardTitle, { color: colors.foreground }]}>아직 함께 찍는 친구가 없어요</Text>
            <Text style={[styles.inviteCardDescription, { color: colors.mutedForeground }]}>
              친구를 초대하면 이곳에 모임별 가로 로그가 생깁니다.
            </Text>
            <View style={[styles.inlineInviteButton, { backgroundColor: colors.foreground }]}>
              <Ionicons name="person-add" size={16} color={colors.card} />
              <Text style={[styles.inlineInviteText, { color: colors.card }]}>친구 초대</Text>
            </View>
          </Pressable>
        )}

        {selectedCollection && (
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeader}>
              <View>
                <Text style={[styles.timelineTitle, { color: colors.foreground }]}>오늘의 장면</Text>
                <Text style={[styles.timelineCaption, { color: colors.mutedForeground }]}>
                  짧게 찍을수록 하루가 자연스럽게 이어져요
                </Text>
              </View>
              <Pressable onPress={() => router.push("/video/record")} style={[styles.smallRecordButton, { backgroundColor: selectedCollection.accent }]}>
                <Ionicons name="videocam" size={17} color="white" />
                <Text style={styles.smallRecordText}>촬영</Text>
              </Pressable>
            </View>

            {filteredVideoEntries.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clipRail}>
                {filteredVideoEntries.map((entry) => {
                  const date = new Date(entry.createdAt);
                  return (
                    <Pressable key={entry.id} onPress={() => router.push(`/entry/${entry.id}`)} style={styles.clipCard}>
                      {entry.photoUri ? (
                        <Image source={{ uri: entry.photoUri }} style={styles.clipImage} />
                      ) : (
                        <View style={[styles.clipPlaceholder, { backgroundColor: selectedCollection.soft }]}>
                          <Ionicons name="play" size={24} color={selectedCollection.accent} />
                        </View>
                      )}
                      <View style={styles.clipTime}>
                        <Text style={styles.clipTimeText}>{formatHour(date)}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={[styles.emptyLogCard, { backgroundColor: selectedCollection.soft }]}>
                <View style={[styles.emptyPlay, { backgroundColor: selectedCollection.accent }]}>
                  <Ionicons name="videocam" size={26} color="white" />
                </View>
                <Text style={[styles.emptyLogTitle, { color: colors.foreground }]}>아직 영상이 없어요</Text>
                <Text style={[styles.emptyLogDescription, { color: colors.mutedForeground }]}>
                  지금의 장면을 짧게 남기면 자동으로 오늘의 브이로그가 시작돼요.
                </Text>
                <View style={styles.emptyActions}>
                  <Pressable onPress={() => router.push("/video/record")} style={[styles.primaryAction, { backgroundColor: selectedCollection.accent }]}>
                    <Ionicons name="videocam" size={18} color="white" />
                    <Text style={styles.primaryActionText}>새 영상 찍기</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push("/video/record")} style={[styles.secondaryAction, { borderColor: `${selectedCollection.accent}55` }]}>
                    <Ionicons name="cloud-upload-outline" size={18} color={selectedCollection.accent} />
                    <Text style={[styles.secondaryActionText, { color: selectedCollection.accent }]}>영상 올리기</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {sharePanelOpen && (
        <View style={styles.shareOverlay}>
          <Pressable style={styles.shareBackdrop} onPress={() => setSharePanelOpen(false)} />
          <View style={styles.sharePanel}>
            <View style={styles.copiedToast}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.copiedText}>{shareMessage}</Text>
            </View>

            <View style={styles.shareHeaderRow}>
              <View style={styles.shareLine} />
              <Text style={styles.shareTitle}>SNS로 바로 공유</Text>
              <View style={styles.shareLine} />
            </View>

            <View style={styles.shareGrid}>
              {shareTargets.map((target) => (
                <Pressable key={target.label} onPress={() => handleShareTarget(target)} style={styles.shareTarget}>
                  <View style={[styles.shareCircle, { backgroundColor: target.bg }]}>
                    {target.icon ? (
                      <Ionicons name={target.icon} size={30} color={target.color} />
                    ) : (
                      <Text style={[styles.shareCircleText, { color: target.color }]}>{target.text}</Text>
                    )}
                  </View>
                  <Text style={styles.shareLabel}>{target.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  greeting: { fontSize: 24, fontFamily: "NotoSansKR_700Bold" },
  titleRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 2 },
  highlightWrap: { position: "relative" },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    height: 14,
    borderRadius: 4,
    opacity: 0.85,
  },
  bookshelfTitle: { fontSize: 38, fontFamily: "NotoSansKR_700Bold", paddingHorizontal: 4 },
  smile: { fontSize: 26, fontFamily: "NotoSansKR_700Bold", marginLeft: 6, marginBottom: 6 },
  shareBtnGlass: { alignSelf: "center" },
  shareBtnInner: { paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  shareBtnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  searchBar: { marginHorizontal: 22, marginTop: 8 },
  searchBarInner: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, fontFamily: "NotoSansKR_400Regular", fontSize: 15 },
  tabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 22, marginTop: 14 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  tabActive: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  pageContent: { paddingTop: 22, paddingBottom: 130 },
  sectionHeading: {
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionEyebrow: { fontFamily: "Inter_700Bold", fontSize: 11 },
  sectionTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 21, marginTop: 3 },
  sectionActions: { alignItems: "flex-end", gap: 7 },
  collectionCount: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, marginBottom: 2 },
  addMemberButton: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  addMemberText: { fontFamily: "NotoSansKR_700Bold", fontSize: 12 },
  collectionRail: { paddingHorizontal: 22, paddingBottom: 12, gap: 12 },
  collectionCard: {
    height: 176,
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 18,
    justifyContent: "space-between",
  },
  collectionCardActive: {
    shadowColor: "#403852",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 12,
    elevation: 3,
  },
  collectionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  collectionIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontFamily: "NotoSansKR_700Bold", fontSize: 11 },
  collectionTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 24 },
  collectionDescription: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, lineHeight: 19, marginTop: 3, maxWidth: 250 },
  collectionFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  miniAvatar: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  openCircle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  noCollectionCard: {
    marginHorizontal: 22,
    minHeight: 212,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
  },
  inviteIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  inviteCardTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 17, textAlign: "center" },
  inviteCardDescription: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 6 },
  inlineInviteButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inlineInviteText: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  timelineSection: { paddingHorizontal: 22, marginTop: 24 },
  timelineHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  timelineTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 19 },
  timelineCaption: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, marginTop: 3 },
  smallRecordButton: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  smallRecordText: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 12 },
  clipRail: { gap: 10, paddingBottom: 10 },
  clipCard: { width: 112, height: 156, borderRadius: 8, overflow: "hidden", backgroundColor: "#F0EDF5" },
  clipImage: { width: "100%", height: "100%" },
  clipPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  clipTime: { position: "absolute", left: 8, bottom: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(20,18,30,0.72)" },
  clipTimeText: { color: "white", fontFamily: "Inter_700Bold", fontSize: 10 },
  emptyLogCard: { borderRadius: 8, paddingHorizontal: 24, paddingVertical: 26, alignItems: "center" },
  emptyPlay: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyLogTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 19 },
  emptyLogDescription: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 280, marginTop: 5 },
  emptyActions: { width: "100%", flexDirection: "row", gap: 9, marginTop: 20 },
  primaryAction: { flex: 1, minHeight: 45, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  primaryActionText: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  secondaryAction: { flex: 1, minHeight: 45, borderRadius: 8, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "white" },
  secondaryActionText: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  shareOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 50 },
  shareBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.18)" },
  sharePanel: {
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
    backgroundColor: "#651087",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  copiedToast: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },
  copiedText: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 13, textAlign: "center" },
  shareHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  shareLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.22)" },
  shareTitle: { color: "rgba(255,255,255,0.55)", fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  shareGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", rowGap: 22, columnGap: 18 },
  shareTarget: { width: 56, alignItems: "center", gap: 8 },
  shareCircle: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  shareCircleText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  shareLabel: { color: "rgba(255,255,255,0.78)", fontFamily: "NotoSansKR_700Bold", fontSize: 11, textAlign: "center" },
});
