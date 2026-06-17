import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Diary, DiaryColor } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const COLOR_MAP: Record<DiaryColor, { base: string; dark: string; light: string }> = {
  red: { base: "#F46A6A", dark: "#D94B4B", light: "#FCA5A5" },
  mint: { base: "#7FD8B8", dark: "#52C29A", light: "#B7ECD7" },
  yellow: { base: "#FFD86B", dark: "#E6BE3C", light: "#FFE9A8" },
  lavender: { base: "#C9B6F2", dark: "#A88EE0", light: "#E0D4F7" },
  blue: { base: "#8FB8F0", dark: "#6F9BDB", light: "#C5DAF6" },
  orange: { base: "#FFA76A", dark: "#E0894B", light: "#FFD3B6" },
};

interface Props {
  diary: Diary;
  onPress?: () => void;
  size?: "sm" | "md" | "lg";
}

export function DiaryBookCover({ diary, onPress, size = "md" }: Props) {
  const colors = useColors();
  const palette = COLOR_MAP[diary.color] ?? COLOR_MAP.red;
  const dimensions = {
    sm: { w: 100, h: 130, font: 16, sub: 11 },
    md: { w: 140, h: 180, font: 22, sub: 13 },
    lg: { w: 180, h: 230, font: 28, sub: 15 },
  }[size];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <View style={[styles.book, { width: dimensions.w, height: dimensions.h, backgroundColor: palette.base }]}>
        <View style={[styles.spine, { backgroundColor: palette.dark }]} />
        <View style={[styles.clasp, { backgroundColor: palette.dark }]} />
        <View style={styles.coverInner}>
          <Text style={[styles.coverNumber, { fontSize: dimensions.font }]} numberOfLines={1}>
            {diary.coverNumber || diary.name}
          </Text>
          <Text style={[styles.memberCount, { fontSize: dimensions.sub }]}>
            멤버 {diary.members.length}명
          </Text>
        </View>
      </View>
      {!diary.coverNumber && (
        <Text style={[styles.diaryLabel, { color: colors.foreground }]} numberOfLines={1}>
          {diary.name}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  book: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 4, height: 6 },
    shadowRadius: 8,
    elevation: 5,
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  clasp: {
    position: "absolute",
    right: -2,
    top: "50%",
    width: 14,
    height: 22,
    borderRadius: 4,
    transform: [{ translateY: -11 }],
  },
  coverInner: {
    flex: 1,
    paddingLeft: 18,
    paddingRight: 14,
    paddingTop: 26,
    paddingBottom: 22,
    justifyContent: "space-between",
  },
  coverNumber: {
    color: "white",
    fontFamily: "NotoSansKR_700Bold",
    letterSpacing: 1,
  },
  memberCount: {
    color: "white",
    fontFamily: "NotoSansKR_400Regular",
    opacity: 0.9,
  },
  diaryLabel: {
    marginTop: 8,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 140,
  },
});
