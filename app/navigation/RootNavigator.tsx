import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DrawerHome from "../screens/DrawerHome";
import SettingsScreen from "../screens/SettingsScreen";
import TaskFormScreen from "../screens/TaskFormScreen";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Drawer: undefined;
  Settings: undefined;
  TaskForm: { eventId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>("Login");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const currentUserId = await AsyncStorage.getItem("currentUserId");
      setInitialRoute(currentUserId ? "Drawer" : "Login");
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
      <Stack.Screen
        name="Drawer"
        component={DrawerHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={{ title: "Task" }}
      />
    </Stack.Navigator>
  );
}
