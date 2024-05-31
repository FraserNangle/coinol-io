import { FlatList, StyleSheet, TouchableHighlight } from "react-native";

import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { DataTable, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { fetchAllCoinData } from "@/app/services/coinService";
import { useDispatch, useSelector } from "react-redux";
import { setAllCoinData } from "@/app/slices/allCoinDataSlice";
import { RootState } from "@/app/store/store";
import { Coin } from "@/app/models/Coin";

export default function AddTransactionCurrencyListScreen() {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Coin[]>();
  const navigation = useNavigation();

  const dispatch = useDispatch();

  useEffect(() => {
    fetchAllCoinData().then(data => {
      dispatch(setAllCoinData(data));
      setFilteredData(data);
    });
  }, []);

  const allCoinData = useSelector((state: RootState) => state.allCoinData.allCoinData) || [];

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text) {
      const newData = allCoinData.filter((item: Coin) => {
        const itemName = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const itemSymbol = item.symbol ? item.symbol.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemName.indexOf(textData) > -1 || itemSymbol.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(allCoinData);
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
                navigation.navigate("pages/addTransaction/addTransactionScreen", { item: item })
              }
            >
              <DataTable.Row key={item.name}>
                <DataTable.Cell>
                  <View style={styles.row}>
                    <Text>
                      {item.name}
                    </Text>
                    <Text style={styles.bold}>
                      {' (' + item.symbol.toUpperCase() + ')'}
                    </Text>
                  </View>
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
    flex: 1,
    flexDirection: "row",
    //justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'hsl(0, 0%, 15%)',
  }
});
