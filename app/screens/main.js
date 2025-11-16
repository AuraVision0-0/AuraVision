import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,Image } from "react-native";

export default function Main({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
                source={require("../../assets/auralogo.jpg")}  
                style={styles.logo}
                resizeMode="contain"
              />
      </View>

      {/* Feature Buttons */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ObjectDetection")}>
          <Text style={styles.cardText}>Object Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("DocumentReading")}>
          <Text style={styles.cardText}>Document Reading</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Direction")}>
          <Text style={styles.cardText}>Direction</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("DistanceCalc")}>
          <Text style={styles.cardText}>Distance Calculation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("EnvironmentDescription")}>
          <Text style={styles.cardText}>Environment description</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("BusIdentifier")}>
          <Text style={styles.cardText}>Bus Identifier</Text>
        </TouchableOpacity>
      </View>
      {/* AI Bot Button */}
      <TouchableOpacity style={styles.voiceButton} onPress={() => navigation.navigate("AIBot")}>
        <Text style={styles.voiceButtonText}>AI BOT</Text>
      </TouchableOpacity>

      {/* Bottom Voice Assist Button */}
      <TouchableOpacity style={styles.voiceButton} onPress={() =>navigation.navigate("VoiceAssistant")}>
        <Text style={styles.voiceButtonText}>VOICE ASSISTANT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0097b2",
  },
  header: {
    height: 95,
    backgroundColor: "#0097b2",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  logo: {
    width: 70,   
    height: 70,
    marginBottom: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#0097b2",
    flex: 1,
  },
  card: {
    width: "45%",
    height: 150,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  voiceButton: {
    backgroundColor: "#e0e0e0",
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
  },
  voiceButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});
