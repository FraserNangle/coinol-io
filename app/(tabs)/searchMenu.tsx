import { FlatList, StyleSheet, TouchableHighlight, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { DataTable, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { fetchAllCoins } from "@/app/services/coinService";
import { useDispatch, useSelector } from "react-redux";
import { setAllCoinData } from "@/app/slices/allCoinDataSlice";
import { RootState } from "@/app/store/store";
import { Coin } from "@/app/models/Coin";

export default function SearchMenuScreen() {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Coin[]>();
  const navigation = useNavigation();

  const dispatch = useDispatch();

  useEffect(() => {
    fetchAllCoins().then(data => {
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
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("pages/coinGraph/coinGraphScreen", { coinId: item.id })
              }
            >
              <DataTable.Row key={item.name} style={[{ borderColor: "rgba(255, 255, 255, 0.3)", borderBottomWidth: .5 }]}>
                <DataTable.Cell>
                  <View style={styles.row}>
                    <View style={{ flexDirection: 'column', alignSelf: "center", paddingRight: 15, backgroundColor: 'transparent' }}>
                      <Image
                        src={item.image}
                        style={{ width: 25, height: 25 }}
                      />
                    </View>
                    <View style={styles.row}>
                      <Text style={[styles.bold, { paddingRight: 5 }]}>
                        {item.symbol.toUpperCase()}
                      </Text>
                      <Text style={styles.light}>
                        {item.name}
                      </Text>
                    </View>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            </TouchableHighlight>
          )}
        />
        <TextInput
          selectionColor={'hsl(0, 0%, 50%)'}
          cursorColor="white"
          maxLength={60}
          textAlign="right"
          multiline={false}
          numberOfLines={1}
          inputMode="search"
          placeholderTextColor={'hsl(0, 0%, 60%)'}
          textColor="white"
          style={styles.searchBar}
          value={query}
          placeholder="Search..."
          onChangeText={handleSearch}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: 'black',
  },
  searchBar: {
    backgroundColor: 'black',
    fontWeight: "bold",
    color: "white",
    borderColor: "rgba(255, 255, 255, .3)",
    borderTopWidth: 5,
    borderRadius: 5,
  },
  bold: {
    fontWeight: "bold",
    color: "white",
  },
  normal: {
    color: "white",
  },
  light: {
    fontWeight: "100",
    color: "white"
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
    alignItems: "center",
  }
});