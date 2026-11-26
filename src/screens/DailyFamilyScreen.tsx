import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from "react-native";

interface DailyItem {
  id: string;
  time: string;
  member: string;
  title: string;
  kind: "medication" | "event";
  done?: boolean;
}

export default function DailyFamilyScreen() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<DailyItem[]>([
    { id: "1", time: "08:00", member: "Léo", title: "Antibiotique (1 comprimé)", kind: "medication", done: false },
    { id: "2", time: "10:00", member: "Léo", title: "Match de foot — Stade Nord", kind: "event" },
    { id: "3", time: "14:30", member: "Moi", title: "Rendez-vous médecin généraliste", kind: "event" }
  ]);

  const toggleMed = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSendCommand = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        time: "À planifier",
        member: "Famille",
        title: trimmed,
        kind: "event"
      }
    ]);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Aujourd'hui — Famille</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, item.kind === "medication" && styles.medCard]}>
            <View style={styles.rowBetween}>
              <Text style={styles.time}>{item.time} • {item.member}</Text>
              {item.kind === "medication" && (
                <TouchableOpacity
                  style={[styles.badge, item.done && styles.badgeDone]}
                  onPress={() => toggleMed(item.id)}
                >
                  <Text style={styles.badgeText}>{item.done ? "Pris ✓" : "Valider"}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.title, item.done && styles.doneText]}>{item.title}</Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Ex. : Foot mercredi 17h, rappel soir 20h..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSendCommand}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendCommand}>
          <Text style={styles.sendText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { fontSize: 22, fontWeight: "700", padding: 16, color: "#0F172A" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  medCard: { borderLeftWidth: 4, borderLeftColor: "#0EA5E9" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  time: { fontSize: 13, fontWeight: "600", color: "#475569" },
  title: { fontSize: 16, fontWeight: "500", color: "#0F172A" },
  doneText: { textDecorationLine: "line-through", color: "#94A3B8" },
  badge: { backgroundColor: "#0284C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeDone: { backgroundColor: "#16A34A" },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  composer: { flexDirection: "row", padding: 12, gap: 8, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderColor: "#E2E8F0" },
  input: { flex: 1, backgroundColor: "#F1F5F9", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { backgroundColor: "#0F172A", borderRadius: 10, justifyContent: "center", paddingHorizontal: 16 },
  sendText: { color: "#FFFFFF", fontWeight: "600" }
});
