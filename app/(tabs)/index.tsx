import { ScrollView, StyleSheet, Text } from "react-native";

import { View } from "@/components/Themed";
import { FolioTable } from "../components/foliotable";
import { mockCoins } from "../mocks/chartData";
import { CounterComponent } from "../components/exampleComponent";
import CounterDisplay from "../components/exampleDisplayComponent";

export default function TabOneScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      fadingEdgeLength={50}
      removeClippedSubviews={true}
    >
      <View style={styles.tableContainer}>
        <FolioTable data={mockCoins} />
      </View>
      <View style={styles.textStyle}>
        <CounterDisplay></CounterDisplay>
      </View>
      <View style={styles.container}>
        <CounterComponent></CounterComponent>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    color: "black", // Set text color to black
    fontSize: 20, // Increase text size
    backgroundColor: "white", // Set background color to white
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255)",
  },
});
