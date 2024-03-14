import { StyleSheet, TouchableHighlight } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Divider, TextInput, Button } from "react-native-paper";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function AddTransactionBuySellScreen() {
    const [transactionType, setTransactionType] = React.useState("BUY");
    const [total, setTotal] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [date, setDate] = React.useState(new Date());
    const [notes, setNotes] = React.useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Retrieve the item parameter from the route page
    const route = useRoute();
    const { item } = route.params;

    const changeDate = (event: DateTimePickerEvent, changedDate: Date | undefined) => {
        setDate(changedDate ? changedDate : date);
        setShowDatePicker(false);
        setShowTimePicker(true);
    };

    const changeTime = (event: DateTimePickerEvent, time: Date | undefined) => {
        setDate(combineDateAndTime(date, time));
        setShowTimePicker(false);
    };

    const combineDateAndTime = (date: Date, time: Date) => {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        );
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.buttonContainer}>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor={transactionType === "BUY" ? "green" : "hsl(0, 0%, 60%)"}
                    style={[styles.button, transactionType === "BUY" ? { borderColor: 'green' } : { borderColor: 'hsl(0, 0%, 15%)' }]}
                    compact
                    mode="outlined"
                    onPress={() => setTransactionType("BUY")}>
                    BUY
                </Button>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor={transactionType === "SELL" ? "red" : "hsl(0, 0%, 60%)"}
                    style={[styles.button, transactionType === "SELL" ? { borderColor: 'red' } : { borderColor: 'hsl(0, 0%, 15%)' }]}
                    compact
                    mode="outlined"
                    onPress={() => setTransactionType("SELL")}>
                    SELL
                </Button>
                <Button
                    buttonColor="hsl(0, 0%, 15%)"
                    textColor={transactionType === "HOLDING" ? "orange" : "hsl(0, 0%, 60%)"}
                    style={[styles.button, transactionType === "HOLDING" ? { borderColor: 'orange' } : { borderColor: 'hsl(0, 0%, 15%)' }]}
                    compact
                    mode="outlined"
                    onPress={() => setTransactionType("HOLDING")}>
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
                        onPress={() => setShowDatePicker(true)}
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
                    style={styles.textBox}
                    underlineColor='hsl(0, 0%, 15%)'
                    activeUnderlineColor='hsl(0, 0%, 15%)'
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes"
                    placeholderTextColor={'hsl(0, 0%, 60%)'}
                    selectionColor="white"
                    cursorColor="white"
                    multiline={true}
                    maxLength={2000}
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
                <RNDateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={changeDate}
                />
            )}
            {showTimePicker && (
                <RNDateTimePicker
                    value={date}
                    mode="time"
                    display="clock"
                    onChange={changeTime}
                />
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
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
    textBox: {
        flex: 1,
        backgroundColor: 'hsl(0, 0%, 15%)',
        textAlignVertical: 'top'
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
