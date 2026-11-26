import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import DailyFamilyScreen from "./src/screens/DailyFamilyScreen";
import { initLocalDatabase } from "./src/services/database";
import { requestNotificationPermissions } from "./src/services/notifications";

export default function App() {
  useEffect(() => {
    initLocalDatabase();
    void requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <DailyFamilyScreen />
    </>
  );
}
