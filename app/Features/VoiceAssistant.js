// Features/VoiceAssistant.js
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";

export default function VoiceAssistant({ navigation }) {
  const isSpeaking = useRef(false);

  const message = `
  Welcome to the Aura Vision interface.
  On the top left corner, you will find the Aura Vision logo.
  Below that, there are six main features arranged in two columns.
  The first button on the top left is Object Detection.
  When pressed, you can take a picture and the app will identify the object for you.
  Next to it is Document Reading — it reads out the text from documents or signs aloud.
  In the second row, the first button is Direction — it helps you get directions to your destination.
  Beside it is Distance Calculation — it tells you how far objects or landmarks are.
  On the third row, Environment Description describes what is around you in real time.
  The last button, Bus Identifier, helps you identify buses or vehicles nearby.
  Finally, at the bottom of the screen, you are currently on the Voice Assist button.
  You can press it anytime to hear this explanation again.
  `;

  // Speak explanation
  const explainInterface = () => {
    if (isSpeaking.current) {
      Speech.stop();
    }

    isSpeaking.current = true;

    Speech.speak(message, {
      rate: 0.95,
      pitch: 1,
      onDone: () => {
        isSpeaking.current = false;
        console.log("Speech completed ✅");
      },
      onStopped: () => {
        isSpeaking.current = false;
      },
      onError: () => {
        isSpeaking.current = false;
      },
    });
  };

  useEffect(() => {
    explainInterface();

    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Voice Assistant</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Speech.stop();
          navigation.goBack();
        }}
      >
        <Text style={styles.buttonText}>⬅ Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    backgroundColor: "#0097b2",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#444",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 50,
  },
});
