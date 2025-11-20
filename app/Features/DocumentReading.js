import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import axios from "axios";
import { TEXT } from "../../backend/api";
import { useFocusEffect } from "@react-navigation/native";

export default function DocumentReading({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const cameraRef = useRef(null);

  const SERVER_URL = `${TEXT}/text`;

  // Stop speech when user leaves the screen (hardware back / gesture)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        Speech.stop();
      };
    }, [])
  );

  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera. Please enable permissions in system settings.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureAndDetect = async () => {
    if (!cameraRef.current) {
      Alert.alert("Camera not ready", "Please wait a moment and try again.");
      return;
    }

    try {
      setLoading(true);
      setPreviewImage(null);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      if (!photo?.base64) throw new Error("Failed to capture base64 image");

      const response = await axios.post(
        SERVER_URL,
        { imageBase64: photo.base64 },
        { timeout: 20000 }
      );

      const { objects, preview } = response.data || {};

      if (!objects || objects.length === 0) {
        Speech.stop();
        Speech.speak("No text detected.");
        Alert.alert("Result", "No text detected.");
      } else {
        const detected = objects.map((o) => o.label).join(" ");
        Speech.stop();
        Speech.speak(detected);
        Alert.alert("Detected Text", detected);
      }

      if (preview) setPreviewImage(`data:image/jpeg;base64,${preview}`);
    } catch (err) {
      console.error("captureAndDetect error:", err);
      Alert.alert(
        "Error",
        "Could not contact server or capture image. Check your Flask server, Wi-Fi, and IP address."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />

      <View style={styles.controls}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={captureAndDetect}>
            <Text style={styles.buttonText}>Capture & Detect</Text>
          </TouchableOpacity>
        )}
      </View>

      {previewImage && (
        <ScrollView style={styles.previewContainer}>
          <Text style={styles.previewText}>Detected Preview:</Text>
          <Image source={{ uri: previewImage }} style={styles.previewImage} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 28,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#0097b2",
    padding: 30,
    borderRadius: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  previewContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  previewText: { fontWeight: "700", marginBottom: 6 },
  previewImage: { width: 300, height: 300, borderRadius: 8 },
});
