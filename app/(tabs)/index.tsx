import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DiaryBookCover } from "@/components/DiaryBookCover";
import { GlassSurface } from "@/components/GlassSurface";
import { DiaryKind, useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const TABS: { key: DiaryKind; label: string }[] = [
  { key: "SHARED", label: "함께 쓰는" },
  { key: "FAVORITE", label: "즐겨 쓰는" },
  { key: "SOLO", label: "혼자 쓰는" },
];

export default function BookshelfScreen() {
  const colors = useColors();
  const router = useRouter();
  const { diaries, loading } = useDiaries();
  const [activeTab, setActiveTab] = useState<DiaryKind>("SOLO");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);

  const filtered = useMemo(() => {
    let list = diaries.filter((d) => d.kind === activeTab);
    if (search.trim()) {
      list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [diaries, activeTab, search]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>june 님의</Text>
          <View style={styles.titleRow}>
            <View style={[styles.highlightWrap]}>
              <View style={[styles.highlight, { backgroundColor: colors.highlightYellow }]} />
              <Text style={[styles.bookshelfTitle, { color: colors.foreground }]}>책장</Text>
            </View>
            <Text style={[styles.smile, { color: colors.foreground }]}>:)</Text>
          </View>
        </View>
        {editing ? (
          <Pressable onPress={() => setEditing(false)} style={[styles.editBtn, { backgroundColor: colors.foreground }]}>
            <Text style={{ color: colors.card, fontFamily: "NotoSansKR_700Bold", fontSize: 14 }}>완료</Text>
          </Pressable>
        ) : (
          <GlassSurface variant="pill" tone="warm" style={styles.editBtnGlass}>
            <Pressable onPress={() => setEditing(true)} style={styles.editBtnInner}>
              <Text style={{ color: colors.foreground, fontFamily: "NotoSansKR_700Bold", fontSize: 14 }}>편집</Text>
            </Pressable>
          </GlassSurface>
        )}
      </View>

      <GlassSurface variant="pill" tone="warm" style={styles.searchBar}>
        <View style={styles.searchBarInner}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="다이어리 이름 검색"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
        </View>
      </GlassSurface>

      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[
                styles.tab,
                { backgroundColor: active ? colors.card : colors.muted },
                active && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.shelfContent}
        style={{ backgroundColor: colors.paperWhite }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              아직 다이어리가{"\n"}하나도 없어요  :O
            </Text>
          </View>
        ) : (
          <View style={styles.bookGrid}>
            {filtered.map((d) => (
              <View key={d.id} style={styles.bookSlot}>
                <DiaryBookCover diary={d} onPress={() => router.push(`/diary/${d.id}`)} />
                {editing && (
                  <Pressable
                    onPress={() => router.push(`/diary/${d.id}?edit=1`)}
                    style={[styles.editBadge, { backgroundColor: colors.foreground }]}
                  >
                    <Ionicons name="pencil" size={12} color={colors.card} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <GlassSurface variant="card" tone="warm" style={styles.fab} borderRadius={16}>
        <Pressable onPress={() => router.push("/diary/new")} style={styles.fabInner}>
          <Ionicons name="add" size={24} color={colors.foreground} />
        </Pressable>
      </GlassSurface>

      <GlassSurface variant="pill" tone="pink" style={styles.storeFab}>
        <Pressable onPress={() => router.push("/store")} style={styles.storeFabInner}>
          <Ionicons name="pricetag" size={16} color={colors.primary} />
          <Text style={[styles.storeFabText, { color: colors.primary }]}>스티커샵</Text>
        </Pressable>
      </GlassSurface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editBtnGlass: { alignSelf: "center" },
  editBtnInner: { paddingHorizontal: 14, paddingVertical: 8 },
  searchBar: {
    marginHorizontal: 22,
    marginTop: 8,
  },
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
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: {
    fontFamily: "NotoSansKR_400Regular",
    fontSize: 22,
    textAlign: "center",
    lineHeight: 36,
    opacity: 0.6,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  bookSlot: { position: "relative" },
  editBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
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
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeFabText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
});
