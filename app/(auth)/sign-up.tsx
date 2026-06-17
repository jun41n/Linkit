import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthBackdrop } from "@/components/AuthBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { useColors } from "@/hooks/useColors";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";
  const verifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress: emailAddress.trim(), password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: () => router.replace("/(tabs)"),
      });
    }
  };

  const resend = async () => {
    await signUp.verifications.sendEmailCode();
  };

  const rawErr = errors?.raw?.[0] as { longMessage?: string; message?: string } | undefined;
  const generalError =
    errors?.fields?.emailAddress?.message ||
    errors?.fields?.password?.message ||
    errors?.fields?.code?.message ||
    rawErr?.longMessage ||
    rawErr?.message;

  if (verifying) {
    const canVerify = code.trim().length >= 4 && !isLoading;
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <AuthBackdrop />
        <ScrollView style={styles.scrollOuter} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>이메일 인증코드를 보냈어요</Text>
          </View>

          <GlassSurface variant="card" tone="warm" borderRadius={24} style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={[styles.title, { color: colors.foreground }]}>이메일 인증</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {emailAddress} 으로 받은 6자리 코드를 입력해 주세요
              </Text>

              <Text style={[styles.label, { color: colors.foreground }]}>인증코드</Text>
              <GlassSurface variant="pill" tone="neutral" noShadow>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={8}
                  style={[styles.input, styles.codeInput, { color: colors.foreground }]}
                />
              </GlassSurface>

              {generalError && <Text style={[styles.error, { color: colors.destructive }]}>{generalError}</Text>}

              <Pressable
                onPress={handleVerify}
                disabled={!canVerify}
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: canVerify ? 1 : 0.4 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>인증 완료</Text>
                )}
              </Pressable>

              <Pressable onPress={resend} style={styles.resendBtn}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>코드 다시 받기</Text>
              </Pressable>
            </View>
          </GlassSurface>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const canSubmit = emailAddress.trim().length > 0 && password.length >= 8 && !isLoading;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AuthBackdrop />
      <ScrollView style={styles.scrollOuter} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>나만의 다꾸 다이어리 시작하기</Text>
        </View>

        <GlassSurface variant="card" tone="pink" borderRadius={24} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={[styles.title, { color: colors.foreground }]}>회원가입</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>이메일 인증 한 번이면 끝!</Text>

            <Text style={[styles.label, { color: colors.foreground }]}>이메일</Text>
            <GlassSurface variant="pill" tone="neutral" noShadow>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="name@example.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={[styles.input, { color: colors.foreground }]}
              />
            </GlassSurface>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>비밀번호</Text>
            <GlassSurface variant="pill" tone="neutral" noShadow>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="8자 이상"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoComplete="new-password"
                style={[styles.input, { color: colors.foreground }]}
              />
            </GlassSurface>

            {generalError && <Text style={[styles.error, { color: colors.destructive }]}>{generalError}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.4 }]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>인증코드 받기</Text>
              )}
            </Pressable>

            <SocialLoginButtons />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>이미 계정이 있으신가요? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>로그인</Text>
                </Pressable>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollOuter: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, gap: 24, flexGrow: 1 },
  brand: { alignItems: "center", gap: 6 },
  brandLogo: { width: 240, height: 180 },
  brandTag: { fontFamily: "NotoSansKR_500Medium", fontSize: 14 },
  card: { marginTop: 8 },
  cardInner: { padding: 22, gap: 8 },
  title: { fontFamily: "NotoSansKR_700Bold", fontSize: 24 },
  subtitle: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, marginBottom: 14 },
  label: { fontFamily: "NotoSansKR_700Bold", fontSize: 13, marginBottom: 6, marginTop: 4 },
  input: { paddingHorizontal: 16, paddingVertical: 14, fontFamily: "NotoSansKR_500Medium", fontSize: 15 },
  codeInput: { fontSize: 22, letterSpacing: 6, textAlign: "center", fontFamily: "Inter_700Bold" },
  error: { fontFamily: "NotoSansKR_500Medium", fontSize: 13, marginTop: 10 },
  primaryBtn: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  footerText: { fontFamily: "NotoSansKR_400Regular", fontSize: 13 },
  footerLink: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
  resendBtn: { alignSelf: "center", paddingVertical: 12 },
});
