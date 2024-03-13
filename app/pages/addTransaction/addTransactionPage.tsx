import { StyleSheet, TouchableHighlight, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Divider, TextInput, Button } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTransactionBuySellScreen() {
    const [total, setTotal] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [date, setDate] = React.useState(new Date());
    const [notes, setNotes] = React.useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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

    return (
        <View style={styles.screenContainer}>
            <View style={styles.buttonContainer}>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor="green"
                    style={[styles.button, { borderColor: 'green', }]}
                    compact
                    mode="outlined"
                    onPress={() => handleTransaction("BUY")}>
                    BUY
                </Button>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor="red"
                    style={[styles.button, { borderColor: 'red', }]}
                    compact
                    mode="outlined"
                    onPress={() => handleTransaction("SELL")}>
                    SELL
                </Button>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor="orange"
                    style={[styles.button, { borderColor: 'orange', }]}
                    compact
                    mode="outlined"
                    onPress={() => handleTransaction("HOLDING")}>
                    HOLDING
                </Button>
            </View>
            <View style={styles.tableContainer}>
                <View style={styles.row}>
                    <Text>Total</Text>
                    <View style={styles.ticker}>
                        <TextInput
                            style={styles.textInput}
                            textColor="white"
                            underlineColor='hsl(0, 0%, 15%)'
                            activeUnderlineColor='hsl(0, 0%, 15%)'
                            dense={true}
                            multiline={false}
                            value={total}
                            onChangeText={setTotal}
                            placeholder="0"
                            placeholderTextColor={'hsl(0, 0%, 60%)'}
                            selectionColor="white"
                            cursorColor="white"
                            keyboardType="numeric"
                        />
                        <Text>{item.name}</Text>
                    </View>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text>Price</Text>
                    <View style={styles.ticker}>
                        <TextInput
                            style={styles.textInput}
                            textColor="white"
                            underlineColor='hsl(0, 0%, 15%)'
                            activeUnderlineColor='hsl(0, 0%, 15%)'
                            dense={true}
                            multiline={false}
                            value={price}
                            onChangeText={setPrice}
                            placeholder={`${item.price24}`}
                            placeholderTextColor={'hsl(0, 0%, 60%)'}
                            selectionColor="white"
                            cursorColor="white"
                            keyboardType="numeric"
                        />
                        <Text>USD</Text>
                    </View>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text>Date & Time</Text>
                    <TouchableHighlight
                        onPress={handleDatePickerFocus}
                    >
                        <Text style={styles.textInput}>
                            {date.toLocaleDateString('en-US', { month: '2-digit', day: 'numeric', year: '2-digit' })}
                            {" "}
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
            <View style={styles.notesContainer}>
                <TextInput
                    textColor="white"
                    style={styles.textInput}
                    underlineColor='hsl(0, 0%, 15%)'
                    activeUnderlineColor='hsl(0, 0%, 15%)'
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes"
                    placeholderTextColor={'hsl(0, 0%, 60%)'}
                    selectionColor="white"
                    cursorColor="white"
                />
            </View>
            <Button
                buttonColor="hsl(0, 0%, 25%)"
                style={styles.bigButton}
                compact
                mode="contained"
                onPress={() => addTransaction()}>
                ADD TRANSACTION
            </Button>
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
        </View >
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
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderRadius: 10,
        padding: 10,
    },
    notesContainer: {
        width: "80%",
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        height: 150,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "80%",
        marginBottom: 10,
        marginTop: 10,
    },
    button: {
        width: "25%",
    },
    bigButton: {
        width: "80%",
        marginTop: 10,
    },
    textInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 80,
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    ticker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
    }
});
