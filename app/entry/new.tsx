import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Image as RNImage,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import { StickerCanvas } from "@/components/StickerCanvas";
import { StickerDrawer } from "@/components/StickerDrawer";
import { DEFAULT_DIARY_FONT, DIARY_FONTS, getFontFamily } from "@/constants/fonts";
import {
  PhotoFrame,
  PlacedPhoto,
  PlacedSticker,
  PlacedText,
  useDiaries,
} from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const BG_COLORS = [
  "#FFFEF8",
  "#FFF1D6",
  "#FFD3DA",
  "#E0D4F7",
  "#CFE6FB",
  "#BDEBD8",
  "#F2EADA",
  "#FFE9A8",
];

const TEXT_COLORS = ["#2A2520", "#F46A6A", "#5C7CFA", "#37B86F", "#E2A23B", "#9C5CD4"];

const FRAMES: { key: PhotoFrame; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "polaroid", label: "폴라로이드", icon: "image-outline" },
  { key: "sticker", label: "스티커컷", icon: "scan-outline" },
  { key: "rounded", label: "둥근", icon: "square-outline" },
  { key: "circle", label: "원형", icon: "ellipse-outline" },
  { key: "tape", label: "테이프", icon: "ribbon-outline" },
  { key: "none", label: "원본", icon: "crop-outline" },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getImageAspect(uri: string): Promise<number> {
  return new Promise((resolve) => {
    RNImage.getSize(
      uri,
      (w, h) => resolve(h / w || 1),
      () => resolve(1),
    );
  });
}

