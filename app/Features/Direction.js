// Features/Directions.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Linking, Alert } from 'react-native';

export default function Directions() {
  const [destination, setDestination] = useState("");

  const openGoogleMaps = () => {
    if (!destination.trim()) {
      Alert.alert("Enter a destination first!");
      return;
    }

    // Encode destination for URL
    const encodedDestination = encodeURIComponent(destination);

    // ✅ Use backticks for string interpolation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}&travelmode=driving`;

    Linking.openURL(url).catch(() =>
      Alert.alert("Could not open Google Maps")
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter destination (e.g., Mumbai)"
        placeholderTextColor="#999"
        value={destination}
        onChangeText={setDestination}
      />
      <Button title="Get Directions" onPress={openGoogleMaps} color="#0078D7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0097b2',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
