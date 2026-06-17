import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ReviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string; duration: string }>();
  const { diaries, addEntry } = useDiaries();
  const videoRef = useRef<Video>(null);
  const [selectedDiaryIds, setSelectedDiaryIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [now] = useState(new Date());

  const eligibleDiaries = diaries.filter(
    (d) => d.kind === "SOLO" || d.kind === "SHARED"
  );

  useEffect(() => {
    if (eligibleDiaries.length > 0 && selectedDiaryIds.length === 0) {
      setSelectedDiaryIds([eligibleDiaries[0].id]);
    }
  }, [eligibleDiaries.length]);

  const toggleDiary = (id: string) => {
    setSelectedDiaryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUpload = async () => {
    if (!uri || selectedDiaryIds.length === 0) return;
    setUploading(true);
    try {
      for (const diaryId of selectedDiaryIds) {
        await addEntry({
          diaryId,
          body: "",
          videoUri: uri,
          isVideo: true,
          stickers: [],
          texts: [],
          photos: [],
        });
      }
      router.replace("/(tabs)/video");
    } catch {
      setUploading(false);
    }
  };

  if (!uri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]} edges={["top", "bottom"]}>
        <Text style={styles.errorText}>영상을 찾을 수 없어요</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.primary }]}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.videoWrap}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <View style={styles.topBar}>
          <Text style={styles.topLabel}>
            {selectedDiaryIds.length > 0
              ? diaries.find((d) => d.id === selectedDiaryIds[0])?.name ?? ""
              : ""}
            {selectedDiaryIds.length > 1 ? ` 외 ${selectedDiaryIds.length - 1}개` : ""}
            {" >"}
          </Text>
        </View>

        <Pressable
          onPress={handleUpload}
          disabled={uploading || selectedDiaryIds.length === 0}
          style={[
            styles.uploadBtn,
            { backgroundColor: colors.accent, opacity: uploading ? 0.5 : 1 },
          ]}
        >
          <Ionicons name="arrow-up" size={22} color="white" />
        </Pressable>

        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted={false}
        />

        <View style={styles.timeOverlay}>
          <Text style={styles.timeText}>{formatTime(now)}</Text>
        </View>

        <View style={styles.videoActions}>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="volume-high-outline" size={20} color="white" />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="download-outline" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.diaryList} contentContainerStyle={styles.diaryListContent}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          보낼 로그방:
        </Text>

        {eligibleDiaries.length === 0 && (
          <View style={[styles.emptyRow, { borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              먼저 로그방을 만들어 주세요
            </Text>
          </View>
        )}

        {eligibleDiaries.map((d) => {
          const selected = selectedDiaryIds.includes(d.id);
          return (
            <Pressable
              key={d.id}
              onPress={() => toggleDiary(d.id)}
              style={[
                styles.diaryRow,
                {
                  backgroundColor: selected ? colors.secondary : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: selected ? colors.accent : "transparent",
                    borderColor: selected ? colors.accent : colors.border,
                  },
                ]}
              >
                {selected && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <View style={styles.diaryInfo}>
                <Text style={[styles.diaryName, { color: colors.foreground }]}>
                  {d.name}
                </Text>
                <Text style={[styles.diaryMeta, { color: colors.mutedForeground }]}>
                  {d.members.length > 0 ? d.members.join(", ") : "나"}
                </Text>
              </View>
              <View style={styles.memberAvatars}>
                {(d.members.length > 0 ? d.members.slice(0, 2) : ["나"]).map(
                  (m, i) => (
                    <View
                      key={i}
                      style={[
                        styles.miniAvatar,
                        {
                          backgroundColor:
                            i === 0 ? "#FFB7C5" : "#E0E0E0",
                          marginLeft: i > 0 ? -8 : 0,
                        },
                      ]}
                    >
                      <Text style={styles.miniAvatarText}>:)</Text>
                    </View>
                  )
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoWrap: {
    height: 300,
    backgroundColor: "#111",
    position: "relative",
    overflow: "hidden",
    borderRadius: Platform.OS === "web" ? 0 : 18,
    margin: Platform.OS === "web" ? 0 : 12,
  },
  video: { width: "100%", height: "100%" },
  closeBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 12,
    left: 52,
    right: 52,
    zIndex: 20,
    alignItems: "center",
  },
  topLabel: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },
  uploadBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "rgba(255,255,255,0.7)",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 8,
  },
  videoActions: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  diaryList: { flex: 1, backgroundColor: "#000" },
  diaryListContent: { padding: 16, gap: 10, paddingBottom: 40 },
  sectionLabel: {
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 13,
    marginBottom: 4,
  },
  diaryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  diaryInfo: { flex: 1 },
  diaryName: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  diaryMeta: { fontFamily: "NotoSansKR_400Regular", fontSize: 12 },
  memberAvatars: { flexDirection: "row" },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    color: "white",
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 10,
  },
  emptyRow: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: { fontFamily: "NotoSansKR_500Medium", fontSize: 14 },
  errorText: {
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
  },
  linkText: { fontFamily: "NotoSansKR_500Medium", fontSize: 14, marginTop: 12 },
});
