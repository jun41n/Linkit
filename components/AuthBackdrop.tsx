import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#F4F1FB", "#FAF1F6", "#F1F4FB"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobPink]} />
      <View style={[styles.blob, styles.blobLavender]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  blobBlue: {
    backgroundColor: "#A8BCEF",
    width: 280,
    height: 280,
    top: -80,
    left: -90,
  },
  blobPink: {
    backgroundColor: "#F4B5D2",
    width: 240,
    height: 240,
    top: 120,
    right: -80,
  },
  blobLavender: {
    backgroundColor: "#C9B8F2",
    width: 320,
    height: 320,
    bottom: -120,
    left: -60,
  },
});
