import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}요일`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { getDiary, getEntriesForDiary } = useDiaries();

  const diary = id ? getDiary(id) : undefined;
  const entries = useMemo(() => (id ? getEntriesForDiary(id) : []), [id, getEntriesForDiary]);

  if (!diary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: "다이어리" }} />
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>다이어리를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paperWhite }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={[styles.titleChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.titleChipText, { color: colors.foreground }]}>{diary.name}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
        </View>
        <Pressable style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="share-outline" size={18} color={colors.foreground} />
        </Pressable>
        <Pressable style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyEmoji]}>📓</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>첫 페이지를 채워볼까요?</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              사진, 글, 영상, 스티커로 자유롭게 다꾸해 보세요
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/entry/${entry.id}`)}
              style={[
                styles.entryCard,
                { backgroundColor: entry.bgColor || colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.entryHeader}>
                <Text style={[styles.entryDate, { color: colors.foreground }]}>{formatDate(entry.createdAt)}</Text>
                <Text style={[styles.entryTime, { color: colors.mutedForeground }]}>{formatTime(entry.createdAt)}</Text>
              </View>

              {entry.photoUri && (
                <View style={styles.photoWrap}>
                  <Image source={{ uri: entry.photoUri }} style={styles.entryPhoto} />
                  {entry.stickers.slice(0, 6).map((s) => (
                    <Text
                      key={s.id}
                      style={[
                        styles.stickerOverlay,
                        {
                          left: `${s.x}%`,
                          top: `${s.y}%`,
                          fontSize: 24 * s.scale,
                          transform: [{ rotate: `${s.rotation}deg` }],
                        },
                      ]}
                    >
                      {s.emoji}
                    </Text>
                  ))}
                </View>
              )}

              {entry.title && (
                <Text style={[styles.entryTitle, { color: colors.foreground }]}>{entry.title}</Text>
              )}
              {entry.body && (
                <Text style={[styles.entryBody, { color: colors.foreground }]} numberOfLines={5}>
                  {entry.body}
                </Text>
              )}

              {!entry.photoUri && entry.stickers.length > 0 && (
                <View style={styles.stickerRow}>
                  {entry.stickers.slice(0, 8).map((s) => (
                    <Text key={s.id} style={styles.stickerInline}>
                      {s.emoji}
                    </Text>
                  ))}
                </View>
              )}

              {entry.isVideo && (
                <View style={[styles.videoBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="play" size={12} color="white" />
                  <Text style={styles.videoBadgeText}>세로영상</Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      <View style={styles.fabRow}>
        <Pressable
          onPress={() => router.push({ pathname: "/entry/new", params: { diaryId: diary.id, mode: "video" } })}
          style={[styles.fabSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="videocam-outline" size={20} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: "/entry/new", params: { diaryId: diary.id } })}
          style={[styles.fabMain, { backgroundColor: colors.foreground }]}
        >
          <Ionicons name="create-outline" size={20} color={colors.background} />
          <Text style={[styles.fabMainText, { color: colors.background }]}>오늘의 다꾸 쓰기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  titleChipText: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  content: { padding: 16, paddingBottom: 140, gap: 14 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 20 },
  emptyDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  entryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  entryHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  entryDate: { fontFamily: "NotoSansKR_700Bold", fontSize: 17 },
  entryTime: { fontFamily: "Inter_500Medium", fontSize: 12 },
  photoWrap: {
    position: "relative",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
  entryPhoto: { width: "100%", height: "100%" },
  stickerOverlay: { position: "absolute" },
  entryTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 18 },
  entryBody: { fontFamily: "NotoSansKR_400Regular", fontSize: 15, lineHeight: 22 },
  stickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  stickerInline: { fontSize: 22 },
  videoBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  videoBadgeText: { color: "white", fontFamily: "Inter_700Bold", fontSize: 11 },
  fabRow: {
    position: "absolute",
    bottom: 24,
    right: 16,
    left: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  fabSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  fabMainText: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
});
