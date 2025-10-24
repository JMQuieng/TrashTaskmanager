import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import PasswordInput from "../../components/PasswordInput";
import { loginUser } from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

export default function LoginScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    const res = await loginUser(email.trim(), password);
    if (!res.ok) return Alert.alert("Login Failed", res.error);
    await AsyncStorage.setItem("currentUserId", res.user.id);
    navigation.reset({ index: 0, routes: [{ name: "Drawer" }] });
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-6 text-center">
        TrashTaskmanager
      </Text>
      <View className="gap-3">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border rounded-xl px-3 py-3 bg-white"
        />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />
        <Pressable
          onPress={onLogin}
          className="bg-blue-600 rounded-xl py-3 mt-2"
        >
          <Text className="text-white text-center font-semibold">Login</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          className="mt-4"
        >
          <Text className="text-center text-blue-700">Register now</Text>
        </Pressable>
      </View>
    </View>
  );
}
