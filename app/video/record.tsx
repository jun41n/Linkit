import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const DURATIONS = [1, 2, 3, 5];

function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function RecordScreen() {
  const colors = useColors();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions({});
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [duration, setDuration] = useState(2);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pickVideoFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 5,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/video/review",
        params: { uri: result.assets[0].uri, duration: String(duration) },
      });
    }
  }, [router, duration]);

  const startRecording = useCallback(async () => {
    if (Platform.OS === "web") {
      await pickVideoFromGallery();
      return;
    }
    if (!cameraRef.current) return;

    setRecording(true);
    setCountdown(duration);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: duration,
      });
      setRecording(false);
      setCountdown(null);
      if (video?.uri) {
        router.push({
          pathname: "/video/review",
          params: { uri: video.uri, duration: String(duration) },
        });
      }
    } catch {
      setRecording(false);
      setCountdown(null);
    }
  }, [duration, router, pickVideoFromGallery]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      clearInterval(timerRef.current);
    }
  }, [recording]);

  const toggleFacing = () => setFacing((f) => (f === "front" ? "back" : "front"));

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: "#000" }]}>
        <Text style={styles.permText}>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: "#000" }]} edges={["top", "bottom"]}>
        <Ionicons name="videocam-off-outline" size={48} color="#999" />
        <Text style={styles.permText}>영상을 촬영하려면 카메라 권한이 필요해요</Text>
        <Pressable
          onPress={requestPermission}
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.permBtnText}>권한 허용하기</Text>
        </Pressable>
        {Platform.OS === "web" && (
          <Pressable onPress={pickVideoFromGallery} style={styles.galleryLink}>
            <Text style={[styles.galleryText, { color: colors.primary }]}>갤러리에서 영상 선택</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.back()} style={styles.galleryLink}>
          <Text style={[styles.galleryText, { color: "#999" }]}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.container}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="white" />
      </Pressable>

      {isWeb ? (
        <View style={[styles.center, { backgroundColor: "#111", flex: 1 }]}>
          <Ionicons name="videocam" size={64} color="#555" />
          <Text style={styles.webHint}>웹에서는 갤러리에서 영상을 선택해 주세요</Text>
          <Pressable
            onPress={pickVideoFromGallery}
            style={[styles.permBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
          >
            <Text style={styles.permBtnText}>영상 선택하기</Text>
          </Pressable>
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="video"
        />
      )}

      <View style={styles.timeOverlay}>
        <Text style={styles.timeText}>{formatTime(now)}</Text>
      </View>

      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              onPress={() => !recording && setDuration(d)}
              style={[
                styles.durChip,
                duration === d && { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            >
              <Text
                style={[
                  styles.durText,
                  duration === d && styles.durTextActive,
                ]}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.controlsRow}>
          <Pressable onPress={pickVideoFromGallery} style={styles.sideBtn}>
            <Ionicons name="images-outline" size={26} color="white" />
          </Pressable>

          <Pressable
            onPress={recording ? stopRecording : startRecording}
            style={[
              styles.recordBtn,
              recording && { backgroundColor: "#FF4444" },
            ]}
          >
            {recording ? (
              <View style={styles.stopSquare} />
            ) : (
              <View style={styles.recordInner} />
            )}
          </Pressable>

          <Pressable onPress={toggleFacing} style={styles.sideBtn}>
            <Ionicons name="camera-reverse-outline" size={26} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  closeBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
    color: "rgba(255,255,255,0.7)",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 12,
  },
  countdownOverlay: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  countdownText: {
    fontFamily: "Inter_700Bold",
    fontSize: 96,
    color: "rgba(255,255,255,0.8)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingTop: 20,
    alignItems: "center",
    gap: 24,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
  },
  durChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
  },
  durTextActive: { color: "#FFFFFF" },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  recordInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF4466",
  },
  stopSquare: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "white",
  },
  permText: {
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
  },
  permBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permBtnText: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 15,
    color: "white",
  },
  galleryLink: { marginTop: 8 },
  galleryText: { fontFamily: "NotoSansKR_500Medium", fontSize: 14 },
  webHint: {
    fontFamily: "NotoSansKR_500Medium",
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
