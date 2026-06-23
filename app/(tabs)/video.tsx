import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const inviteUrl = "http://158.179.162.39:8031/";
const inviteText = "진짜 링킷에서 같이 기록해요.";

type ShareTarget = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  bg: string;
  color: string;
  action: "copy" | "native" | "url";
  url?: string;
};

const encodedInviteUrl = encodeURIComponent(inviteUrl);
const encodedInviteText = encodeURIComponent(inviteText);

const shareTargets: ShareTarget[] = [
  { label: "링크 복사", icon: "link-outline", bg: "#8D49B3", color: "white", action: "copy" },
  { label: "X", text: "X", bg: "#050008", color: "white", action: "url", url: `https://twitter.com/intent/tweet?text=${encodedInviteText}&url=${encodedInviteUrl}` },
  { label: "페북", icon: "logo-facebook", bg: "#1877F2", color: "white", action: "url", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedInviteUrl}` },
  { label: "인스타", icon: "logo-instagram", bg: "#F15A80", color: "white", action: "native" },
  { label: "카카오", text: "●", bg: "#FFE500", color: "#3C1E1E", action: "url", url: `https://sharer.kakao.com/talk/friends/picker/link?url=${encodedInviteUrl}` },
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
    await clipboard.writeText(inviteUrl);
    return true;
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

export default function VideoLogScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, diaries } = useDiaries();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [logType, setLogType] = useState<"daily" | "travel" | "shared">("daily");
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const logLabel = logType === "daily" ? "데일리 로그" : logType === "travel" ? "여행 로그" : "함께 찍은";
  const logTint = logType === "daily" ? "#FF6B6B" : logType === "travel" ? "#A8C8F0" : "#FFB7C5";

  const videoEntries = useMemo(
    () => entries.filter((e) => e.isVideo || e.videoUri),
    [entries]
  );

  const todayVlog = diaries.find((d) => d.kind === "SOLO");
  const familyShared = diaries.find((d) => d.kind === "SHARED");

  const filteredVideoEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return videoEntries;
    return videoEntries.filter((entry) => {
      const diaryName = diaries.find((d) => d.id === entry.diaryId)?.name ?? "";
      return diaryName.toLowerCase().includes(keyword) || (entry.text ?? "").toLowerCase().includes(keyword);
    });
  }, [videoEntries, diaries, search]);

  const showInvitePanel = async () => {
    const copied = await copyInviteLink();
    setShareMessage(copied ? "링크가 카피되었습니다." : "링크를 복사하지 못했어요. 아래 버튼으로 공유해 주세요.");
    setSharePanelOpen(true);
  };

  const handleShareTarget = async (target: ShareTarget) => {
    try {
      await openShare(target);
      setShareMessage(target.action === "copy" ? "링크가 카피되었습니다." : `${target.label} 공유창을 열었습니다.`);
    } catch {
      const copied = await copyInviteLink();
      setShareMessage(copied ? "공유창을 열지 못해서 링크를 대신 카피했습니다." : "공유창을 열지 못했어요.");
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
        <GlassSurface variant="pill" tone="warm" style={styles.editBtnGlass}>
          <Pressable onPress={showInvitePanel} style={styles.editBtnInner}>
            <Ionicons name="share-outline" size={16} color={colors.foreground} />
            <Text style={[styles.editText, { color: colors.foreground }]}>공유</Text>
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
              onPress={() => setLogType(tab.key as "daily" | "travel" | "shared")}
              style={[styles.tab, { backgroundColor: active ? colors.card : colors.muted }, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.shelfContent} style={{ backgroundColor: colors.paperWhite }}>
        <View style={styles.vlogGrid}>
          <Pressable onPress={() => router.push("/video/record")} style={[styles.vlogBook, { backgroundColor: logTint }]}>
            <Text style={styles.vlogBookTitle}>{logType === "shared" && familyShared ? familyShared.name : logLabel}</Text>
            <Text style={styles.vlogBookMeta}>{logType === "shared" ? "멤버 2명" : "오늘의 기록"}</Text>
            <View style={styles.vlogBookTab} />
          </Pressable>

          {filteredVideoEntries.map((entry) => {
            const date = new Date(entry.createdAt);
            const member = diaries.find((d) => d.id === entry.diaryId)?.name ?? "vlog";
            return (
              <Pressable key={entry.id} onPress={() => router.push(`/entry/${entry.id}`)} style={[styles.vlogBook, styles.videoBook]}>
                {entry.photoUri ? <Image source={{ uri: entry.photoUri }} style={styles.vlogBookImage} /> : null}
                <View style={styles.vlogBookShade} />
                <Text style={styles.vlogBookTitle}>{member}</Text>
                <Text style={styles.vlogBookMeta}>{formatHour(date)}</Text>
                <View style={styles.vlogBookTab} />
              </Pressable>
            );
          })}
        </View>

        {filteredVideoEntries.length === 0 && (
          <View style={styles.emptyShelfNote}>
            <Text style={[styles.emptyShelfText, { color: colors.mutedForeground }]}>아직 영상이 없어요</Text>
          </View>
        )}
      </ScrollView>

      <GlassSurface variant="card" tone="warm" style={styles.fab} borderRadius={16}>
        <Pressable onPress={() => router.push("/video/record")} style={styles.fabInner}>
          <Ionicons name="add" size={24} color={colors.foreground} />
        </Pressable>
      </GlassSurface>

      <GlassSurface variant="pill" tone="pink" style={styles.storeFab}>
        <Pressable onPress={showInvitePanel} style={styles.storeFabInner}>
          <Ionicons name="person-add" size={16} color={colors.primary} />
          <Text style={[styles.storeFabText, { color: colors.primary }]}>친구 초대</Text>
        </Pressable>
      </GlassSurface>
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
  editBtnGlass: { alignSelf: "center" },
  editBtnInner: { paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  searchBar: { marginHorizontal: 22, marginTop: 8 },
  searchBarInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, fontFamily: "NotoSansKR_400Regular", fontSize: 15 },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
    marginTop: 14,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  shelfContent: { padding: 22, paddingBottom: 140, minHeight: 400 },
  vlogGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18, alignItems: "flex-start" },
  vlogBook: {
    width: 142,
    height: 180,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 26,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 8,
    elevation: 4,
  },
  videoBook: { backgroundColor: "#2D2648" },
  vlogBookImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", opacity: 0.72 },
  vlogBookShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(25,20,40,0.32)" },
  vlogBookTitle: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 23, zIndex: 2 },
  vlogBookMeta: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 13, zIndex: 2 },
  vlogBookTab: {
    position: "absolute",
    right: 0,
    top: 78,
    width: 14,
    height: 24,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  emptyShelfNote: { width: "100%", alignItems: "center", paddingTop: 24 },
  emptyShelfText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 22,
    width: 50,
    height: 50,
  },
  fabInner: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  storeFab: {
    position: "absolute",
    bottom: 100,
    left: 22,
  },
  storeFabInner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeFabText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  shareOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 50,
  },
  shareBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
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
  copiedText: {
    color: "white",
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 13,
    textAlign: "center",
  },
  shareHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  shareLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  shareTitle: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 13,
  },
  shareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    rowGap: 22,
    columnGap: 18,
  },
  shareTarget: {
    width: 56,
    alignItems: "center",
    gap: 8,
  },
  shareCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  shareCircleText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  shareLabel: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 11,
    textAlign: "center",
  },
});
