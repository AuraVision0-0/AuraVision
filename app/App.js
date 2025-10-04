import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import Main from "./screens/main";
// import EnvironmentDescription from "./Features/EnvironmentDescription";
import ObjectDetection from "./Features/ObjectDetection";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={SignUp} />
        <Stack.Screen name="Main" component={Main} />
        {/* <Stack.Screen name="EnvironmentDescription" component={EnvironmentDescription} /> */}
        <Stack.Screen name="ObjectDetection" component={ObjectDetection}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
