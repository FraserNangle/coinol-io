import { Button, StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import DatePicker from "react-native-date-picker";
import { TextInput } from "react-native-paper";

export default function AddTransactionScreen() {
  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState([
    { key: "buy", title: "Buy" },
    { key: "sell", title: "Sell" },
    { key: "holding", title: "Holding" },
  ]);
  const [total, setTotal] = React.useState("");
  const [date, setDate] = React.useState(new Date());
  const [price, setPrice] = React.useState("");

  const route = useRoute();
  const layout = useWindowDimensions();

  // Retrieve the item parameter
  const { item } = route.params;

  const Buy = () => (
    <View>
      <TextInput
        textColor="white"
        value={total}
        onChangeText={setTotal}
        placeholder={`Total ${item.name}`}
      />
      {/*       <DatePicker
        date={date}
        onDateChange={setDate}
        mode="datetime"
        placeholder="Select date and time"
        format="YYYY-MM-DD HH:mm"
      /> */}
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />
    </View>
  );
  const Sell = () => (
    <View>
      <Text>Sell {item.name}</Text>
    </View>
  );
  const Holding = () => (
    <View>
      <Text>Add {item.name} Holding</Text>
    </View>
  );

  const renderScene = SceneMap({
    buy: Buy,
    sell: Sell,
    holding: Holding,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: "white" }}
          style={{ backgroundColor: "black" }}
        />
      )}
      initialLayout={{ width: layout.width }}
    />
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the screen
    backgroundColor: "blac",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
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
