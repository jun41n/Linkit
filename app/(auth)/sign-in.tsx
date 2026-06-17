import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const T = {
  title: "진짜 링킷",
  headline: "\uB514\uC9C0\uD138 \uB2E4\uAFB8, \uB9AC\uC5BC \uBE0C\uC774\uB85C\uADF8, AI \uC774\uC131\uCE5C\uAD6C\uB97C \uD55C\uACF3\uC5D0\uC11C.",
  desc: "\uB2E4\uC774\uC5B4\uB9AC\uB294 \uC2A4\uD2F0\uCEE4\uC640 \uC0AC\uC9C4\uC73C\uB85C \uAFB8\uBBF8\uB294 \uB514\uC9C0\uD138 \uB2E4\uAFB8, \uBE0C\uC774\uB85C\uADF8\uB294 \uCE5C\uAD6C\uB4E4\uACFC 2\uCD08\uC9DC\uB9AC \uB9AC\uC5BC \uC21C\uAC04 \uACF5\uC720, AI \uC774\uC131\uCE5C\uAD6C\uB294 \uACE0\uBBFC\uC0C1\uB2F4\uACFC \uC2A4\uD2B8\uB808\uC2A4 \uD574\uC18C\uB97C \uD568\uAED8\uD558\uB294 \uACF5\uAC04\uC774\uC5D0\uC694.",
  kakao: "\uCE74\uCE74\uC624\uB85C \uACC4\uC18D\uD558\uAE30",
  naver: "\uB124\uC774\uBC84\uB85C \uACC4\uC18D\uD558\uAE30",
  google: "Google\uB85C \uACC4\uC18D\uD558\uAE30",
  email: "\uB610\uB294 \uC774\uBA54\uC77C\uB85C \uB85C\uADF8\uC778",
  login: "\uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778",
  guide: "\uB85C\uADF8\uC778 \uD6C4 \uBE0C\uC774\uB85C\uADF8\uB85C \uBA3C\uC800 \uB4E4\uC5B4\uAC00\uACE0, \uD558\uB2E8 \uD0ED\uC5D0\uC11C \uB2E4\uC774\uC5B4\uB9AC\uC640 AI \uC774\uC131\uCE5C\uAD6C\uCC44\uD305\uC744 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.",
  notice: "\uD604\uC7AC\uB294 \uAC1C\uBC1C\uC6A9 \uB85C\uADF8\uC778\uC785\uB2C8\uB2E4. \uC2E4\uC81C OAuth\uB294 \uAC01 \uD50C\uB7AB\uD3FC Client ID \uBC1C\uAE09 \uD6C4 \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
};

export default function IntroLoginScreen() {
  const router = useRouter();
  const enterApp = () => router.replace("/video");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LinearGradient colors={["#eef7ff", "#fbf4ff", "#fff8fb"]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <LinearGradient colors={["rgba(255,255,255,0.96)", "rgba(255,255,255,0.74)", "rgba(244,249,255,0.62)"]} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />
            <View style={styles.cardShine} />
            <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>{T.title}</Text>
            <Text style={styles.headline}>{T.headline}</Text>
            <Text style={styles.description}>{T.desc}</Text>
            <Pressable onPress={enterApp} style={[styles.socialButton, styles.kakao]}><View style={styles.buttonGloss} /><Text style={styles.kakaoText}>{T.kakao}</Text></Pressable>
            <Pressable onPress={enterApp} style={[styles.socialButton, styles.naver]}><View style={styles.buttonGloss} /><Text style={styles.naverText}>{T.naver}</Text></Pressable>
            <Pressable onPress={enterApp} style={[styles.socialButton, styles.google]}><View style={styles.buttonGloss} /><Text style={styles.googleText}>{T.google}</Text></Pressable>
            <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>{T.email}</Text><View style={styles.divider} /></View>
            <TextInput defaultValue="demo@linkit.local" autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={styles.input} />
            <TextInput defaultValue="secret" secureTextEntry autoComplete="current-password" style={styles.input} />
            <Pressable onPress={enterApp} style={styles.accountButton}><LinearGradient colors={["#2587e6", "#7c61d6", "#f1669d"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /><View style={styles.buttonGloss} /><Text style={styles.accountButtonText}>{T.login}</Text></Pressable>
            <Text style={styles.loginGuide}>{T.guide}</Text>
            <Text style={styles.notice}>{T.notice}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef7ff" },
  keyboard: { flex: 1 },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { flexGrow: 1, justifyContent: "flex-start", paddingHorizontal: 10, paddingVertical: 12, backgroundColor: "transparent" },
  card: { width: "100%", maxWidth: 420, alignSelf: "center", backgroundColor: "rgba(255,255,255,0.64)", borderWidth: 1, borderColor: "rgba(255,255,255,0.86)", borderRadius: 24, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 25, overflow: "hidden", shadowColor: "#7c61d6", shadowOpacity: 0.18, shadowOffset: { width: 0, height: 28 }, shadowRadius: 52 },
  cardShine: { position: "absolute", top: 0, left: 18, right: 18, height: 1, backgroundColor: "rgba(255,255,255,0.96)" },
  logo: { width: 300, height: 190, alignSelf: "center", marginBottom: 4 },
  title: { marginTop: 0, color: "#2587e6", fontFamily: "NotoSansKR_700Bold", fontSize: 26 },
  headline: { marginTop: 8, color: "#172033", fontFamily: "NotoSansKR_700Bold", fontSize: 17, lineHeight: 25 },
  description: { marginTop: 8, marginBottom: 20, color: "#596a8a", fontFamily: "NotoSansKR_400Regular", fontSize: 14, lineHeight: 22 },
  socialButton: { height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 11, overflow: "hidden", shadowColor: "#7c61d6", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 8 }, shadowRadius: 18 },
  kakao: { backgroundColor: "#FEE500" },
  naver: { backgroundColor: "#03C75A" },
  google: { backgroundColor: "rgba(255,255,255,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.92)" },
  kakaoText: { color: "#191919", fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  naverText: { color: "#ffffff", fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  googleText: { color: "#1f2933", fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 15 },
  divider: { flex: 1, height: 1, backgroundColor: "#e7ddf5" },
  dividerText: { color: "#9aa6bd", fontFamily: "NotoSansKR_400Regular", fontSize: 12 },
  input: { height: 45, borderWidth: 1, borderColor: "rgba(185,220,255,0.86)", borderRadius: 14, paddingHorizontal: 12, marginBottom: 10, color: "#172033", fontFamily: "Inter_400Regular", fontSize: 15, backgroundColor: "rgba(255,255,255,0.7)" },
  accountButton: { height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2, overflow: "hidden", shadowColor: "#f1669d", shadowOpacity: 0.24, shadowOffset: { width: 0, height: 10 }, shadowRadius: 18 },
  buttonGloss: { position: "absolute", top: 0, left: 10, right: 10, height: 1, backgroundColor: "rgba(255,255,255,0.7)", opacity: 0.95 },
  accountButtonText: { color: "#ffffff", fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  loginGuide: { color: "#596a8a", fontFamily: "NotoSansKR_400Regular", fontSize: 13, lineHeight: 19, marginTop: 13 },
  notice: { color: "#8390a7", fontFamily: "NotoSansKR_400Regular", fontSize: 12, lineHeight: 18, marginTop: 24 },
});
