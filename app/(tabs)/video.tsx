import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

function formatHour(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function VideoLogScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, diaries } = useDiaries();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logType, setLogType] = useState<"daily" | "travel">("daily");
  const logLabel = logType === "daily" ? "데일리 로그" : "트래블 로그";
  const logTint = logType === "daily" ? "#FFB7C5" : "#A8C8F0";
  const logEmoji = logType === "daily" ? "🌟" : "✈️";

  const videoEntries = useMemo(
    () => entries.filter((e) => e.isVideo || e.videoUri),
    [entries]
  );

  const todayVlog = diaries.find((d) => d.kind === "SOLO");
  const familyShared = diaries.find((d) => d.kind === "SHARED");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paperWhite }]} edges={["top"]}>
      <View style={styles.header}>
        <View style={[styles.titleChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable onPress={() => setMenuOpen((v) => !v)} style={styles.titleRow}>
            <View style={[styles.faceIcon, { backgroundColor: logTint }]}>
              <Text style={styles.faceIconText}>{logType === "daily" ? ":)" : "✈"}</Text>
            </View>
            <Text style={[styles.titleText, { color: colors.foreground }]} numberOfLines={1}>
              {logLabel}
            </Text>
            <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="share-outline" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {menuOpen && (
        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setLogType("daily");
              setMenuOpen(false);
            }}
          >
            <View style={styles.menuRow}>
              <View style={[styles.menuDot, { backgroundColor: "#FFB7C5" }]} />
              <Text style={[styles.menuText, { color: colors.foreground }]}>데일리 로그</Text>
              {logType === "daily" && (
                <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />
              )}
            </View>
            <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>매일의 짧은 일상 영상</Text>
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setLogType("travel");
              setMenuOpen(false);
            }}
          >
            <View style={styles.menuRow}>
              <View style={[styles.menuDot, { backgroundColor: "#A8C8F0" }]} />
              <Text style={[styles.menuText, { color: colors.foreground }]}>트래블 로그</Text>
              {logType === "travel" && (
                <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />
              )}
            </View>
            <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>여행지에서 남기는 기록</Text>
          </Pressable>
          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              router.push("/diary/new");
            }}
          >
            <Text style={[styles.menuText, { color: colors.foreground }]}>+ 로그 만들기</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.dotsRow}>
        <View style={[styles.dot, { backgroundColor: colors.foreground }]} />
        <View style={[styles.dot, { backgroundColor: "#FFB7C5" }]} />
        <View style={[styles.dot, { backgroundColor: colors.mutedForeground, opacity: 0.4 }]} />
        <View style={[styles.dot, { backgroundColor: colors.mutedForeground, opacity: 0.4 }]} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {todayVlog && (
          <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardLeft}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {logType === "daily" ? "vlog" : "travel log"}
                </Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                  {logType === "daily"
                    ? "나만의 공간, 매일 오전 4시에 하루 시작"
                    : "여행지에서의 순간을 모아 한 편의 영상으로"}
                </Text>
              </View>
              <Text style={styles.cardEmoji}>{logEmoji}</Text>
            </View>
          </View>
        )}

        {familyShared && (
          <Pressable
            onPress={() => router.push(`/diary/${familyShared.id}`)}
            style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardLeft}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{familyShared.name}</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                  로그 업로드 완료 10분
                </Text>
              </View>
              <View style={styles.faceRow}>
                <View style={[styles.faceMini, { backgroundColor: "#FFB7C5" }]}>
                  <Text style={styles.faceMiniText}>:)</Text>
                </View>
                <View style={[styles.faceMini, { backgroundColor: "#E0E0E0", marginLeft: -8 }]}>
                  <Text style={styles.faceMiniText}>:)</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}

        {videoEntries.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>오늘의 세로 영상</Text>
        )}

        {videoEntries.map((entry) => {
          const date = new Date(entry.createdAt);
          const member = diaries.find((d) => d.id === entry.diaryId)?.name ?? "나";
          return (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/entry/${entry.id}`)}
              style={[styles.videoCard, { backgroundColor: colors.foreground }]}
            >
              <View style={styles.videoCardTop}>
                <View style={[styles.faceMini, { backgroundColor: "#FFB7C5" }]}>
                  <Text style={styles.faceMiniText}>:)</Text>
                </View>
                <Text style={styles.videoMember}>{member}</Text>
              </View>
              {entry.photoUri ? (
                <Image source={{ uri: entry.photoUri }} style={styles.videoBg} />
              ) : (
                <View style={[styles.videoBg, { backgroundColor: "#1a1a1a" }]} />
              )}
              <Text style={styles.videoTime}>{formatHour(date)}</Text>
              <View style={styles.videoMore}>
                <Ionicons name="ellipsis-horizontal" size={16} color="white" />
              </View>
            </Pressable>
          );
        })}

        {videoEntries.length === 0 && (
          <View style={[styles.emptyVideo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyEmoji]}>{logType === "daily" ? "🎬" : "🧳"}</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {logType === "daily" ? "아직 영상이 없어요" : "여행 기록이 비어있어요"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {logType === "daily"
                ? "세로형 짧은 영상으로 하루를 기록해 보세요"
                : "여행지에서 짧은 영상을 모아 트래블 로그를 만들어 보세요"}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => router.push("/video/record")}
          style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.invitePlus, { borderColor: colors.border }]}>
            <Ionicons name="videocam" size={22} color={colors.foreground} />
          </View>
          <Text style={[styles.inviteText, { color: colors.foreground }]}>세로 영상 찍기</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/video/record")}
          style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.invitePlus, { borderColor: colors.border }]}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.foreground} />
          </View>
          <Text style={[styles.inviteText, { color: colors.foreground }]}>영상 업로드</Text>
        </Pressable>

        <Pressable style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.invitePlus, { borderColor: colors.border }]}>
            <Ionicons name="add" size={22} color={colors.foreground} />
          </View>
          <Text style={[styles.inviteText, { color: colors.foreground }]}>친구 초대</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    alignItems: "center",
    gap: 10,
  },
  titleChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  faceIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  faceIconText: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  titleText: { flex: 1, fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    position: "absolute",
    top: 60,
    left: 16,
    minWidth: 160,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuDot: { width: 10, height: 10, borderRadius: 5 },
  menuText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  menuSub: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, marginTop: 2, marginLeft: 20 },
  menuDivider: { height: 1 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  list: { padding: 16, paddingBottom: 140, gap: 12 },
  logCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardLeft: { flex: 1 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 4 },
  cardSub: { fontFamily: "NotoSansKR_400Regular", fontSize: 14 },
  cardEmoji: { fontSize: 28 },
  faceRow: { flexDirection: "row" },
  faceMini: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  faceMiniText: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 12 },
  sectionLabel: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 14, marginLeft: 2 },
  videoCard: {
    height: 360,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },
  videoCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    zIndex: 2,
  },
  videoMember: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  videoBg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  videoTime: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 8,
  },
  videoMore: { position: "absolute", right: 14, bottom: 14 },
  emptyVideo: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 18 },
  emptyDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, textAlign: "center" },
  inviteCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8,
  },
  invitePlus: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
});
