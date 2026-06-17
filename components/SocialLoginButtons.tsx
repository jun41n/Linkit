import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { BrandIcon, type BrandKey } from "@/components/BrandIcon";
import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

const PROVIDER_META: Record<
  BrandKey,
  { label: string; bg: string; fg: string; strategy: string; custom?: boolean; border?: boolean }
> = {
  kakao: { label: "Kakao", bg: "#FEE500", fg: "#191600", strategy: "oauth_custom_kakao", custom: true },
  naver: { label: "Naver", bg: "#03C75A", fg: "#FFFFFF", strategy: "oauth_custom_naver", custom: true },
  google: { label: "Google", bg: "#FFFFFF", fg: "#1F1F1F", strategy: "oauth_google", border: true },
  facebook: { label: "Facebook", bg: "#1877F2", fg: "#FFFFFF", strategy: "oauth_facebook" },
  instagram: { label: "Instagram", bg: "#FFFFFF", fg: "#1F1F1F", strategy: "oauth_custom_instagram", custom: true, border: true },
  apple: { label: "Apple", bg: "#000000", fg: "#FFFFFF", strategy: "oauth_apple" },
};

export function SocialLoginButtons() {
  const colors = useColors();
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    return () => {
      WebBrowser.maybeCompleteAuthSession();
    };
  }, []);

  const handlePress = async (brand: BrandKey) => {
    const meta = PROVIDER_META[brand];
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: meta.strategy as never,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(
        `${meta.label} 사용 불가`,
        meta.custom
          ? "관리자가 Clerk 대시보드에서 해당 OAuth 공급자(Custom Provider)를 활성화해야 사용할 수 있어요."
          : msg,
      );
    }
  };

  const providers: BrandKey[] = ["kakao", "naver", "google", "facebook", "instagram"];
  if (Platform.OS === "ios") providers.push("apple");

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>또는</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {providers.map((p) => {
        const meta = PROVIDER_META[p];
        return (
          <Pressable
            key={p}
            onPress={() => handlePress(p)}
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: meta.bg,
                opacity: pressed ? 0.85 : 1,
                borderWidth: meta.border ? 1 : 0,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.iconBox}>
              <BrandIcon brand={p} size={22} />
            </View>
            <Text style={[styles.btnLabel, { color: meta.fg }]}>{meta.label}</Text>
            <View style={styles.iconBox} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 18 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: "NotoSansKR_500Medium", fontSize: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
  },
  iconBox: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15, flex: 1, textAlign: "center" },
});
