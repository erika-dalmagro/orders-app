import React from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import CalendarView from "../components/calendar/CalendarView";

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CalendarView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
