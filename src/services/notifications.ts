import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { MedicationPlan } from "../types/family";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medication-alerts", {
      name: "Rappels médicaments",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0284C7"
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleMedicationReminders(
  plan: MedicationPlan,
  memberName: string
): Promise<string[]> {
  const scheduledIds: string[] = [];

  for (const timeStr of plan.schedule_times) {
    const [hourPart, minutePart] = timeStr.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);

    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;

    const bodyText = plan.meal_instruction
      ? `${memberName} : ${plan.med_name} (${plan.dosage}) — ${plan.meal_instruction}`
      : `${memberName} : ${plan.med_name} (${plan.dosage})`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Prise de médicament",
        body: bodyText,
        data: { planId: plan.id, memberName, scheduledTime: timeStr },
        sound: true
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute
      }
    });

    scheduledIds.push(id);
  }

  return scheduledIds;
}
