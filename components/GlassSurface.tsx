import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle, useColorScheme } from "react-native";

interface Props {
  intensity?: number;
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
  children?: React.ReactNode;
  variant?: "card" | "pill" | "button" | "bar";
  tone?: "neutral" | "warm" | "cool" | "pink";
  noShadow?: boolean;
}

const TONE_TINTS: Record<NonNullable<Props["tone"]>, { light: string; dark: string }> = {
  neutral: { light: "rgba(255,255,255,0.55)", dark: "rgba(28,26,24,0.55)" },
  warm: { light: "rgba(255,243,220,0.55)", dark: "rgba(48,38,28,0.55)" },
  cool: { light: "rgba(220,235,255,0.55)", dark: "rgba(28,34,48,0.55)" },
  pink: { light: "rgba(255,224,232,0.55)", dark: "rgba(48,28,36,0.55)" },
};

export function GlassSurface({
  intensity = 70,
  style,
  borderRadius = 20,
  children,
  variant = "card",
  tone = "neutral",
  noShadow = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const radius = variant === "pill" ? 999 : borderRadius;

  const fallbackBg = isDark ? TONE_TINTS[tone].dark : TONE_TINTS[tone].light;
  const innerHi = isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.92)";
  const outerBorder = isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)";

  const isNative = Platform.OS === "ios" || Platform.OS === "android";
  const webBlurStyle: any =
    Platform.OS === "web"
      ? { backdropFilter: "blur(22px) saturate(180%)", WebkitBackdropFilter: "blur(22px) saturate(180%)" }
      : null;

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
        },
        !noShadow && {
          shadowColor: isDark ? "#000" : "#3B2C1A",
          shadowOpacity: isDark ? 0.45 : 0.1,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 5,
        },
        style,
      ]}
    >
      {isNative ? (
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : ("systemUltraThinMaterialLight" as any)}
          experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
          style={[StyleSheet.absoluteFill, { backgroundColor: fallbackBg }]}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, webBlurStyle, { backgroundColor: fallbackBg }]} />
      )}

      <LinearGradient
        colors={
          isDark
            ? ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)", "rgba(0,0,0,0.20)"]
            : ["rgba(255,255,255,0.65)", "rgba(255,255,255,0.20)", "rgba(255,255,255,0.04)"]
        }
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 10,
          right: 10,
          height: 1,
          backgroundColor: innerHi,
          opacity: 0.95,
        }}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, borderWidth: 1, borderColor: outerBorder },
        ]}
      />

      <View>{children}</View>
    </View>
  );
}
