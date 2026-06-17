import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const SAMPLE = [
  { name: "서우", message: "ㅋㅎㅋㅋㅋㅋ맞긴허지", when: "어제" },
  { name: "서우", message: "오 경치 이쁘다", when: "어제" },
  { name: "서우", message: "별내", when: "어제" },
  { name: "서우", message: "버스임", when: "어제" },
  { name: "서우", message: "7시쯤 가려고 생각하고 잇음", when: "어제" },
  { name: "서우", message: "비빔밥?", when: "어제" },
  { name: "서우", message: "운동 열시미해", when: "1일" },
  { name: "서우", message: "오 ㅋㅎㅋㅋㅋ", when: "2일" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={[styles.title, { color: colors.foreground }]}>활동</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {SAMPLE.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
              <Ionicons name="happy" size={24} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.message, { color: colors.foreground }]}>
                <Text style={styles.bold}>{item.name}</Text> 님이 "{item.message}"라고 답장했어요
              </Text>
              <Text style={[styles.when, { color: colors.mutedForeground }]}>{item.when}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { flex: 1, textAlign: "center", fontFamily: "NotoSansKR_700Bold", fontSize: 18 },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 14 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { fontFamily: "NotoSansKR_400Regular", fontSize: 15, lineHeight: 22 },
  bold: { fontFamily: "NotoSansKR_700Bold" },
  when: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, marginTop: 2 },
});
