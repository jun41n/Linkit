import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStickers } from "@/context/StickersContext";
import { useColors } from "@/hooks/useColors";

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { packs, isOwned, purchasePack } = useStickers();
  const [busy, setBusy] = useState(false);

  const pack = packs.find((p) => p.id === id);
  if (!pack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
        <Text style={{ padding: 22, color: colors.mutedForeground }}>스티커팩을 찾을 수 없습니다</Text>
      </SafeAreaView>
    );
  }

  const owned = isOwned(pack.id);

  const onPurchase = async () => {
    if (owned || busy) return;
    if (pack.isPaid) {
      Alert.alert(
        "구매 확인",
        `${pack.name}\n₩${pack.price.toLocaleString()}을 결제하시겠어요?`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "구매",
            onPress: async () => {
              setBusy(true);
              try {
                await purchasePack(pack.id);
                Alert.alert("구매 완료!", "이제 다꾸 화면에서 바로 사용할 수 있어요.");
              } finally {
                setBusy(false);
              }
            },
          },
        ],
        { cancelable: true, onDismiss: () => setBusy(false) }
      );
    } else {
      setBusy(true);
      try {
        await purchasePack(pack.id);
        router.back();
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Stack.Screen options={{ title: pack.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.cover, { backgroundColor: pack.themeColor }]}>
          <Text style={styles.coverEmoji}>{pack.coverEmoji}</Text>
        </View>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.packName, { color: colors.foreground }]}>{pack.name}</Text>
            <Text style={[styles.packDesc, { color: colors.mutedForeground }]}>{pack.description}</Text>
          </View>
          {pack.isPaid && (
            <View style={[styles.proPill, { backgroundColor: colors.proGold }]}>
              <Ionicons name="diamond" size={12} color="white" />
              <Text style={styles.proPillText}>PRO</Text>
            </View>
          )}
        </View>

        <View style={[styles.previewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>미리보기 ({pack.stickers.length}개)</Text>
          <View style={styles.stickerGrid}>
            {pack.stickers.map((s) => (
              <View key={s.id} style={[styles.stickerCell, { backgroundColor: colors.muted }]}>
                <Text style={styles.stickerEmoji}>{s.emoji}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {owned ? (
          <View style={[styles.btn, { backgroundColor: colors.softMint }]}>
            <Ionicons name="checkmark-circle" size={20} color="#1F7D54" />
            <Text style={[styles.btnText, { color: "#1F7D54" }]}>이미 보유중</Text>
          </View>
        ) : (
          <Pressable
            disabled={busy}
            onPress={onPurchase}
            style={[styles.btn, { backgroundColor: colors.foreground, opacity: busy ? 0.6 : 1 }]}
          >
            <Ionicons name={pack.isPaid ? "card" : "download"} size={20} color={colors.background} />
            <Text style={[styles.btnText, { color: colors.background }]}>
              {pack.isPaid ? `₩${pack.price.toLocaleString()} 구매하기` : "무료로 받기"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, gap: 14 },
  cover: {
    height: 180,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  coverEmoji: { fontSize: 88 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  packName: { fontFamily: "NotoSansKR_700Bold", fontSize: 22 },
  packDesc: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, marginTop: 4, lineHeight: 20 },
  proPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  proPillText: { color: "white", fontFamily: "Inter_700Bold", fontSize: 11 },
  previewBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  previewLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  stickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stickerCell: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerEmoji: { fontSize: 30 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
});
