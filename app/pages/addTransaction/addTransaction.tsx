import { FlatList, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { DataTable, TextInput } from "react-native-paper";
import { mockCoinAPI } from "@/app/mocks/chartData";

export default function AddTransactionScreen() {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(mockCoinAPI);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text) {
      const newData = mockCoinAPI.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(mockCoinAPI);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.tableContainer}>
        <TextInput
          textColor="white"
          style={styles.searchBar}
          value={query}
          placeholder="Search..."
          onChangeText={handleSearch}
        />
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <DataTable.Row key={item.name}>
              <DataTable.Cell>
                <View style={styles.column}>
                  <View style={styles.row}>
                    <Text style={styles.ticker}>{item.name}</Text>
                  </View>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the screen
    backgroundColor: "black",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  searchBar: {
    backgroundColor: "black",
    fontWeight: "bold",
    color: "#fff",
  },
  ticker: {
    fontWeight: "200",
    color: "#fff",
  },
  bold: {
    fontWeight: "bold",
    color: "#fff",
  },
  normal: {
    color: "#fff",
  },
  rightAlign: {
    textAlign: "right",
  },
  leftAlign: {
    textAlign: "left",
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
});
