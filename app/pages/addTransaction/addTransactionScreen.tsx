import { StyleSheet, TouchableHighlight, TextInput, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addBatchTransactionData } from "@/app/services/transactionService";
import { UserTransaction } from "@/app/models/UserTransaction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setLastTransaction } from "@/app/slices/lastTransactionSlice";
import { randomUUID } from "expo-crypto";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import Toast from 'react-native-root-toast';
import { Coin } from "@/app/models/Coin";
import { Image } from "expo-image";
import { MultiSelect } from 'react-native-element-dropdown';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView } from "react-native-gesture-handler";

type RouteParams = {
    item: Coin;
};

export default function AddTransactionBuySellScreen() {
    const [transactionType, setTransactionType] = useState("BUY");
    const [total, setTotal] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [canSell, setCanSell] = useState(false);
    const [selectedFolios, setSelectedFolios] = useState<string[]>([]);

    const db = useSQLiteContext();

    // Retrieve the item parameter from the currency list page
    const route = useRoute();
    const { item }: { item: Coin } = route.params as RouteParams;

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

    useEffect(() => {
        navigation.setOptions({
            title: 'Add Transaction',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: item.image }}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                    />
                    <Text style={{ color: 'white', fontSize: 18 }}>{item.name}</Text>
                </View>
            ),
        });
    }, [navigation]);

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

    const addTransactions = (db: SQLiteDatabase, transactions: UserTransaction[]) => {
        addBatchTransactionData(db, transactions)
            .then(() => {
                Toast.show(`Added ${item.name} transaction to portfolio(s). `, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                });
                const lastTransaction = transactions.length > 0 ? transactions[transactions.length - 1] : null;
                dispatch(setLastTransaction(lastTransaction));
                navigation.navigate('index');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleTotalInputChange = (text: string) => {
        // Regular expression to match positive floating point numbers or a single decimal point
        const regex = /^(?:\d*\.?\d*)$/;
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

    const folioList = [
        { name: 'Main Portfolio Bitcoin', id: '1' },
        { name: 'Secondary Purchases', id: '2' },
        { name: 'Kucoin Stuff', id: '3' },
        { name: 'Metamask Wallet 1', id: '4' },
        { name: 'Item 5', id: '5' },
        { name: 'Item 6', id: '6' },
        { name: 'Item 7', id: '7' },
        { name: 'Item 8', id: '8' },
    ];

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
                            onChangeText={handleTotalInputChange}
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
                        <Text >
                            {date.toLocaleDateString('en-US', { month: '2-digit', day: 'numeric', year: '2-digit' })}
                            <Text style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                                {" at "}
                            </Text>
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
            <View style={styles.tableContainer}>
                <View style={styles.row}>
                    <Text style={styles.tag}>Folio(s)</Text>
                    <View style={styles.inputContainer}>
                        <MultiSelect
                            style={styles.dropdown}
                            containerStyle={styles.dropdownContainer}
                            activeColor="rgba(255, 255, 255, 0.15)"
                            itemContainerStyle={styles.dropdownItemContainer}
                            iconStyle={styles.iconStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={{ color: 'white', fontSize: 14 }}
                            data={folioList}
                            labelField="name"
                            valueField="id"
                            search
                            searchField="name"
                            value={selectedFolios}
                            searchPlaceholder="Search..."
                            onChange={(folios) => {
                                setSelectedFolios(folios);
                            }}
                            renderSelectedItem={() => (<></>)}
                        >
                        </MultiSelect>
                    </View>
                </View>
            </View>
            {selectedFolios.length > 0 && (
                <View style={styles.tableContainer}>
                    <ScrollView horizontal contentContainerStyle={styles.row}>
                        {selectedFolios.map(folio => (
                            <TouchableOpacity key={folio} onPress={() => {
                                setSelectedFolios(prevSelected => prevSelected.filter(selectedItem => selectedItem !== folio));
                            }}>
                                <View style={styles.selectedStyle}>
                                    <Text>{folioList.find(folioItem => folioItem.id === folio)?.name ?? ''}</Text>
                                    <MaterialIcons style={styles.iconStyle} color="white" name="cancel" size={20} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            <Button
                buttonColor="black"
                textColor={"white"}
                rippleColor="white"
                style={styles.bigButton}
                compact
                mode="contained"
                onPress={() => {
                    if (selectedFolios.length === 0) {
                        Toast.show(`Select at least one folio to add your transaction to. `, {
                            backgroundColor: "hsl(0, 0%, 15%)",
                            duration: Toast.durations.LONG,
                        });
                        return;
                    }

                    const newTransactions: UserTransaction[] = selectedFolios.map(folio => {
                        return {
                            id: randomUUID(),
                            coinId: item.id,
                            date: date.toISOString(),
                            quantity: Number(total),
                            type: transactionType,
                            folioId: folio,
                            folioName: folioList.find(folioItem => folioItem.id === folio)?.name ?? '',
                        };
                    });
                    addTransactions(db, newTransactions)
                }}>
                ADD TRANSACTION
            </Button>
            {showDatePicker && (
                <RNDateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={changeDate}
                    accentColor="FFFFFF"
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
        borderRadius: 5,
        borderWidth: 1,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
    },
    textInput: {
        width: "80%",
        color: 'white',
    },
    dropdown: {
        width: 230,
    },
    dropdownContainer: {
        backgroundColor: "black",
        borderWidth: 0,
        borderRadius: 5,
        padding: 5,
    },
    dropdownItemContainer: {
        color: 'white',
        borderRadius: 5,
        textAlignVertical: 'center',
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
    },
    selectedStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        marginRight: 10,
    },
    iconStyle: {
        width: 20,
        height: 20,
        marginLeft: 5,
    },
    inputSearchStyle: {
        backgroundColor: "transparent",
        color: "white",
        borderWidth: 0,
    },
});