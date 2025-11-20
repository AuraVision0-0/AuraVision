import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import * as Speech from "expo-speech";
import { AIBOT } from "../../backend/api";
import { useFocusEffect } from "@react-navigation/native";

export default function AIBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm Aura AI. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef();

  // Stop speech when screen loses focus (hardware back / gesture / navigation)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        try {
          Speech.stop();
        } catch (e) {
          console.log("Speech stop error:", e);
        }
      };
    }, [])
  );

  const stopSpeech = () => {
    try {
      Speech.stop();
    } catch (e) {
      console.log("Speech stop error:", e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${AIBOT}/aibot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      const reply = data.reply || "⚠️ Something went wrong.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);

      // ensure any prior speech is stopped before speaking new reply
      stopSpeech();
      Speech.speak(reply, { rate: 0.95, pitch: 1 });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Unable to reach server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Aura AI Assistant</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 130 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.message,
              msg.sender === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.msgText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          style={styles.input}
          placeholderTextColor="#888"
        />

        {/* Stop button (left of Send) */}
        <TouchableOpacity style={styles.stopBtn} onPress={stopSpeech}>
          <Text style={styles.stopText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F8FF" },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#0097B2",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { color: "white", fontSize: 20, fontWeight: "bold" },

  chatArea: { flex: 1, padding: 12 },

  message: {
    padding: 12,
    marginVertical: 6,
    maxWidth: "80%",
    borderRadius: 15,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#B2FFD6",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  msgText: { fontSize: 16, color: "#000" },

  inputBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  stopBtn: {
    marginLeft: 8,
    backgroundColor: "rgba(255, 107, 107, 1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    borderRadius: 8,
  },
  stopText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0097B2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    borderRadius: 8,
  },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
