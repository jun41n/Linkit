import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { PhotoFrame, PlacedPhoto, PlacedSticker, PlacedText } from "@/context/DiariesContext";
import { getFontFamily } from "@/constants/fonts";
import { useColors } from "@/hooks/useColors";

interface Props {
  width: number;
  height: number;
  bgColor?: string;
  legacyPhotoUri?: string;
  photos: PlacedPhoto[];
  stickers: PlacedSticker[];
  texts: PlacedText[];
  onUpdatePhoto: (id: string, updates: Partial<PlacedPhoto>) => void;
  onRemovePhoto: (id: string) => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
  onUpdateText: (id: string, updates: Partial<PlacedText>) => void;
  onRemoveText: (id: string) => void;
  onSelectPhoto?: (id: string | null) => void;
  selectedPhotoId?: string | null;
}

interface StickerItemProps {
  sticker: PlacedSticker;
  width: number;
  height: number;
  onUpdate: (updates: Partial<PlacedSticker>) => void;
  onRemove: () => void;
  selected: boolean;
  onSelect: () => void;
}

function StickerItem({ sticker, width, height, onUpdate, onRemove, selected, onSelect }: StickerItemProps) {
  const colors = useColors();
  const tx = useSharedValue((sticker.x / 100) * width);
  const ty = useSharedValue((sticker.y / 100) * height);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startScale = useSharedValue(0);
  const startRotation = useSharedValue(0);

  const persist = (nx: number, ny: number, ns: number, nr: number) => {
    onUpdate({
      x: (nx / width) * 100,
      y: (ny / height) * 100,
      scale: ns,
      rotation: nr,
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.4, Math.min(4, startScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const tap = Gesture.Tap().onStart(() => {
    runOnJS(onSelect)();
  });

  const composed = Gesture.Simultaneous(pan, pinch, rotate, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.stickerItem, animatedStyle]}>
        <View style={selected ? [styles.selectionRing, { borderColor: colors.primary }] : null}>
          <Text style={styles.stickerText}>{sticker.emoji}</Text>
        </View>
        {selected && (
          <Pressable
            onPress={onRemove}
            style={[styles.removeBadge, { backgroundColor: colors.destructive }]}
          >
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

interface PhotoItemProps {
  photo: PlacedPhoto;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (updates: Partial<PlacedPhoto>) => void;
  onRemove: () => void;
  selected: boolean;
  onSelect: () => void;
}

function frameStyles(frame: PhotoFrame, w: number, h: number) {
  switch (frame) {
    case "polaroid":
      return {
        wrap: {
          backgroundColor: "white",
          padding: 8,
          paddingBottom: 28,
          borderRadius: 4,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 3,
        },
        image: { borderRadius: 2 },
      };
    case "rounded":
      return {
        wrap: {
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 2,
        },
        image: { borderRadius: 16 },
      };
    case "circle":
      return {
        wrap: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 2,
        },
        image: { borderRadius: Math.max(w, h) },
      };
    case "sticker":
      return {
        wrap: {
          backgroundColor: "white",
          padding: 4,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 4,
        },
        image: { borderRadius: 8 },
      };
    case "tape":
      return {
        wrap: {
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 2,
        },
        image: { borderRadius: 2 },
      };
    default:
      return { wrap: {}, image: { borderRadius: 4 } };
  }
}

function PhotoItem({ photo, canvasWidth, canvasHeight, onUpdate, onRemove, selected, onSelect }: PhotoItemProps) {
  const colors = useColors();
  const baseW = (photo.widthPct / 100) * canvasWidth;
  const baseH = baseW * (photo.aspectRatio || 1);
  const isCircle = photo.frame === "circle";
  const renderW = baseW;
  const renderH = isCircle ? baseW : baseH;

  const tx = useSharedValue((photo.x / 100) * canvasWidth - renderW / 2);
  const ty = useSharedValue((photo.y / 100) * canvasHeight - renderH / 2);
  const scale = useSharedValue(photo.scale);
  const rotation = useSharedValue(photo.rotation);

  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startScale = useSharedValue(0);
  const startRotation = useSharedValue(0);

  const persist = (nx: number, ny: number, ns: number, nr: number) => {
    onUpdate({
      x: ((nx + renderW / 2) / canvasWidth) * 100,
      y: ((ny + renderH / 2) / canvasHeight) * 100,
      scale: ns,
      rotation: nr,
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.3, Math.min(4, startScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const tap = Gesture.Tap().onStart(() => {
    runOnJS(onSelect)();
  });

  const composed = Gesture.Simultaneous(pan, pinch, rotate, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const fs = frameStyles(photo.frame, renderW, renderH);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.photoItem, { width: renderW, height: renderH }, animatedStyle]}>
        <View
          style={[
            { width: "100%", height: "100%" },
            fs.wrap as any,
            selected ? { borderWidth: 2, borderColor: colors.primary, borderStyle: "dashed" } : null,
          ]}
        >
          <Image
            source={{ uri: photo.uri }}
            style={[{ width: "100%", height: "100%" }, fs.image as any]}
            resizeMode="cover"
          />
          {photo.frame === "tape" && (
            <>
              <View style={[styles.tapeStrip, { top: -8, left: 12, transform: [{ rotate: "-12deg" }] }]} />
              <View style={[styles.tapeStrip, { bottom: -8, right: 12, transform: [{ rotate: "8deg" }] }]} />
            </>
          )}
        </View>
        {selected && (
          <>
            <Pressable
              onPress={onRemove}
              style={[styles.removeBadge, { backgroundColor: colors.destructive, top: -10, right: -10 }]}
            >
              <Ionicons name="close" size={14} color="white" />
            </Pressable>
            <View style={[styles.cornerHint, { borderColor: colors.primary }]} />
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

interface TextItemProps {
  text: PlacedText;
  width: number;
  height: number;
  onUpdate: (updates: Partial<PlacedText>) => void;
  onRemove: () => void;
  selected: boolean;
  onSelect: () => void;
}

function TextItem({ text, width, height, onUpdate, onRemove, selected, onSelect }: TextItemProps) {
  const colors = useColors();
  const tx = useSharedValue((text.x / 100) * width);
  const ty = useSharedValue((text.y / 100) * height);
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);

  const persist = (nx: number, ny: number) => {
    onUpdate({ x: (nx / width) * 100, y: (ny / height) * 100 });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value);
    });

  const tap = Gesture.Tap().onStart(() => {
    runOnJS(onSelect)();
  });

  const composed = Gesture.Simultaneous(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.textItem, animatedStyle]}>
        <View style={selected ? [styles.selectionRing, { borderColor: colors.primary, padding: 6 }] : null}>
          <Text style={[styles.placedText, { color: text.color, fontSize: text.fontSize, fontFamily: getFontFamily(text.fontId) }]}>{text.text}</Text>
        </View>
        {selected && (
          <Pressable
            onPress={onRemove}
            style={[styles.removeBadge, { backgroundColor: colors.destructive }]}
          >
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function StickerCanvas({
  width,
  height,
  bgColor,
  legacyPhotoUri,
  photos,
  stickers,
  texts,
  onUpdatePhoto,
  onRemovePhoto,
  onUpdateSticker,
  onRemoveSticker,
  onUpdateText,
  onRemoveText,
  onSelectPhoto,
  selectedPhotoId,
}: Props) {
  const colors = useColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const clearSelection = () => {
    setSelectedId(null);
    onSelectPhoto?.(null);
  };

  return (
    <GestureHandlerRootView>
      <Pressable
        onPress={clearSelection}
        style={[styles.canvas, { width, height, backgroundColor: bgColor || colors.paperWhite }]}
      >
        {legacyPhotoUri && photos.length === 0 && (
          <Image source={{ uri: legacyPhotoUri }} style={[styles.photo, { width, height }]} />
        )}
        {photos.map((p) => (
          <PhotoItem
            key={p.id}
            photo={p}
            canvasWidth={width}
            canvasHeight={height}
            onUpdate={(u) => onUpdatePhoto(p.id, u)}
            onRemove={() => onRemovePhoto(p.id)}
            selected={selectedPhotoId === p.id}
            onSelect={() => {
              setSelectedId(null);
              onSelectPhoto?.(p.id);
            }}
          />
        ))}
        {stickers.map((s) => (
          <StickerItem
            key={s.id}
            sticker={s}
            width={width}
            height={height}
            onUpdate={(u) => onUpdateSticker(s.id, u)}
            onRemove={() => onRemoveSticker(s.id)}
            selected={selectedId === s.id}
            onSelect={() => {
              onSelectPhoto?.(null);
              setSelectedId(s.id);
            }}
          />
        ))}
        {texts.map((t) => (
          <TextItem
            key={t.id}
            text={t}
            width={width}
            height={height}
            onUpdate={(u) => onUpdateText(t.id, u)}
            onRemove={() => onRemoveText(t.id)}
            selected={selectedId === t.id}
            onSelect={() => {
              onSelectPhoto?.(null);
              setSelectedId(t.id);
            }}
          />
        ))}
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    overflow: "hidden",
    borderRadius: 16,
  },
  photo: { position: "absolute", top: 0, left: 0 },
  stickerItem: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerText: { fontSize: 36 },
  photoItem: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  selectionRing: { borderWidth: 2, borderRadius: 8, padding: 2, borderStyle: "dashed" },
  cornerHint: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "white",
  },
  removeBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  textItem: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  placedText: { fontFamily: "NotoSansKR_700Bold" },
  tapeStrip: {
    position: "absolute",
    width: 80,
    height: 18,
    backgroundColor: "rgba(255, 215, 130, 0.65)",
    borderRadius: 1,
  },
});
