import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { logMedicationDoseLocal } from "../services/database";
import { invokeFamilyAgent } from "../services/supabase";
import type { FamilyMember } from "../types/family";

const DEMO_MEMBERS: Pick<FamilyMember, "id" | "display_name" | "role">[] = [
  { id: "m1", display_name: "Parent 1", role: "admin" },
  { id: "m2", display_name: "Parent 2", role: "member" },
  { id: "m3", display_name: "Enfant", role: "child" }
];

export default function DailyFamilyScreen() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("Prêt à organiser l'agenda et les rappels du foyer.");
  const [loading, setLoading] = useState(false);

  async function handleSendPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
      const result = await invokeFamilyAgent({
        prompt: trimmed,
        householdMembers: DEMO_MEMBERS,
        timezone
      });

      setReply(result.reply || `${result.tool_calls.length} action(s) préparée(s) par l'agent.`);
      setPrompt("");
    } catch (err) {
      setReply(`Erreur : ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogTaken() {
    const nowIso = new Date().toISOString();
    logMedicationDoseLocal(`log-${Date.now()}`, "plan-demo", nowIso, "taken");
    setReply("Prise de médicament enregistrée localement (en attente de synchro).");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Assistant Familial</Text>
        <Text style={styles.subtitle}>Agenda, activités et suivi santé</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>{reply}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ex. : Foot de Léo mercredi à 17h..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />

        <Pressable style={styles.primaryButton} onPress={() => void handleSendPrompt()} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Envoyer à l'agent</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleQuickLogTaken}>
          <Text style={styles.secondaryButtonText}>Marquer une prise effectuée (hors ligne)</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { flex: 1, padding: 20, gap: 14 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#475569" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  cardText: { fontSize: 15, color: "#1E293B", lineHeight: 22 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    fontSize: 15,
    textAlignVertical: "top"
  },
  primaryButton: {
    backgroundColor: "#0284C7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: { color: "#0369A1", fontSize: 14, fontWeight: "600" }
});
