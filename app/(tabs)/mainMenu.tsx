import { StyleSheet } from "react-native";

import { View, Text } from "@/components/Themed";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabTwoScreen() {
  return (
    <View style={styles.screenContainer}>
      <ScrollView fadingEdgeLength={25}>
        <View style={styles.settingsRow}>
          <MaterialIcons
            name="manage-accounts"
            size={30}
            color="white"
            style={{ paddingRight: 10 }}
          />
          <Text>
            {"Account"}
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <MaterialIcons
            name="settings"
            size={30}
            color="white"
            style={{ paddingRight: 10 }}
          />
          <Text>
            {"Preferences"}
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <MaterialIcons
            name="notifications"
            size={30}
            color="white"
            style={{ paddingRight: 10 }}
          />
          <Text>
            {"Alerts"}
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <MaterialIcons
            name="info"
            size={30}
            color="white"
            style={{ paddingRight: 10 }}
          />
          <Text>
            {"About App"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    alignContent: "center",
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, .3)",
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    textAlignVertical: "center",
    textAlign: "center",
    height: 60,
  },
});
