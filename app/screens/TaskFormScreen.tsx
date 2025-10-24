import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addEvent,
  listUserEvents,
  updateEvent,
  softDeleteEvent,
} from "../../services/eventService";
import type { EventItem } from "../../types";

export default function TaskFormScreen({ route, navigation }: any) {
  const eventId = route.params?.eventId as string | undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    (async () => {
      if (!eventId) return;
      const userId = await AsyncStorage.getItem("currentUserId");
      if (!userId) return;
      const list = await listUserEvents(userId);
      const e = list.find((x) => x.id === eventId);
      if (e) {
        setEditingEvent(e);
        setTitle(e.title);
        setDescription(e.description || "");
        setStart(new Date(e.start_date));
        setEnd(new Date(e.end_date));
      }
    })();
  }, [eventId]);

  const onSave = async () => {
    if (!title.trim()) return Alert.alert("Error", "Title is required");
    if (end <= start) return Alert.alert("Error", "End must be after start");
    const userId = await AsyncStorage.getItem("currentUserId");
    if (!userId) return;

    if (editingEvent) {
      const updated: EventItem = {
        ...editingEvent,
        title: title.trim(),
        description: description.trim(),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };
      await updateEvent(userId, updated);
    } else {
      await addEvent(userId, {
        title: title.trim(),
        description: description.trim(),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });
    }
    navigation.goBack();
  };

  const onDelete = async () => {
    if (!editingEvent) return;
    const userId = await AsyncStorage.getItem("currentUserId");
    if (!userId) return;
    await softDeleteEvent(userId, editingEvent.id);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 py-4 border-b bg-white flex-row items-center justify-between">
        <Text className="text-xl font-bold">
          {editingEvent ? "Edit Task" : "New Task"}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          <Text>Back</Text>
        </Pressable>
      </View>

      <View className="p-5 gap-3">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          className="border rounded-xl px-3 py-3 bg-white"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          className="border rounded-xl px-3 py-3 bg-white"
        />

        <Text className="mt-2 font-semibold">Start</Text>
        <DateTimePicker
          value={start}
          mode="datetime"
          onChange={(_, d) => d && setStart(d)}
        />

        <Text className="mt-2 font-semibold">End</Text>
        <DateTimePicker
          value={end}
          mode="datetime"
          onChange={(_, d) => d && setEnd(d)}
        />

        {editingEvent && (
          <Pressable
            onPress={onDelete}
            className="bg-red-600 rounded-xl py-3 mt-2"
          >
            <Text className="text-white text-center font-semibold">Delete</Text>
          </Pressable>
        )}
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
