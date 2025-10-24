import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "../../services/userService";
import { updateUser } from "../../services/authService";
import PasswordInput from "../../components/PasswordInput";
import { isValidEmail, isValidPassword } from "../../services/validation";

export default function SettingsScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string>("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("currentUserId");
      if (!id) return;
      setUserId(id);
      const u = await getUser(id);
      if (u) {
        setFirst(u.first_name);
        setLast(u.last_name);
        setEmail(u.email);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!isValidEmail(email)) return Alert.alert("Error", "Invalid email");
    const patch: any = {
      first_name: first.trim(),
      last_name: last.trim(),
      email: email.trim(),
    };
    if (pw || cpw) {
      if (!isValidPassword(pw))
        return Alert.alert(
          "Error",
          "Password must be ≥5 chars with number & special"
        );
      if (pw !== cpw) return Alert.alert("Error", "Passwords do not match");
      patch.password = pw; // authService will hash
    }
    const res = await updateUser(userId, patch);
    if (!res.ok) return Alert.alert("Save failed", res.error);
    Alert.alert("Saved", "Profile updated");
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 py-4 border-b bg-white flex-row items-center justify-between">
        <Text className="text-xl font-bold">Settings</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          <Text>Back</Text>
        </Pressable>
      </View>
      <View className="p-5 gap-3">
        <TextInput
          className="border rounded-xl px-3 py-3 bg-white"
          value={first}
          onChangeText={setFirst}
          placeholder="First name"
        />
        <TextInput
          className="border rounded-xl px-3 py-3 bg-white"
          value={last}
          onChangeText={setLast}
          placeholder="Last name"
        />
        <TextInput
          className="border rounded-xl px-3 py-3 bg-white"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <PasswordInput
          value={pw}
          onChangeText={setPw}
          placeholder="New password (optional)"
        />
        <PasswordInput
          value={cpw}
          onChangeText={setCpw}
          placeholder="Confirm password (optional)"
        />
        <Pressable
          onPress={onSave}
          className="bg-blue-600 rounded-xl py-3 mt-2"
        >
          <Text className="text-white text-center font-semibold">Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
