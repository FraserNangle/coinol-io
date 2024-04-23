import { FlatList, StyleSheet, TouchableHighlight } from "react-native";

import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { DataTable, Icon, TextInput } from "react-native-paper";
import { mockCoinAPI } from "@/app/mocks/chartData";
import { useNavigation } from "@react-navigation/native";

export default function AddTransactionCurrencyListScreen() {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(mockCoinAPI);
  const navigation = useNavigation();

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
          multiline={false}
          numberOfLines={1}
          inputMode="search"
          placeholderTextColor={'hsl(0, 0%, 60%)'}
          selectionColor="white"
          cursorColor="white"
          maxLength={60}
          textAlign="right"
          textColor="white"
          style={styles.searchBar}
          value={query}
          placeholder="Search..."
          onChangeText={handleSearch}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("pages/addTransaction/addTransactionScreen", { item })
              }
            >
              <DataTable.Row key={item.name}>
                <DataTable.Cell>
                  <Text>
                    {item.name}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            </TouchableHighlight>
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
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: 'hsl(0, 0%, 15%)',
  },
  searchBar: {
    backgroundColor: 'hsl(0, 0%, 5%)',
    fontWeight: "bold",
    color: "white",
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
  }
});
