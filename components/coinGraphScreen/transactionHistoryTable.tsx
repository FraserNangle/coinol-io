import * as React from "react";
import { DataTable, Divider, Menu, PaperProvider, Portal } from "react-native-paper";
import {
    StyleSheet,
    Text,
    View,
    LayoutAnimation,
    UIManager,
    Platform,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import { UserTransaction } from "@/app/models/UserTransaction";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { numberFormatter } from "@/app/utils/numberFormatter";
import { useMemo, useState } from "react";
import { SQLiteDatabase } from "expo-sqlite";
import TransactionDeletionModal from "../modals/transaction/transactionDeletionModal";
import { useNavigation } from "expo-router";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface TransactionHistoryTableProps {
    data: UserTransaction[];
    db: SQLiteDatabase;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = (props: TransactionHistoryTableProps) => {
    const navigation = useNavigation();

    const folios = useSelector((state: RootState) => state.folios.folios) || [];

    type SortField = "date" | "quantity" | "folio" | "type";

    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isTransactionSettingsMenuVisible, setIsTransactionSettingsMenuVisible] = useState(false);
    const [isAllTransactionSettingsMenuVisible, setIsAllTransactionSettingsMenuVisible] = useState(false);
    const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false);
    const [deleteAll, setDeleteAll] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })
    const [menuTransaction, setMenuTransaction] = useState<UserTransaction>()

    const openTransactionSettingsMenu = (event: GestureResponderEvent, all: boolean = false) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setMenuAnchor(anchor);
        if (all) {
            setIsAllTransactionSettingsMenuVisible(true)
        } else {
            setIsTransactionSettingsMenuVisible(true)
        }
    };

    const closeTransactionSettingsMenu = () => setIsTransactionSettingsMenuVisible(false);
    const closeAllTransactionSettingsMenu = () => setIsAllTransactionSettingsMenuVisible(false);

    const showDeletionModal = () => {
        closeTransactionSettingsMenu();
        setIsDeletionModalVisible(true)
    };

    const handleOpenTransactionEditScreen = () => {
        closeTransactionSettingsMenu();
        navigation.navigate("pages/addTransaction/transactionScreen", { transactionToEdit: menuTransaction });
    };

    const sortedData = useMemo(() => {
        return [...props.data].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "date": {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    comparison = dateA.getTime() - dateB.getTime();
                    break;
                }
                case "quantity":
                    comparison = a.quantity - b.quantity;
                    break;
                case "folio":
                    comparison = a.folioId.localeCompare(b.folioId);
                    break;
                case "type":
                    comparison = a.type.localeCompare(b.type);
                    break;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [props.data, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIndicator = (
        field: SortField
    ) => {
        if (sortField !== field) {
            return "";
        }

        return sortOrder === "asc" ? " ↓" : " ↑";
    };

    const getNameOfFolio = (folioId: string) => {
        return folios.find(folioItem => folioItem.folioId === folioId)?.folioName ?? '';
    };

    return (
        <>
            <PaperProvider>
                <DataTable>
                    <DataTable.Header style={[{ borderColor: "rgba(255, 255, 255, 0.2)", borderBottomWidth: .5, paddingRight: 0 }]}>
                        <DataTable.Title onPress={() => handleSort("date")}>
                            <Text style={styles.mainDataTableTitle}>
                                Date{getSortIndicator("date")}
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title numeric style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => handleSort("quantity")}>
                            <Text style={styles.dataTableTitle}>
                                Quantity{getSortIndicator("quantity")}
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title onPress={() => handleSort("folio")}>
                            <Text style={styles.dataTableTitle}>
                                Folio{getSortIndicator("folio")}
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title numeric style={{ flex: .5, justifyContent: 'center', alignItems: 'center' }} onPress={() => handleSort("type")}>
                            <Text style={styles.dataTableTitle}>
                                Type{getSortIndicator("type")}
                            </Text>
                        </DataTable.Title>
                        <TouchableOpacity
                            style={{ flex: .35, justifyContent: 'center', alignItems: 'center' }}
                            onPress={(event) => {
                                openTransactionSettingsMenu(event, true);
                            }}>
                            <DataTable.Cell numeric>
                                <MaterialIcons style={{
                                    color: "rgba(255, 255, 255, 0.8)"
                                }} name="more-horiz" size={20} />
                            </DataTable.Cell>
                        </TouchableOpacity>
                    </DataTable.Header>

                    {sortedData.map((userTransactionEntry) => {
                        return (
                            <DataTable.Row
                                key={userTransactionEntry?.id}
                                style={styles.row}
                            >
                                <DataTable.Cell>
                                    <View style={styles.column}>
                                        <Text style={[styles.leftAlign, styles.normal]}>
                                            {new Date(userTransactionEntry.date).toLocaleDateString()}
                                        </Text>
                                        <Text style={[styles.leftAlign, styles.light]}>
                                            {new Date(userTransactionEntry.date).toLocaleTimeString()}
                                        </Text>
                                    </View>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text style={styles.normal}>
                                        {numberFormatter(userTransactionEntry.quantity)}
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text style={[styles.normal]} numberOfLines={1} ellipsizeMode="middle">
                                        {getNameOfFolio(userTransactionEntry.folioId)}
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <MaterialIcons style={{
                                        color: userTransactionEntry.type === "BUY" ? "#00ff00" : "red", flex: .5, justifyContent: 'center', alignItems: 'center'
                                    }} name={userTransactionEntry.type === "BUY" ? "add-circle-outline" : "remove-circle-outline"} size={30} />
                                </DataTable.Cell>
                                <TouchableOpacity
                                    style={{ flex: .35, paddingRight: 12.5, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={(event) => {
                                        setMenuTransaction(userTransactionEntry);
                                        openTransactionSettingsMenu(event);
                                    }}>
                                    <DataTable.Cell numeric>
                                        <MaterialIcons style={{
                                            color: "rgba(255, 255, 255, 0.8)"
                                        }} name="more-horiz" size={20} />
                                    </DataTable.Cell>
                                </TouchableOpacity>
                            </DataTable.Row>
                        );
                    })}
                </DataTable>
            </PaperProvider>
            <TransactionDeletionModal
                db={props.db}
                visible={isDeletionModalVisible}
                setVisible={setIsDeletionModalVisible}
                transactionToDelete={menuTransaction ?? props.data[0]}
                deleteAllTransactions={deleteAll}
            />
            <Menu
                style={{ backgroundColor: 'transparent', width: 120, borderRadius: 5, borderColor: "rgba(255, 255, 255, .3)" }}
                contentStyle={{ backgroundColor: 'black', borderWidth: 1, borderColor: "rgba(255, 255, 255, .2)", paddingVertical: 0 }}
                visible={isTransactionSettingsMenuVisible}
                onDismiss={closeTransactionSettingsMenu}
                anchor={menuAnchor}>
                <Menu.Item onPress={handleOpenTransactionEditScreen} title="Edit" />
                <Divider />
                <Menu.Item titleStyle={{ color: 'red' }} onPress={() => {
                    setDeleteAll(false);
                    showDeletionModal();
                }} title="Delete" />
            </Menu>
            <Menu
                style={{ backgroundColor: 'transparent', width: 120, borderRadius: 5, borderColor: "rgba(255, 255, 255, .3)" }}
                contentStyle={{ backgroundColor: 'black', borderWidth: 1, borderColor: "rgba(255, 255, 255, .2)", paddingVertical: 0 }}
                visible={isAllTransactionSettingsMenuVisible}
                onDismiss={closeAllTransactionSettingsMenu}
                anchor={menuAnchor}>
                <Menu.Item titleStyle={{ color: 'red' }} onPress={() => {
                    setDeleteAll(true);
                    showDeletionModal();
                }} title="Delete All" />
            </Menu>
        </>
    );
};

const styles = StyleSheet.create({
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
    mainDataTableTitle: {
        fontSize: 14,
        fontWeight: "400",
        color: "white",
    },
    dataTableTitle: {
        fontWeight: "200",
        color: "white",
        flex: 1,
    },
    positive: {
        color: "#00ff00",
    },
    negative: {
        color: "red",
    },
    rightAlign: {
        textAlign: "right",
    },
    leftAlign: {
        textAlign: "left",
    },
    column: {
        flexDirection: "column",
        flex: 1
    },
    row: {
        flexDirection: "row",
        borderColor: "rgba(255, 255, 255, 0.2)",
        paddingRight: 0,
    },
});
