import { StyleSheet, TouchableHighlight, TextInput, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Button } from "react-native-paper";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addBatchTransactionData, deleteTransactionById } from "@/app/services/transactionService";
import { UserTransaction } from "@/app/models/UserTransaction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setLastTransaction } from "@/app/slices/lastTransactionSlice";
import { randomUUID } from "expo-crypto";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import Toast from 'react-native-root-toast';
import { Coin } from "@/app/models/Coin";
import { MultiSelect } from 'react-native-element-dropdown';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView } from "react-native-gesture-handler";
import FolioCreationModal from "@/components/modals/folio/folioCreationModal";
import { setCurrentlySelectedFolio } from "@/app/slices/currentlySelectedFolioSlice";
import { getFolioCoinImages } from "@/app/helpers/folioHelpers";
import Decimal from 'decimal.js';
import { addTransactionSlice, deleteTransactionByIdSlice } from "@/app/slices/allTransactionsSlice";
import { SvgCssUri } from 'react-native-svg/css';

export type TransactionScreenRouteParams = {
    item?: Coin;
    transactionToEdit?: UserTransaction;
};

export default function TransactionScreen() {
    const showModal = () => setIsModalVisible(true);

    const db = useSQLiteContext();

    // Retrieve the item parameter from the currency list page
    const route = useRoute();
    const { item, transactionToEdit }: { item?: Coin; transactionToEdit?: UserTransaction } = route.params as TransactionScreenRouteParams;

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
    const folios = useSelector((state: RootState) => state.folios.folios) || [];
    const coinsMarketsList = useSelector((state: RootState) => state.allCoinData.coinsMarketsList) || [];
    const currentFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);

    const [persistedItem, setPersistedItem] = useState<Coin | undefined>(item);
    const [transactionType, setTransactionType] = useState(transactionToEdit?.type ?? "BUY");
    const [total, setTotal] = useState(transactionToEdit?.quantity ? transactionToEdit?.quantity.toString() : "");
    const [date, setDate] = useState(transactionToEdit?.date ? new Date(transactionToEdit?.date) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [canSell, setCanSell] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedFolios, setSelectedFolios] = useState<string[]>(
        transactionToEdit?.folioId ? [transactionToEdit.folioId] : 
        currentFolio?.folioId ? [currentFolio.folioId] : 
        []
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (transactionToEdit) {
            setPersistedItem(coinsMarketsList.find((coin) => coin.id === transactionToEdit?.coinId) ?? {
                id: '',
                name: '',
                symbol: '',
                image: '',
            });
        }
    }, [transactionToEdit, navigation, coinsMarketsList]);

    useEffect(() => {
        if (selectedFolios.length === 0) {
            setCanSell(false);
            setTransactionType("BUY");
            return;
        }

        const allEntriesValid = selectedFolios.every(folioId => {
            const entriesMatchingFolio = allFolioEntries.filter(folioEntry => folioEntry.folio.folioId === folioId);
            if (entriesMatchingFolio.length === 0) return false;

            const matchingEntry = entriesMatchingFolio.find(folioEntry => folioEntry.coinId === persistedItem?.id);
            return matchingEntry && matchingEntry.quantity > 0;
        });

        if (!allEntriesValid && persistedItem) {
            setCanSell(false);
            if (transactionType === "SELL") {
                setTransactionType("BUY");
                Toast.show(`A selected folio has no ${persistedItem?.name} to sell.`, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                });
            }
            return;
        }

        setCanSell(true);
    }, [allFolioEntries, selectedFolios, persistedItem]);

    useEffect(() => {
        if (transactionType === "SELL") {
            let minQuantity = Infinity;
            allFolioEntries.forEach((folioEntry) => {
                if (folioEntry.coinId === persistedItem?.id && selectedFolios.includes(folioEntry.folio.folioId)) {
                    if (folioEntry.quantity < minQuantity) {
                        minQuantity = folioEntry.quantity;
                    }
                }
            });
            if (Number(total) > minQuantity) {
                setTotal(minQuantity.toString());
                Toast.show(`Sell Total is limited to your ${persistedItem?.name} quantity. `, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                });
            }
        }

    }, [allFolioEntries, selectedFolios, transactionType, total, persistedItem]);


    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 30, height: 30, marginRight: 10 }}>
                        <SvgCssUri
                            width={30}
                            height={30}
                            uri={persistedItem?.image ?? ''}
                            onError={() => console.error("Error loading image", persistedItem?.image)}
                        />
                    </View>
                    <Text style={{ color: 'white', fontSize: 18 }}>{persistedItem?.name}</Text>
                </View>
            ),
        });
    }, [navigation, persistedItem]);

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
        setTotal(Infinity.toString());
    };

    const addTransactions = (db: SQLiteDatabase, transactions: UserTransaction[]) => {
        setIsLoading(true);
        addBatchTransactionData(db, transactions)
            .then(() => {
                Toast.show(`Added ${persistedItem?.name} transaction to ${getNamesOfSelectedFolios().join(", ")}. `, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                });
                const lastTransaction = transactions.length > 0 ? transactions[transactions.length - 1] : null;
                dispatch(setLastTransaction(lastTransaction));
                dispatch(setCurrentlySelectedFolio(folios.find(folio => folio.folioId === selectedFolios[0]) ?? null));
                navigation.navigate("pages/coinGraph/coinGraphScreen", { coinId: persistedItem?.id });
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setIsLoading(false);
            });
    };

    const editTransactions = (db: SQLiteDatabase, newTransactions: UserTransaction[]) => {
        if (transactionToEdit) {
            setIsLoading(true);
            deleteTransactionById(db, transactionToEdit?.id)
                .then(() => addBatchTransactionData(db, newTransactions))
                .then(() => {
                    dispatch(deleteTransactionByIdSlice(transactionToEdit?.id));
                    newTransactions.forEach(newTransaction => {
                        dispatch(addTransactionSlice(newTransaction));
                    });
                })
                .then(() => {
                    Toast.show(`Saved edits to ${persistedItem?.name} transaction.`, {
                        backgroundColor: "hsl(0, 0%, 15%)",
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                    });
                    const lastTransaction = newTransactions.length > 0 ? newTransactions[newTransactions.length - 1] : null;
                    dispatch(setLastTransaction(lastTransaction));
                    setIsLoading(false);
                    navigation.navigate("pages/coinGraph/coinGraphScreen", { coinId: persistedItem?.id });
                })
                .catch(error => {
                    console.error('Error:', error);
                    setIsLoading(false);
                });
        }
    };

    const handleTotalInputChange = (text: string) => {
        // Regular expression to match positive floating point numbers or a single decimal point
        const regex = /^(?:\d*\.?\d*)$/;
        if (regex.test(text)) {
            setTotal(text);
        }
    };

    const getNamesOfSelectedFolios = () => {
        return selectedFolios.map(folio => folios.find(folioItem => folioItem.folioId === folio)?.folioName ?? '');
    };

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
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
                                value={total}
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
                            <Text>{' '}{persistedItem?.symbol.toUpperCase()}</Text>
                            {transactionType === "SELL" &&
                                <TouchableHighlight
                                    onPress={() => sellAll()}
                                >
                                    <Text style={{ color: 'red', paddingLeft: 10 }}>
                                        ALL
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
                                data={folios}
                                labelField="folioName"
                                valueField="folioId"
                                search
                                searchField="folioName"
                                value={selectedFolios}
                                searchPlaceholder="Search..."
                                onFocus={() => {
                                    if (folios.length === 0) {
                                        Toast.show(`Use the + button to add a new empty folio. `, {
                                            backgroundColor: "hsl(0, 0%, 15%)",
                                            duration: Toast.durations.LONG,
                                        });
                                    }
                                }}
                                onChange={(folios) => {
                                    if(folios.length > 0){
                                        setSelectedFolios(folios);
                                    }
                                }}
                                visibleSelectedItem={false}
                                renderItem={(folio) => {
                                    return (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                                            <Text style={[{ height: 60, paddingLeft: 15, textAlignVertical: 'center' }]}>
                                                {folio.folioName}
                                            </Text>
                                            <ScrollView
                                                horizontal
                                                fadingEdgeLength={25}
                                                contentContainerStyle={styles.row}
                                                showsHorizontalScrollIndicator={false}
                                            >
                                                {getFolioCoinImages(folio.folioId, allFolioEntries).map((image, index) => {
                                                    return (
                                                        <View key={index} style={{ paddingLeft: 10, backgroundColor: 'transparent' }}>
                                                            <View style={{ width: 20, height: 20, backgroundColor: 'transparent' }}>
                                                                <SvgCssUri
                                                                    width={20}
                                                                    height={20}
                                                                    uri={image}
                                                                    onError={() => console.error("Error loading image", image)}
                                                                />
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    );
                                }}
                            >
                            </MultiSelect>
                            <TouchableHighlight
                                onPress={showModal}
                            >
                                <MaterialIcons style={styles.iconStyle} color="white" name="add-circle" size={20} />
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
                {folios.length > 0 && selectedFolios.length > 0 && (
                    <View style={styles.tableContainer}>
                        <ScrollView horizontal contentContainerStyle={styles.row}>
                            {selectedFolios.map(folio => (
                                <TouchableOpacity key={folio} onPress={() => {
                                    setSelectedFolios(prevSelected => prevSelected.filter(selectedItem => selectedItem !== folio));
                                }}>
                                    <View style={styles.selectedStyle}>
                                        <Text>{folios.find(folioItem => folioItem.folioId === folio)?.folioName ?? ''}</Text>
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
                    style={[styles.bigButton, selectedFolios.length === 0 || Number(total) === 0 ? { opacity: 0.5 } : { opacity: 1 }]}
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

                        if (Number(total) === 0) {
                            Toast.show(`Total must be greater than 0. `, {
                                backgroundColor: "hsl(0, 0%, 15%)",
                                duration: Toast.durations.LONG,
                            });
                            return;
                        }

                        const newTransactions: UserTransaction[] = selectedFolios.map(folio => {
                            const decimalTotal = new Decimal(total).toNumber();
                            return {
                                id: randomUUID(),
                                coinId: persistedItem?.id ?? '',
                                date: date.toISOString(),
                                quantity: decimalTotal,
                                type: transactionType,
                                folioId: folio,
                            };
                        });
                        transactionToEdit ? editTransactions(db, newTransactions) : addTransactions(db, newTransactions)
                    }}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={"white"} />
                    ) : (
                        transactionToEdit ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'
                    )}
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
                <FolioCreationModal
                    db={db}
                    visible={isModalVisible}
                    setVisible={setIsModalVisible}
                    onNewFolio={(folio) => {
                        setSelectedFolios([...selectedFolios, folio.folioId]);
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
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
        width: 210,
    },
    dropdownContainer: {
        backgroundColor: "black",
        borderWidth: 0,
        borderRadius: 5,
        padding: 5,
    },
    dropdownItemContainer: {
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