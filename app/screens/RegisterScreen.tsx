import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import PasswordInput from "../../components/PasswordInput";
import { registerUser } from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

export default function RegisterScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Register">) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");

  const onSubmit = async () => {
    const res = await registerUser({
      first_name: first.trim(),
      last_name: last.trim(),
      email: email.trim(),
      password: pw,
      confirm: cpw,
    });
    if (!res.ok) return Alert.alert("Register Failed", res.error);
    await AsyncStorage.setItem("currentUserId", res.user.id);
    Alert.alert("Success", "Account created");
    navigation.reset({ index: 0, routes: [{ name: "Drawer" }] });
  };

  return (
    <View className="flex-1 px-6 py-8 bg-gray-50">
      <Text className="text-2xl font-bold mb-6 text-center">
        Create Account
      </Text>
      <View className="gap-3">
        <TextInput
          value={first}
          onChangeText={setFirst}
          placeholder="First name"
          className="border rounded-xl px-3 py-3 bg-white"
        />
        <TextInput
          value={last}
          onChangeText={setLast}
          placeholder="Last name"
          className="border rounded-xl px-3 py-3 bg-white"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="border rounded-xl px-3 py-3 bg-white"
        />
        <PasswordInput value={pw} onChangeText={setPw} placeholder="Password" />
        <PasswordInput
          value={cpw}
          onChangeText={setCpw}
          placeholder="Confirm password"
        />
        <Pressable
          onPress={onSubmit}
          className="bg-blue-600 rounded-xl py-3 mt-2"
        >
          <Text className="text-white text-center font-semibold">Register</Text>
        </Pressable>
      </View>
    </View>
  );
}