export default function NewEntryScreen() {
  const params = useLocalSearchParams<{ diaryId?: string; mode?: string }>();
  const colors = useColors();
  const router = useRouter();
  const { diaries, addEntry } = useDiaries();
  const { width, height } = useWindowDimensions();
  const bodyInputRef = useRef<TextInput>(null);

  const isVideoMode = params.mode === "video";
  const initialDiaryId = params.diaryId || diaries[0]?.id || "";

  const [diaryId, setDiaryId] = useState(initialDiaryId);
  const [body, setBody] = useState("");
  const [legacyVideoUri, setLegacyVideoUri] = useState<string | undefined>();
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [photos, setPhotos] = useState<PlacedPhoto[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [texts, setTexts] = useState<PlacedText[]>([]);
  const [activeTool, setActiveTool] = useState<"write" | "photo" | "decorate" | "bg">("write");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [bodyFontId, setBodyFontId] = useState<string>("noto_sans");
  const [stickerFontId, setStickerFontId] = useState<string>(DEFAULT_DIARY_FONT.id);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const appWidth = Math.min(width, 420);
  const canvasWidth = Math.max(280, appWidth - 32);
  const maxCanvasHeight = Math.max(420, height - 210);
  const canvasHeight = isVideoMode ? Math.min(canvasWidth * 1.6, maxCanvasHeight) : Math.min(canvasWidth * 1.2, maxCanvasHeight);

  const selectedDiary = diaries.find((d) => d.id === diaryId);
  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId) ?? null;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });

    if (result.canceled) return;

    for (const asset of result.assets ?? []) {
      const aspect = await getImageAspect(asset.uri);
      const newPhoto: PlacedPhoto = {
        id: uid(),
        uri: asset.uri,
        x: 50,
        y: 34 + Math.random() * 22,
        widthPct: 46,
        aspectRatio: aspect,
        scale: 1,
        rotation: -6 + Math.random() * 12,
        frame: "polaroid",
      };
      setPhotos((prev) => [...prev, newPhoto]);
      setSelectedPhotoId(newPhoto.id);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setLegacyVideoUri(result.assets[0].uri);
  };

  const updatePhoto = (id: string, updates: Partial<PlacedPhoto>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoId === id) setSelectedPhotoId(null);
  };

  const addSticker = (emoji: string, stickerId: string) => {
    setStickers((prev) => [
      ...prev,
      {
        id: uid(),
        stickerId,
        emoji,
        x: 34 + Math.random() * 24,
        y: 36 + Math.random() * 24,
        scale: 1,
        rotation: 0,
      },
    ]);
  };

  const updateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const addText = () => {
    if (!textInput.trim()) return;
    setTexts((prev) => [
      ...prev,
      {
        id: uid(),
        text: textInput.trim(),
        x: 28,
        y: 28,
        color: textColor,
        fontSize: 22,
        fontId: stickerFontId,
      },
    ]);
    setTextInput("");
  };

  const updateText = (id: string, updates: Partial<PlacedText>) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeText = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
  };

  const save = async () => {
    if (!diaryId) {
      Alert.alert("다이어리를 먼저 선택해주세요");
      return;
    }

    await addEntry({
      diaryId,
      body,
      bgColor,
      photos,
      stickers,
      texts,
      isVideo: isVideoMode,
      videoUri: isVideoMode ? legacyVideoUri : undefined,
      photoUri: undefined,
    });
    router.back();
  };

  const tools = useMemo(
    () => [
      { key: "write" as const, label: "글", icon: "create-outline" as const },
      { key: "photo" as const, label: "사진", icon: "image-outline" as const },
      { key: "decorate" as const, label: "다꾸", icon: "color-palette-outline" as const },
      { key: "bg" as const, label: "배경", icon: "color-fill-outline" as const },
    ],
    [],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <GlassSurface variant="pill" tone="neutral" style={{ width: 40, height: 40 }}>
          <Pressable onPress={() => router.back()} style={styles.headerBtnInner}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </Pressable>
        </GlassSurface>

        <GlassSurface variant="pill" tone="warm" style={{ flex: 1 }}>
          <View style={styles.diaryChipInner}>
            <Ionicons name="book-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.diaryChipText, { color: colors.foreground }]} numberOfLines={1}>
              {selectedDiary?.name ?? "다이어리 선택"}
            </Text>
          </View>
        </GlassSurface>

        <Pressable onPress={save} style={[styles.headerBtn, styles.saveBtn, { backgroundColor: colors.foreground }]}>
          <Text style={{ color: colors.background, fontFamily: "NotoSansKR_700Bold", fontSize: 14 }}>저장</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.canvasWrap, { width: canvasWidth }]}>
            <StickerCanvas
              width={canvasWidth}
              height={canvasHeight}
              bgColor={bgColor}
              photos={photos}
              stickers={stickers}
              texts={texts}
              onUpdatePhoto={updatePhoto}
              onRemovePhoto={removePhoto}
              onUpdateSticker={updateSticker}
              onRemoveSticker={removeSticker}
              onUpdateText={updateText}
              onRemoveText={removeText}
              onSelectPhoto={setSelectedPhotoId}
              selectedPhotoId={selectedPhotoId}
            />

            {activeTool === "write" && (
              <Pressable
                onPress={() => bodyInputRef.current?.focus()}
                style={styles.bodyInputLayer}
                pointerEvents="box-none"
              >
                <TextInput
                  ref={bodyInputRef}
                  value={body}
                  onChangeText={setBody}
                  multiline
                  placeholder="오늘의 이야기를 적어보세요"
                  placeholderTextColor={colors.mutedForeground}
                  style={[
                    styles.canvasBodyInput,
                    {
                      color: colors.foreground,
                      fontFamily: getFontFamily(bodyFontId),
                    },
                  ]}
                  textAlignVertical="top"
                />
              </Pressable>
            )}

            {activeTool === "photo" && (
              <View style={styles.canvasActionArea} pointerEvents="box-none">
                <GlassSurface variant="pill" tone="warm">
                  <Pressable onPress={pickPhoto} style={styles.canvasActionBtn}>
                    <Ionicons name="image-outline" size={18} color={colors.primary} />
                    <Text style={[styles.canvasActionText, { color: colors.primary }]}>사진 업로드</Text>
                  </Pressable>
                </GlassSurface>
              </View>
            )}
          </View>

          {selectedPhoto && (
            <GlassSurface variant="card" tone="cool" borderRadius={16} style={styles.frameBar}>
              <Text style={[styles.frameBarTitle, { color: colors.mutedForeground }]}>사진 프레임</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frameRow}>
                {FRAMES.map((frame) => {
                  const active = selectedPhoto.frame === frame.key;
                  return (
                    <Pressable
                      key={frame.key}
                      onPress={() => updatePhoto(selectedPhoto.id, { frame: frame.key })}
                      style={[
                        styles.frameChip,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Ionicons name={frame.icon} size={14} color={active ? colors.background : colors.foreground} />
                      <Text
                        style={{
                          fontFamily: "NotoSansKR_500Medium",
                          color: active ? colors.background : colors.foreground,
                          fontSize: 12,
                        }}
                      >
                        {frame.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.frameHint, { color: colors.mutedForeground }]}>
                사진은 끌어서 옮기고, 손가락으로 크기와 각도를 조절할 수 있어요.
              </Text>
            </GlassSurface>
          )}

          {activeTool === "write" && (
            <GlassSurface variant="card" tone="warm" borderRadius={16} style={styles.writeBox}>
              <View style={styles.fontSectionRow}>
                <Ionicons name="text" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>글씨체</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontChipRow}>
                {DIARY_FONTS.map((font) => {
                  const active = bodyFontId === font.id;
                  return (
                    <Pressable
                      key={font.id}
                      onPress={() => setBodyFontId(font.id)}
                      style={[
                        styles.fontChip,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: font.family,
                          color: active ? colors.background : colors.foreground,
                          fontSize: 16,
                        }}
                      >
                        {font.preview}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "NotoSansKR_500Medium",
                          color: active ? colors.background : colors.mutedForeground,
                          fontSize: 10,
                          marginTop: 2,
                        }}
                      >
                        {font.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={[styles.dividerH, { backgroundColor: colors.border }]} />

              <View style={styles.fontSectionRow}>
                <Ionicons name="brush" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>스티커처럼 올릴 짧은 글</Text>
              </View>
              <View style={styles.textAddRow}>
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="페이지 위에 붙일 문구"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textAddInput, { color: textColor, fontFamily: getFontFamily(stickerFontId) }]}
                />
                <Pressable onPress={addText} style={[styles.textAddBtn, { backgroundColor: colors.foreground }]}>
                  <Ionicons name="add" size={16} color={colors.background} />
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontChipRow}>
                {DIARY_FONTS.map((font) => {
                  const active = stickerFontId === font.id;
                  return (
                    <Pressable
                      key={font.id}
                      onPress={() => setStickerFontId(font.id)}
                      style={[
                        styles.fontChipSmall,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: font.family,
                          color: active ? colors.background : colors.foreground,
                          fontSize: 15,
                        }}
                      >
                        {font.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.colorChipRow}>
                {TEXT_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setTextColor(color)}
                    style={[
                      styles.colorChipSm,
                      { backgroundColor: color, borderColor: textColor === color ? colors.foreground : "transparent" },
                    ]}
                  />
                ))}
              </View>
            </GlassSurface>
          )}

          {activeTool === "photo" && (
            <GlassSurface variant="card" tone="warm" borderRadius={16} style={styles.writeBox}>
              <View style={styles.fontSectionRow}>
                <Ionicons name="images-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>사진 {photos.length}/10</Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable onPress={pickPhoto} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Ionicons name="add" size={16} color={colors.foreground} />
                  <Text style={[styles.actionText, { color: colors.foreground }]}>사진 업로드</Text>
                </Pressable>
                {isVideoMode && (
                  <Pressable onPress={pickVideo} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                    <Ionicons name="videocam" size={16} color={colors.foreground} />
                    <Text style={[styles.actionText, { color: colors.foreground }]}>영상</Text>
                  </Pressable>
                )}
              </View>
            </GlassSurface>
          )}

          {activeTool === "decorate" && (
            <GlassSurface variant="card" tone="cool" borderRadius={16} style={styles.decorateHint}>
              <Ionicons name="search" size={18} color={colors.primary} />
              <Text style={[styles.decorateHintText, { color: colors.foreground }]}>
                아래 검색창에서 하트, 꽃, 축하 같은 단어로 이모지를 찾아 넣을 수 있어요.
              </Text>
            </GlassSurface>
          )}

          {activeTool === "bg" && (
            <GlassSurface variant="card" tone="cool" borderRadius={16} style={styles.bgBox}>
              <Text style={[styles.boxLabel, { color: colors.foreground }]}>페이지 배경</Text>
              <View style={styles.colorRowLg}>
                {BG_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setBgColor(color)}
                    style={[
                      styles.colorChipLg,
                      { backgroundColor: color, borderColor: bgColor === color ? colors.foreground : colors.border },
                    ]}
                  />
                ))}
              </View>
            </GlassSurface>
          )}

          {diaries.length > 1 && (
            <Pressable
              onPress={() => {
                const idx = diaries.findIndex((d) => d.id === diaryId);
                setDiaryId(diaries[(idx + 1) % diaries.length].id);
              }}
              style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, alignSelf: "flex-start" }]}
            >
              <Ionicons name="swap-horizontal" size={18} color={colors.foreground} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>다이어리 변경</Text>
            </Pressable>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {activeTool === "decorate" && <StickerDrawer onPick={addSticker} height={320} />}

        <View style={styles.entryToolbarShell}>
          <LinearGradient
            colors={["#a8d4ff", "#c7b7ff", "#ffadd2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.02)"]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.toolbar}>
            {tools.map((tool) => {
              const active = activeTool === tool.key;
              return (
                <Pressable
                  key={tool.key}
                  onPress={() => setActiveTool(tool.key)}
                  style={[styles.toolBtn, active && styles.toolBtnActive]}
                >
                  <Ionicons name={tool.icon} size={28} color={active ? colors.primary : colors.foreground} />
                  <Text style={[styles.toolLabel, { color: active ? colors.primary : colors.foreground }]}>{tool.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnInner: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  saveBtn: { width: 56, paddingHorizontal: 0 },
  diaryChipInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  diaryChipText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14, maxWidth: 200 },
  scrollContent: { padding: 16, gap: 12 },
  canvasWrap: { alignSelf: "center", position: "relative" },
  bodyInputLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
  },
  canvasBodyInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 29,
    padding: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  canvasActionArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
  canvasActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  canvasActionText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionText: { fontFamily: "NotoSansKR_500Medium", fontSize: 13 },
  frameBar: { padding: 12, gap: 8 },
  frameBarTitle: { fontFamily: "NotoSansKR_500Medium", fontSize: 11 },
  frameRow: { gap: 8, paddingVertical: 4 },
  frameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  frameHint: { fontFamily: "NotoSansKR_400Regular", fontSize: 11 },
  writeBox: { padding: 14, gap: 10 },
  dividerH: { height: 1, marginVertical: 4 },
  fontSectionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fontSectionLabel: { fontFamily: "NotoSansKR_500Medium", fontSize: 12 },
  fontChipRow: { gap: 8, paddingVertical: 4, paddingRight: 4 },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 84,
    alignItems: "center",
  },
  fontChipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  textAddRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  textAddInput: { flex: 1, fontSize: 18 },
  textAddBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  colorChipRow: { flexDirection: "row", gap: 8 },
  colorChipSm: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  decorateHint: { padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  decorateHintText: { flex: 1, fontFamily: "NotoSansKR_500Medium", fontSize: 13, lineHeight: 19 },
  bgBox: { padding: 14, gap: 10 },
  boxLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
  colorRowLg: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorChipLg: { width: 40, height: 40, borderRadius: 12, borderWidth: 2 },
  entryToolbarShell: {
    overflow: "hidden",
    borderTopWidth: 0,
    shadowColor: "#7C61D6",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 18,
    elevation: 0,
  },
  toolbar: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  toolBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minHeight: 64,
  },
  toolBtnActive: {
    backgroundColor: "rgba(255,255,255,0.54)",
  },
  toolLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 13, lineHeight: 17 },
});
