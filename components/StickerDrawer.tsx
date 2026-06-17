import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { GlassSurface } from "@/components/GlassSurface";
import { useStickers } from "@/context/StickersContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  onPick: (emoji: string, stickerId: string) => void;
  height?: number;
}

export function StickerDrawer({ onPick, height = 240 }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { packs, isOwned, searchStickers } = useStickers();
  const [activePackId, setActivePackId] = useState(packs[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const ownedPacks = useMemo(() => packs.filter((p) => isOwned(p.id)), [packs, isOwned]);
  const activePack = ownedPacks.find((p) => p.id === activePackId) ?? ownedPacks[0];

  const searching = query.trim().length > 0;
  const searchResults = useMemo(() => searchStickers(query), [searchStickers, query]);

  const renderEmoji = ({ item }: { item: { id: string; emoji: string; packId?: string } }) => (
    <Pressable
      onPress={() => onPick(item.emoji, item.id)}
      style={({ pressed }) => [styles.stickerCell, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={styles.stickerEmoji}>{item.emoji}</Text>
    </Pressable>
  );

  return (
    <GlassSurface variant="card" tone="warm" borderRadius={0} style={{ height }} noShadow>
      <View style={{ height }}>
        <View style={styles.searchWrap}>
          <GlassSurface variant="pill" tone="neutral" noShadow>
            <View style={styles.searchInputInner}>
              <Ionicons name="search" size={17} color={colors.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="원하는 이모지 검색"
                placeholderTextColor={colors.mutedForeground}
                autoCorrect={false}
                style={[styles.searchField, { color: colors.foreground }]}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={17} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          </GlassSurface>
        </View>

        {!searching && (
          <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
            <FlatList
              horizontal
              data={ownedPacks}
              keyExtractor={(pack) => pack.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
              renderItem={({ item }) => {
                const active = activePack?.id === item.id;
                return (
                  <Pressable
                    onPress={() => setActivePackId(item.id)}
                    style={[
                      styles.packTab,
                      {
                        backgroundColor: active ? item.themeColor : "rgba(255,255,255,0.4)",
                        borderColor: active ? item.themeColor : "rgba(255,255,255,0.7)",
                      },
                    ]}
                  >
                    <Text style={styles.packEmoji}>{item.coverEmoji}</Text>
                  </Pressable>
                );
              }}
            />
            <GlassSurface variant="pill" tone="pink" style={{ marginRight: 12 }}>
              <Pressable onPress={() => router.push("/store")} style={styles.storeBtnInner}>
                <Ionicons name="bag-add" size={14} color={colors.primary} />
                <Text style={[styles.storeBtnText, { color: colors.primary }]}>스토어</Text>
              </Pressable>
            </GlassSurface>
          </View>
        )}

        {searching ? (
          searchResults.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontFamily: "NotoSansKR_500Medium", color: colors.mutedForeground, fontSize: 14 }}>
                검색 결과가 없어요
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(sticker) => `${sticker.packId}_${sticker.id}`}
              numColumns={6}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.grid}
              renderItem={renderEmoji}
            />
          )
        ) : (
          <FlatList
            data={activePack?.stickers ?? []}
            keyExtractor={(sticker) => sticker.id}
            numColumns={6}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.grid}
            renderItem={renderEmoji}
          />
        )}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchInputInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchField: {
    flex: 1,
    fontFamily: "NotoSansKR_400Regular",
    fontSize: 14,
    paddingVertical: 0,
    outlineStyle: "none" as any,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  packTab: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  packEmoji: { fontSize: 22 },
  storeBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  storeBtnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 12 },
  grid: { padding: 8 },
  stickerCell: {
    flex: 1 / 6,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerEmoji: { fontSize: 28 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
