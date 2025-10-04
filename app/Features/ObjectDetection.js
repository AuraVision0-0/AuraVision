import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Camera } from "expo-camera";   
import * as Speech from "expo-speech";
import axios from "axios";


export default function ObjectDetection({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // ✅ Ask for camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // ✅ Capture image and send to backend
  const captureAndDetect = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
      });

      // Send to Flask backend
      const response = await axios.post("http://10.201.11:5000/detect", {
        imageBase64: photo.base64,
      });

      const objects = response.data.objects;

      if (objects.length === 0) {
        Speech.speak("No objects detected.");
        Alert.alert("Result", "No objects detected.");
      } else {
        const detected = objects.map((obj) => obj.label).join(", ");
        Speech.speak(`I see: ${detected}`);
        Alert.alert("Detected Objects", detected);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false)
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants?.Type?.back}
        ref={cameraRef}
      />

      <View style={styles.controls}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={captureAndDetect}>
            <Text style={styles.buttonText}>Capture & Detect</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
  },
  backButton: { backgroundColor: "gray" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
