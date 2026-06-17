import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";
  return (
    <Tabs
      initialRouteName="video"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: "NotoSansKR_700Bold", fontSize: 11, marginTop: 2 },
        tabBarStyle: { position: "absolute", backgroundColor: "rgba(244,237,255,0.9)", borderTopWidth: 0, elevation: 0, height: isWeb ? 92 : 88, paddingBottom: isWeb ? 24 : 18, paddingTop: 10, shadowColor: "#7C61D6", shadowOpacity: 0.12, shadowOffset: { width: 0, height: -10 }, shadowRadius: 24 },
        tabBarBackground: () => <View style={styles.tabBarBg}><LinearGradient colors={["#a8d4ff", "#c7b7ff", "#ffadd2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} /><LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.02)"]} locations={[0, 1]} style={StyleSheet.absoluteFill} /></View>,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "\uB2E4\uC774\uC5B4\uB9AC", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "book" : "book-outline"} size={30} color={color} /> }} />
      <Tabs.Screen name="video" options={{ title: "\uBE0C\uC774\uB85C\uADF8", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={34} color={color} /> }} />
      <Tabs.Screen name="friend" options={{ title: "\uC774\uC131\uCE5C\uAD6C\uCC44\uD305", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "heart" : "heart-outline"} size={32} color={color} /> }} />
      <Tabs.Screen name="my" options={{ title: "\uC124\uC815", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={32} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ tabBarBg: { ...StyleSheet.absoluteFillObject, borderTopWidth: 0, shadowColor: "#7C61D6", shadowOpacity: 0.18, shadowOffset: { width: 0, height: -8 }, shadowRadius: 18 } });
