import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PhotoFrame, PlacedPhoto, useDiaries } from "@/context/DiariesContext";
import { getFontFamily } from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";

function formatFull(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function frameWrap(frame: PhotoFrame) {
  switch (frame) {
    case "polaroid":
      return { backgroundColor: "white", padding: 8, paddingBottom: 28, borderRadius: 4 };
    case "sticker":
      return { backgroundColor: "white", padding: 4, borderRadius: 12 };
    default:
      return {};
  }
}
function frameImage(frame: PhotoFrame, w: number, h: number) {
  switch (frame) {
    case "rounded":
      return { borderRadius: 16 };
    case "circle":
      return { borderRadius: Math.max(w, h) };
    case "sticker":
      return { borderRadius: 8 };
    case "polaroid":
      return { borderRadius: 2 };
    default:
      return { borderRadius: 4 };
  }
}

function PhotoView({ photo, canvasW, canvasH }: { photo: PlacedPhoto; canvasW: number; canvasH: number }) {
  const baseW = (photo.widthPct / 100) * canvasW;
  const baseH = baseW * (photo.aspectRatio || 1);
  const isCircle = photo.frame === "circle";
  const renderH = isCircle ? baseW : baseH;
  return (
    <View
      style={{
        position: "absolute",
        left: (photo.x / 100) * canvasW - baseW / 2,
        top: (photo.y / 100) * canvasH - renderH / 2,
        width: baseW,
        height: renderH,
        transform: [{ scale: photo.scale }, { rotate: `${photo.rotation}deg` }],
      }}
    >
      <View style={[{ width: "100%", height: "100%" }, frameWrap(photo.frame) as any]}>
        <Image
          source={{ uri: photo.uri }}
          style={[{ width: "100%", height: "100%" }, frameImage(photo.frame, baseW, renderH) as any]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { entries, deleteEntry, getDiary } = useDiaries();

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: "기록" }} />
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>기록을 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }
  const diary = getDiary(entry.diaryId);
  const appWidth = Math.min(width, 420);
  const canvasWidth = Math.max(280, appWidth - 32);
  const canvasHeight = entry.isVideo ? canvasWidth * 1.6 : canvasWidth * 1.2;
  const photos = entry.photos ?? [];

  const onDelete = () => {
    Alert.alert("삭제할까요?", "이 기록은 복구할 수 없어요.", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paperWhite }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{diary?.name ?? "기록"}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{formatFull(entry.createdAt)}</Text>
        </View>
        <Pressable onPress={onDelete} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.canvas,
            {
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: entry.bgColor || colors.paperWhite,
              borderColor: colors.border,
            },
          ]}
        >
          {entry.photoUri && photos.length === 0 && (
            <Image source={{ uri: entry.photoUri }} style={[styles.photo, { width: canvasWidth, height: canvasHeight }]} />
          )}
          {photos.map((p) => (
            <PhotoView key={p.id} photo={p} canvasW={canvasWidth} canvasH={canvasHeight} />
          ))}
          {entry.stickers.map((s) => (
            <Text
              key={s.id}
              style={[
                styles.sticker,
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: 36 * s.scale,
                  transform: [{ rotate: `${s.rotation}deg` }],
                },
              ]}
            >
              {s.emoji}
            </Text>
          ))}
          {entry.texts.map((t) => (
            <Text
              key={t.id}
              style={[
                styles.placedText,
                {
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  color: t.color,
                  fontSize: t.fontSize,
                  fontFamily: getFontFamily(t.fontId),
                },
              ]}
            >
              {t.text}
            </Text>
          ))}
          {entry.isVideo && (
            <View style={[styles.playOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
              <Ionicons name="play-circle" size={64} color="white" />
            </View>
          )}
        </View>

        {entry.body ? (
          <View style={[styles.bodyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{entry.body}</Text>
          </View>
        ) : null}
      </ScrollView>
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
  headerTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  content: { padding: 16, gap: 14, alignItems: "center" },
  canvas: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  photo: { position: "absolute", top: 0, left: 0 },
  sticker: { position: "absolute" },
  placedText: { position: "absolute", fontFamily: "NotoSansKR_700Bold" },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  bodyBox: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16 },
  bodyText: { fontFamily: "NotoSansKR_400Regular", fontSize: 16, lineHeight: 24 },
});
