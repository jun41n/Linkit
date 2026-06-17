import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { useStickers } from "@/context/StickersContext";
import { useColors } from "@/hooks/useColors";

export default function StoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { packs, isOwned } = useStickers();

  const free = packs.filter((p) => !p.isPaid);
  const paid = packs.filter((p) => p.isPaid);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Stack.Screen options={{ title: "스티커 스토어" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.foreground }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTag}>NEW</Text>
            <Text style={styles.bannerTitle}>오늘의 다꾸를 더 이쁘게</Text>
            <Text style={styles.bannerSub}>프리미엄 스티커팩으로 페이지를 채워보세요</Text>
          </View>
          <Text style={styles.bannerEmoji}>🎀</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>무료 스티커팩</Text>
        <View style={styles.grid}>
          {free.map((p) => (
            <PackCard
              key={p.id}
              pack={p}
              owned={isOwned(p.id)}
              onPress={() => router.push(`/store/${p.id}`)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>프리미엄 스티커팩</Text>
        <View style={styles.grid}>
          {paid.map((p) => (
            <PackCard
              key={p.id}
              pack={p}
              owned={isOwned(p.id)}
              onPress={() => router.push(`/store/${p.id}`)}
            />
          ))}
        </View>

        <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.secondaryForeground} />
          <Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>
            결제는 앱스토어/구글플레이 인앱결제로 안전하게 처리됩니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PackCard({
  pack,
  owned,
  onPress,
}: {
  pack: ReturnType<typeof useStickers>["packs"][number];
  owned: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <GlassSurface variant="card" tone="neutral" borderRadius={16} style={styles.packCard}>
      <Pressable onPress={onPress}>
        <View style={[styles.packCover, { backgroundColor: pack.themeColor }]}>
          <Text style={styles.packCoverEmoji}>{pack.coverEmoji}</Text>
          {pack.isPaid && (
            <View style={[styles.proBadge, { backgroundColor: colors.proGold }]}>
              <Ionicons name="diamond" size={10} color="white" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <View style={styles.packInfo}>
          <Text style={[styles.packName, { color: colors.foreground }]} numberOfLines={1}>
            {pack.name}
          </Text>
          <Text style={[styles.packDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {pack.description}
          </Text>
          <View style={styles.packBottom}>
            {owned ? (
              <View style={[styles.ownedBadge, { backgroundColor: colors.softMint }]}>
                <Ionicons name="checkmark" size={12} color="#1F7D54" />
                <Text style={[styles.ownedText, { color: "#1F7D54" }]}>보유중</Text>
              </View>
            ) : pack.isPaid ? (
              <Text style={[styles.priceText, { color: colors.foreground }]}>₩{pack.price.toLocaleString()}</Text>
            ) : (
              <Text style={[styles.priceText, { color: colors.foreground }]}>무료</Text>
            )}
          </View>
        </View>
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 60, gap: 14 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    gap: 8,
  },
  bannerTag: { color: "#FFD86B", fontFamily: "Inter_700Bold", fontSize: 11, marginBottom: 4 },
  bannerTitle: { color: "white", fontFamily: "NotoSansKR_700Bold", fontSize: 19 },
  bannerSub: { color: "rgba(255,255,255,0.8)", fontFamily: "NotoSansKR_400Regular", fontSize: 13, marginTop: 2 },
  bannerEmoji: { fontSize: 50 },
  sectionTitle: { fontFamily: "NotoSansKR_700Bold", fontSize: 18, marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  packCard: {
    width: "47%",
    overflow: "hidden",
  },
  packCover: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  packCoverEmoji: { fontSize: 48 },
  proBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  proBadgeText: { color: "white", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.5 },
  packInfo: { padding: 12, gap: 4 },
  packName: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  packDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 12, minHeight: 32 },
  packBottom: { marginTop: 6 },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ownedText: { fontFamily: "NotoSansKR_700Bold", fontSize: 11 },
  priceText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  noticeText: { flex: 1, fontFamily: "NotoSansKR_400Regular", fontSize: 13 },
});
