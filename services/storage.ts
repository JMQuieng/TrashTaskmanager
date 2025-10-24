import { User } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loadUsers = async (): Promise<User[]> => {
  const raw = await AsyncStorage.getItem("users");
  return raw ? JSON.parse(raw) : [];
};

export const saveUsers = async (users: User[]) => {
  await AsyncStorage.setItem("users", JSON.stringify(users));
};
