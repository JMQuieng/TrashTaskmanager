import { atom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";

// Simple helper that mimics jotai's createJSONStorage
export function createJSONStorage<T>(getStorage: () => typeof AsyncStorage) {
  const storage = getStorage();
  return {
    getItem: async (key: string): Promise<T | null> => {
      const raw = await storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    setItem: async (key: string, value: T) => {
      await storage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key: string) => {
      await storage.removeItem(key);
    },
  };
}

const storage = createJSONStorage<User[] | string | null>(() => AsyncStorage);

export const usersAtom = atom<User[]>([]);
usersAtom.onMount = (set) => {
  AsyncStorage.getItem("users").then((raw) => {
    if (raw) set(JSON.parse(raw));
  });
};

export const currentUserIdAtom = atom<string | null>(null);
currentUserIdAtom.onMount = (set) => {
  AsyncStorage.getItem("currentUserId").then((v) => set(v));
};

// Persist writes
export const setUsersAtom = atom(null, async (_get, _set, next: User[]) => {
  await AsyncStorage.setItem("users", JSON.stringify(next));
  _set(usersAtom, next);
});

export const setCurrentUserIdAtom = atom(
  null,
  async (_get, _set, next: string | null) => {
    if (next === null) await AsyncStorage.removeItem("currentUserId");
    else await AsyncStorage.setItem("currentUserId", next);
    _set(currentUserIdAtom, next);
  }
);
