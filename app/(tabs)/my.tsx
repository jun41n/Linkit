import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { useDiaries } from "@/context/DiariesContext";
import { useStickers } from "@/context/StickersContext";
import { useColors } from "@/hooks/useColors";

interface RowProps {
  label: string;
  onPress?: () => void;
  rightExtra?: React.ReactNode;
  badge?: string;
}

export default function MyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { diaries, entries } = useDiaries();
  const { ownedPackIds, packs } = useStickers();

  const ownedCount = ownedPackIds.length;
  const totalPacks = packs.length;

  const Row = ({ label, onPress, rightExtra, badge }: RowProps) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {rightExtra}
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>MY 링킷</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.iconBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { borderColor: colors.border }]}>
            <Ionicons name="settings-outline" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
            <Ionicons name="happy-outline" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>june 님</Text>
          <Text style={[styles.profileId, { color: colors.mutedForeground }]}>ID: D8WNQ9XYQ</Text>
        </View>

        <View style={styles.statsRow}>
          <GlassSurface variant="card" tone="warm" borderRadius={14} style={styles.statBox}>
            <View style={styles.statBoxInner}>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{diaries.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>다이어리</Text>
            </View>
          </GlassSurface>
          <GlassSurface variant="card" tone="pink" borderRadius={14} style={styles.statBox}>
            <View style={styles.statBoxInner}>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{entries.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>일기</Text>
            </View>
          </GlassSurface>
          <GlassSurface variant="card" tone="cool" borderRadius={14} style={styles.statBox}>
            <View style={styles.statBoxInner}>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{ownedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>스티커팩</Text>
            </View>
          </GlassSurface>
        </View>

        <View style={[styles.sectionHeader, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.sectionHeaderText, { color: colors.secondaryForeground }]}>다꾸 스티커</Text>
        </View>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <Row
            label="스티커 스토어"
            onPress={() => router.push("/store")}
            badge={`${ownedCount}/${totalPacks}`}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="내 보유 스티커" onPress={() => router.push("/store")} />
        </View>

        <View style={[styles.sectionHeader, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.sectionHeaderText, { color: colors.secondaryForeground }]}>앱 설정</Text>
        </View>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <Row label="알림 설정" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="암호 잠금 설정" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="다크 모드" />
        </View>

        <View style={[styles.sectionHeader, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.sectionHeaderText, { color: colors.secondaryForeground }]}>서비스 정보</Text>
        </View>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <Row label="공지사항" badge="N" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="링킷에게 문의하기" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="오픈소스 라이선스" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="개인정보 처리방침" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.row]}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>현재 버전</Text>
            <Text style={[{ color: colors.mutedForeground, fontFamily: "NotoSansKR_700Bold" }]}>1.0.0</Text>
          </View>
        </View>

        <View style={[styles.sectionBody, { backgroundColor: colors.card, marginTop: 14 }]}>
          <Row label="프로필 관리" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="비밀번호 변경" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>로그아웃</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.destructive }]}>계정 탈퇴하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { flex: 1, fontFamily: "NotoSansKR_700Bold", fontSize: 22 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingBottom: 140 },
  profile: { alignItems: "center", paddingVertical: 14, gap: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontFamily: "NotoSansKR_700Bold", fontSize: 24 },
  profileId: { fontFamily: "NotoSansKR_400Regular", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 22, paddingVertical: 12 },
  statBox: {
    flex: 1,
  },
  statBoxInner: {
    paddingVertical: 14,
    alignItems: "center",
  },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "NotoSansKR_400Regular", fontSize: 13, marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginTop: 14,
  },
  sectionHeaderText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  sectionBody: {},
  row: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: { flex: 1, fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: "white", fontFamily: "Inter_700Bold", fontSize: 11 },
  divider: { height: 1, marginHorizontal: 22 },
});
