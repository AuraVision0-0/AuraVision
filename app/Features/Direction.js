// src/screens/ExploreMapScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Vibration, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"; // Replace with your restricted key

const stripHtml = (html) => html.replace(/<[^>]*>/g, '');
const toRad = (v) => (v * Math.PI) / 180;
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function Direction({ navigation }) {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [exploring, setExploring] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const nextStepIndex = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Speech.speak("Permission denied for location.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation(loc.coords);
      Speech.speak("Navigation feature ready.");
    })();
    return () => stopAll();
  }, []);

  const stopAll = () => {
    Speech.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const fetchNearbyPlaces = async (type = 'restaurant') => {
    if (!location) return;
    const { latitude, longitude } = location;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&type=${type}&key=${GOOGLE_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setPlaces(data.results || []);
      if (data.results?.length) {
        Speech.speak(`Found ${data.results.length} places nearby.`);
      } else {
        Speech.speak("No places found nearby.");
      }
    } catch {
      Speech.speak("Error fetching nearby places.");
    }
  };

  const startNavigationTo = async (place) => {
    const origin = `${location.latitude},${location.longitude}`;
    const dest = `${place.geometry.location.lat},${place.geometry.location.lng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=walking&key=${GOOGLE_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const steps = data.routes?.[0]?.legs?.[0]?.steps || [];
      setRouteSteps(steps);
      Speech.speak(`Starting navigation to ${place.name}`);
      nextStepIndex.current = 0;

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setLocation(loc.coords);
        announceNextStep(loc.coords, steps);
      }, 5000);
    } catch {
      Speech.speak("Navigation failed.");
    }
  };

  const announceNextStep = (coords, steps) => {
    const idx = nextStepIndex.current;
    if (idx >= steps.length) {
      Speech.speak("You have arrived at your destination.");
      Vibration.vibrate(500);
      clearInterval(intervalRef.current);
      return;
    }
    const step = steps[idx];
    const dist = distanceMeters(coords.latitude, coords.longitude, step.end_location.lat, step.end_location.lng);
    if (dist < 20) {
      nextStepIndex.current++;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Speech.speak("Step completed.");
    } else if (dist < 60) {
      Speech.speak(stripHtml(step.html_instructions));
      Vibration.vibrate([0, 100]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore & Navigate</Text>
      <Button title="Find Nearby Places" onPress={() => fetchNearbyPlaces('restaurant')} />
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => startNavigationTo(item)}>
            <Text style={styles.item}>{item.name} - {item.vicinity}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Stop Navigation" color="red" onPress={() => stopAll()} />
      <Button title="Exit Feature" color="gray" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
});
