import { Button, StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTransactionScreen() {
  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState([
    { key: "buy", title: "Buy" },
    { key: "sell", title: "Sell" },
    { key: "holding", title: "Holding" },
  ]);
  const [total, setTotal] = React.useState("");
  const [date, setDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [price, setPrice] = React.useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const route = useRoute();
  const layout = useWindowDimensions();

  // Retrieve the item parameter
  const { item } = route.params;

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setSelectedDate(currentDate);
  };

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
      setShowDatePicker(false);
    }
  }, [selectedDate]);

  const handleDatePickerFocus = () => {
    setShowDatePicker(true);
  };

  const handleTimePickerFocus = () => {
    setShowTimePicker(true);
  };

  const Buy = () => (
    <View style={styles.screenContainer}>
      <View>
        <View style={styles.row}>
          <Text>Total {item.name}</Text>
          <TextInput
            textColor="white"
            value={total}
            onChangeText={setTotal}
            placeholder="0"
          />
        </View>
        <View style={styles.row}>
          <Text>Date & Time</Text>
          <TextInput
            value={date.toLocaleDateString('en-US', { month: '2-digit', day: 'numeric', year: '2-digit' })}
            onFocus={handleDatePickerFocus}
          />
          <TextInput
            value={date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            onFocus={handleTimePickerFocus}
          />
        </View>
        <View style={styles.row}>
          <Text>Price</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder={`${item.price24} USD`}
            keyboardType="numeric"
          />
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="clock"
          onChange={onDateChange}
        />
      )}
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
    backgroundColor: "black",
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
