import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DiaryBookCover } from "@/components/DiaryBookCover";
import { DiaryColor, DiaryKind, useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const COLOR_OPTIONS: { key: DiaryColor; hex: string; label: string }[] = [
  { key: "red", hex: "#F46A6A", label: "체리" },
  { key: "mint", hex: "#7FD8B8", label: "민트" },
  { key: "yellow", hex: "#FFD86B", label: "버터" },
  { key: "lavender", hex: "#C9B6F2", label: "라벤더" },
  { key: "blue", hex: "#8FB8F0", label: "블루" },
  { key: "orange", hex: "#FFA76A", label: "오렌지" },
];

const KIND_OPTIONS: { key: DiaryKind; label: string; desc: string }[] = [
  { key: "SOLO", label: "혼자 쓰는", desc: "나만 보는 비밀 일기" },
  { key: "SHARED", label: "함께 쓰는", desc: "친구/가족과 교환일기" },
  { key: "FAVORITE", label: "즐겨 쓰는", desc: "자주 펼치는 다이어리" },
];

export default function NewDiaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addDiary } = useDiaries();

  const [name, setName] = useState("");
  const [color, setColor] = useState<DiaryColor>("red");
  const [kind, setKind] = useState<DiaryKind>("SOLO");

  const handleCreate = async () => {
    const finalName = name.trim() || "이름 없는 다이어리";
    const created = await addDiary({
      name: finalName,
      color,
      kind,
      coverNumber: /^\d+$/.test(finalName) ? finalName : undefined,
    });
    router.back();
    setTimeout(() => router.push(`/diary/${created.id}`), 200);
  };

  const previewDiary = {
    id: "preview",
    name: name || "새 다이어리",
    color,
    kind,
    members: ["나"],
    createdAt: new Date().toISOString(),
    coverNumber: /^\d+$/.test(name) ? name : undefined,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <DiaryBookCover diary={previewDiary as any} size="lg" />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>다이어리 이름</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예: 260427, 우리들의 봄날"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>표지 색상</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setColor(c.key)}
              style={[
                styles.colorChip,
                { backgroundColor: c.hex, borderColor: color === c.key ? colors.foreground : "transparent" },
              ]}
            >
              {color === c.key && <Ionicons name="checkmark" size={20} color="white" />}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>분류</Text>
        <View style={styles.kindCol}>
          {KIND_OPTIONS.map((k) => {
            const active = kind === k.key;
            return (
              <Pressable
                key={k.key}
                onPress={() => setKind(k.key)}
                style={[
                  styles.kindRow,
                  {
                    backgroundColor: active ? colors.secondary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.kindLabel, { color: colors.foreground }]}>{k.label}</Text>
                  <Text style={[styles.kindDesc, { color: colors.mutedForeground }]}>{k.desc}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleCreate}
          style={[styles.createBtn, { backgroundColor: colors.foreground }]}
        >
          <Text style={[styles.createBtnText, { color: colors.background }]}>다이어리 만들기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 22, paddingBottom: 40, gap: 14 },
  preview: { alignItems: "center", paddingVertical: 12 },
  label: { fontFamily: "NotoSansKR_700Bold", fontSize: 16, marginTop: 6 },
  inputBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: { fontFamily: "NotoSansKR_700Bold", fontSize: 18 },
  colorRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  colorChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  kindCol: { gap: 10 },
  kindRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  kindLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  kindDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, marginTop: 2 },
  bottomBar: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1 },
  createBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  createBtnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 17 },
});
