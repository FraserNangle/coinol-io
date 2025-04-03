import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import React, { useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";

export default function TabTwoScreen() {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.graphContainer}>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.modeButtonContainer}>
        </View>
        <ScrollView fadingEdgeLength={25}>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  modeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
    alignContent: "center",
    width: "90%",
  },
  modeButton: {
    width: "50%",
    justifyContent: "center",
    alignContent: "center",
    borderRadius: 5,
    borderWidth: 0,
    borderColor: "white",
    paddingTop: 10,
  },
  tableContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "transparent",
  },
  graphContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "blue",
  },
});
