import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={require("../../assets/auralogo.jpg")}  
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0097b2",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,   
    height: 300,
    marginBottom: 60,
  },
  subText: {
    fontSize: 32,
    letterSpacing: 2,
    color: "black",
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginRight: 10,
  },
  signupButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginText: {
    color: "black",
    fontSize: 16,
  },
  signupText: {
    color: "white",
    fontSize: 16,
  },
});
