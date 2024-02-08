import { ScrollView, StyleSheet } from "react-native";

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
      <View style={styles.text}>
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
  text: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(20,124,54)",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255)",
  },
});
