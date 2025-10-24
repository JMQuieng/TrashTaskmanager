import { Pressable, Text } from "react-native";
export default function FloatingAddButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-blue-600 rounded-full px-5 py-4 shadow"
    >
      <Text className="text-white text-xl">＋</Text>
    </Pressable>
  );
}
