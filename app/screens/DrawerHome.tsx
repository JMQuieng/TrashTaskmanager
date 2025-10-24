import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, Pressable, FlatList, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "../../services/userService";
import { listUserEvents, setEventStatus } from "../../services/eventService";
import EventCard from "../../components/EventCard";
import FloatingAddButton from "../../components/FloatingAddButton";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import type { EventItem, User } from "../../types";

const Drawer = createDrawerNavigator();

function HomeList({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const load = async () => {
    const userId = await AsyncStorage.getItem("currentUserId");
    if (!userId) return;
    const u = await getUser(userId);
    setUser(u);
    const list = await listUserEvents(userId);
    const filtered = list
      .filter((e) => e.status !== "deleted")
      .sort((a, b) =>
        a.status === "canceled" && b.status !== "canceled"
          ? 1
          : b.status === "canceled" && a.status !== "canceled"
          ? -1
          : new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    setEvents(filtered);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    return unsub;
  }, [navigation]);

  const onCancel = async (e: EventItem) => {
    const userId = await AsyncStorage.getItem("currentUserId");
    if (!userId) return;
    await setEventStatus(userId, e.id, "canceled");
    load();
  };
  const onRecover = async (e: EventItem) => {
    const userId = await AsyncStorage.getItem("currentUserId");
    if (!userId) return;
    await setEventStatus(userId, e.id, "active");
    load();
  };
  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 py-4 border-b bg-white">
        <Text className="text-xl font-bold">Your Tasks</Text>
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onEdit={() => navigation.navigate("TaskForm", { eventId: item.id })}
            onCancel={() => onCancel(item)}
            onRecover={() => onRecover(item)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No tasks yet. Tap + to add.
          </Text>
        }
      />
      <FloatingAddButton onPress={() => navigation.navigate("TaskForm")} />
    </View>
  );
}
function CustomDrawerContent(props: any) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem("currentUserId");
      if (!userId) return;
      setUser(await getUser(userId));
    })();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View className="px-4 py-4 border-b">
        <Text className="text-lg font-semibold">
          {user?.first_name} {user?.last_name}
        </Text>
        <Text className="text-gray-600">{user?.email}</Text>
        <Pressable
          onPress={() => props.navigation.navigate("Settings")}
          className="mt-2 bg-gray-200 rounded px-3 py-2 self-start"
        >
          <Text>Settings</Text>
        </Pressable>
      </View>
      <DrawerItem
        label="Logout"
        onPress={async () => {
          await AsyncStorage.removeItem("currentUserId");
          props.navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerHome() {
  return (
    <Drawer.Navigator drawerContent={(p) => <CustomDrawerContent {...p} />}>
      <Drawer.Screen
        name="Home"
        component={HomeList}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
