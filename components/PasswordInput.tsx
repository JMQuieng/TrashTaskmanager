import { useState } from "react";
import { TextInput, View, Pressable, Text } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

export default function PasswordInput({
  value,
  onChangeText,
  placeholder,
}: any) {
  const [show, setShow] = useState(false);
  return (
    <View className="w-full">
      <View className="flex-row items-center border rounded-xl px-3">
        <TextInput
          className="flex-1 py-3"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
        <Pressable onPress={() => setShow((s) => !s)} className="p-2">
          {show ? <EyeOff /> : <Eye />}
        </Pressable>
      </View>
    </View>
  );
}
