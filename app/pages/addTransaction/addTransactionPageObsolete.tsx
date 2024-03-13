import { Button, StyleSheet, TouchableHighlight, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Divider, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTransactionScreen() {
  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState([
    { key: "buy", title: "Buy" },
    { key: "sell", title: "Sell" },
    { key: "holding", title: "Holding" },
  ]);
  const [total, setTotal] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [date, setDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const layout = useWindowDimensions();

  // Retrieve the item parameter from the route page
  const route = useRoute();
  const { item } = route.params;

  const onDatePicked = (event, selectedDate) => {
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

  const Buy = React.memo(() => (
    <View style={styles.screenContainer}>
      <View style={styles.tableContainer}>
        <View style={styles.row}>
          <Text>Total {item.name}</Text>
          <TextInput
            style={styles.textInput}
            textColor="white"
            underlineColor='hsl(0, 0%, 20%)'
            activeUnderlineColor='hsl(0, 0%, 40%)'
            dense={true}
            multiline={false}
            value={total}
            onChangeText={total => setTotal(total)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
        <Divider />
        <View style={styles.row}>
          <Text>Price</Text>
          <TextInput
            style={styles.textInput}
            textColor="white"
            dense={true}
            multiline={false}
            value={price}
            onChangeText={setPrice}
            placeholder={`${item.price24} USD`}
            keyboardType="numeric"
          />
        </View>
        <Divider />
        <View style={styles.row}>
          <Text>Date & Time</Text>
          <TouchableHighlight
            onPress={handleDatePickerFocus}
          >
            <Text style={styles.textInput}>
              {date.toLocaleDateString('en-US', { month: '2-digit', day: 'numeric', year: '2-digit' })}
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableHighlight>
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDatePicked}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="clock"
          onChange={onDatePicked}
        />
      )}
    </View>
  ));
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
    justifyContent: "center",
    backgroundColor: 'hsl(0, 0%, 0%)',
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableContainer: {
    width: "80%",
    backgroundColor: 'hsl(0, 0%, 20%)',
    borderRadius: 10,
    padding: 10,
  },
  textInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'hsl(0, 0%, 20%)',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
    backgroundColor: 'hsl(0, 0%, 20%)',
    padding: 10,
  },
});
