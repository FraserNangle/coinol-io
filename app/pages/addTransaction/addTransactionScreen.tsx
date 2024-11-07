import { StyleSheet, TouchableHighlight, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addTransactionData } from "@/app/services/transactionService";
import { UserTransaction } from "@/app/models/UserTransaction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setLastTransaction } from "@/app/slices/lastTransactionSlice";
import { randomUUID } from "expo-crypto";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import Toast from 'react-native-root-toast';

export default function AddTransactionBuySellScreen() {
    const [transactionType, setTransactionType] = React.useState("BUY");
    const [total, setTotal] = React.useState('');
    const [date, setDate] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [canSell, setCanSell] = useState(false);

    const db = useSQLiteContext();

    // Retrieve the item parameter from the currency list page
    const route = useRoute();
    const { item } = route.params;

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const userFolio = useSelector((state: RootState) => state.userFolio.userFolio) || [];

    useEffect(() => {
        userFolio.forEach((folioEntry) => {
            if (folioEntry.coinId === item.id && folioEntry.quantity > 0) {
                setCanSell(true);
            }
        });
    }, []);

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

    const sellAll = () => {
        userFolio.forEach((folioEntry) => {
            if (folioEntry.coinId === item.id) {
                setTotal(folioEntry.quantity.toString());
            }
        });
    };

    const addTransaction = (db: SQLiteDatabase, transaction: UserTransaction) => {
        addTransactionData(db, transaction)
            .then(() => {
                Toast.show(`Added ${item.name} transaction to portfolio. `, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                });
                dispatch(setLastTransaction(transaction));
                navigation.navigate('index');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleChange = (text: string) => {
        // Regular expression to match positive floating point numbers or a single decimal point
        const regex = /^(?:[0-9]*\.?[0-9]*)$/;
        if (regex.test(text)) {
            if (transactionType === "SELL") {
                userFolio.forEach((folioEntry) => {
                    if (folioEntry.coinId === item.id) {
                        if (Number(text) > folioEntry.quantity) {
                            setTotal(folioEntry.quantity.toString());
                            Toast.show(`Sell is limited to your ${item.name} quantity. `, {
                                backgroundColor: "hsl(0, 0%, 15%)",
                                duration: Toast.durations.LONG,
                            });
                        } else {
                            setTotal(text);
                        }
                    }
                });
            } else {
                setTotal(text);
            }
        }
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.buttonContainer}>
                <Button
                    buttonColor="black"
                    rippleColor="green"
                    textColor={transactionType === "BUY" ? "green" : "hsl(0, 0%, 60%)"}
                    style={[styles.button, transactionType === "BUY" ? { borderColor: 'green' } : { borderColor: 'hsl(0, 0%, 15%)' }, { borderBottomStartRadius: 2 }]}
                    compact
                    mode="outlined"
                    onPress={() => setTransactionType("BUY")}>
                    BUY
                </Button>
                <Button
                    disabled={!canSell}
                    buttonColor="black"
                    rippleColor="red"
                    textColor={transactionType === "SELL" ? "red" : "hsl(0, 0%, 60%)"}
                    style={[styles.button, transactionType === "SELL" ? { borderColor: 'red' } : { borderColor: 'hsl(0, 0%, 15%)' }, { borderBottomEndRadius: 2 }]}
                    compact
                    mode="outlined"
                    onPress={() => setTransactionType("SELL")}>
                    SELL
                </Button>

            </View>
            <View style={styles.tableContainer}>
                <View style={styles.row}>
                    <Text style={styles.tag}>Total</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={total.toString()}
                            multiline={false}
                            numberOfLines={1}
                            keyboardType='decimal-pad'
                            onChangeText={handleChange}
                            placeholder="0"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            selectionColor={"rgba(255, 255, 255, 0.5)"}
                            cursorColor="white"
                            maxLength={60}
                            textAlign="right"
                        />
                        <Text>{' '}{item.symbol.toUpperCase()}</Text>
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
            </View>
            <View style={styles.tableContainer}>
                <View style={styles.row}>
                    <Text>Date & Time</Text>
                    <TouchableHighlight
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.textInput}>
                            {date.toLocaleDateString('en-US', { month: '2-digit', day: 'numeric', year: '2-digit' })}
                            <Text style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                                {" at "}
                            </Text>
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
            <Button
                buttonColor="black"
                textColor={"white"}
                rippleColor="white"
                style={styles.bigButton}
                compact
                mode="contained"
                onPress={() => {
                    const newHolding: UserTransaction = {
                        id: randomUUID(),
                        coinId: item.id,
                        date: date.toISOString(),
                        quantity: Number(total),
                        type: transactionType,
                    };
                    addTransaction(db, newHolding)
                }}>
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
        justifyContent: "center",
        backgroundColor: 'black',
    },
    tableContainer: {
        width: "80%",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "80%",
        margin: 10
    },
    button: {
        width: "50%",
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 5,
        borderColor: "white",
    },
    bigButton: {
        width: "80%",
        borderRadius: 2,
        borderWidth: 1,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
    },
    textInput: {
        flex: 1,
        padding: 10,
        color: 'white',
    },
    tag: {
        paddingRight: 10
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 60,
        padding: 10,
    },
    inputContainer: {
        position: "relative",
        flex: 1,
        justifyContent: "flex-end",
        flexDirection: 'row',
        alignItems: 'center',
    }
});