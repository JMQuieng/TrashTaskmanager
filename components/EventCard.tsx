import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { format } from "date-fns";
import type { EventItem } from "../types";

export default function EventCard({
  event,
  onEdit,
  onCancel,
  onRecover,
}: {
  event: EventItem;
  onEdit: () => void;
  onCancel: () => void;
  onRecover: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isCanceled = event.status === "canceled";

  return (
    <Pressable
      onPress={() => setOpen((s) => !s)}
      className={`border rounded-xl p-3 mb-3 ${
        isCanceled ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <Text className="text-lg font-semibold">{event.title}</Text>
      <Text className="text-gray-600">
        {format(new Date(event.start_date), "PPpp")} —{" "}
        {format(new Date(event.end_date), "PPpp")}
      </Text>
      {open && (
        <View className="mt-2 gap-2">
          {event.description ? (
            <Text className="text-gray-700">{event.description}</Text>
          ) : null}
          <View className="flex-row gap-3 mt-1">
            <Pressable
              onPress={onEdit}
              className="px-3 py-2 bg-blue-600 rounded"
            >
              <Text className="text-white">Edit</Text>
            </Pressable>
            {isCanceled ? (
              <Pressable
                onPress={onRecover}
                className="px-3 py-2 bg-green-600 rounded"
              >
                <Text className="text-white">Recover</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={onCancel}
                className="px-3 py-2 bg-red-600 rounded"
              >
                <Text className="text-white">Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
