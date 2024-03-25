import { StyleSheet, TouchableHighlight, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Divider, Button } from "react-native-paper";
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
        setShowDatePicker(false);
        if (event.type === "dismissed") {
            return;
        } else if (event.type === "set") {
            setDate(changedDate || date);
            setShowTimePicker(true);
        }
    };

    const changeTime = (event: DateTimePickerEvent, time: Date | undefined) => {
        setShowTimePicker(false);
        setDate(combineDateAndTime(date, time));
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

    //TODO: Implement the sellAll function
    const sellAll = () => {
        setTotal("PLACEHOLDER");
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
                    <Text style={styles.tag}>Total</Text>
                    <View style={styles.ticker}>
                        <TextInput
                            style={styles.textInput}
                            value={total}
                            multiline={false}
                            numberOfLines={1}
                            inputMode="decimal"
                            onChangeText={(value) => {
                                const isPositiveDecimal = /^\d*\.?\d*$/.test(value);
                                if (isPositiveDecimal) {
                                    setTotal(value);
                                }
                            }}
                            placeholder="0"
                            placeholderTextColor={'hsl(0, 0%, 60%)'}
                            selectionColor="white"
                            cursorColor="white"
                            maxLength={60}
                            textAlign="right"
                        />
                        <Text>{' '}{item.name}</Text>
                        {transactionType === "SELL" &&
                            <TouchableHighlight
                                onPress={() => sellAll()}
                            >
                                <Text style={{ color: 'red', paddingLeft: 10 }}>
                                    SELL ALL
                                </Text>
                            </TouchableHighlight>
                        }
                    </View>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text style={styles.tag}>Price</Text>
                    <View style={styles.ticker}>
                        <TextInput
                            style={styles.textInput}
                            value={price}
                            multiline={false}
                            numberOfLines={1}
                            inputMode="decimal"
                            onChangeText={(value) => {
                                const isPositiveDecimal = /^\d*\.?\d*$/.test(value);
                                if (isPositiveDecimal) {
                                    setPrice(value);
                                }
                            }}
                            placeholder={`${item.price24}`}
                            placeholderTextColor={'hsl(0, 0%, 60%)'}
                            selectionColor="white"
                            cursorColor="white"
                            maxLength={60}
                            textAlign="right"
                        />
                        <Text>{' '}USD</Text>
                    </View>
                </View>
                {transactionType !== "HOLDING" &&
                    <View>
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
                    </View>}

            </View>
            <View style={styles.notesContainer}>
                <TextInput
                    style={styles.textBox}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes..."
                    placeholderTextColor={'hsl(0, 0%, 60%)'}
                    selectionColor="white"
                    cursorColor="white"
                    multiline={true}
                    maxLength={1000}
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
        padding: 20,
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
        color: 'white',
        textAlign: "right",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
    },
    textBox: {
        flex: 1,
        color: 'white',
        backgroundColor: 'hsl(0, 0%, 15%)',
        textAlignVertical: 'top'
    },
    tag: {
        zIndex: 1,
        backgroundColor: "hsl(0, 0%, 15%)",
        paddingRight: 10
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 60,
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    ticker: {
        position: "relative",
        zIndex: -1,
        flex: 1,
        justifyContent: "flex-end",
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
    }
});
