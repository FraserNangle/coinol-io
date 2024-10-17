import * as React from "react";
import { DataTable, PaperProvider } from "react-native-paper";
import {
    StyleSheet,
    Text,
    View,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";
import { UserTransaction } from "@/app/models/UserTransaction";
import { ScrollView } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface TransactionHistoryTableProps {
    data: UserTransaction[];
}

const numberFormatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumSignificantDigits: 15,
    useGrouping: true,
});

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = (props: TransactionHistoryTableProps) => {
    type SortField = "date" | "quantity" | "type";

    const [sortField, setSortField] = React.useState<SortField>("date");
    const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

    const styles = getStyles();

    const sortedData = React.useMemo(() => {
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

    return (
        <PaperProvider>
            <ScrollView>
                <DataTable>
                    <DataTable.Header style={[{ borderColor: "rgba(255, 255, 255, 0.2)", borderBottomWidth: .5 }]}>
                        <DataTable.Title onPress={() => handleSort("date")}>
                            <Text style={styles.mainDataTableTitle}>
                                History{getSortIndicator("date")}
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title numeric onPress={() => handleSort("quantity")}>
                            <Text style={styles.dataTableTitle}>
                                Quantity{getSortIndicator("quantity")}
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title numeric onPress={() => handleSort("type")}>
                            <Text style={styles.dataTableTitle}>
                                Type{getSortIndicator("type")}
                            </Text>
                        </DataTable.Title>
                    </DataTable.Header>

                    {sortedData.map((userTransactionEntry) => {
                        return (
                            <DataTable.Row
                                key={userTransactionEntry?.id}
                                style={styles.row}
                            >
                                <DataTable.Cell>
                                    <View style={styles.column}>
                                        <Text style={[styles.leftAlign, styles.bold]}>
                                            {new Date(userTransactionEntry.date).toLocaleDateString()}
                                        </Text>
                                        <Text style={[styles.leftAlign, styles.light]}>
                                            {new Date(userTransactionEntry.date).toLocaleTimeString()}
                                        </Text>
                                    </View>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text style={styles.normal}>
                                        {numberFormatter.format(userTransactionEntry.quantity)}
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <MaterialIcons style={{
                                        color: userTransactionEntry.type === "BUY" ? "#00ff00" : "red",
                                    }} name={userTransactionEntry.type === "BUY" ? "add-circle" : "remove-circle"} size={30} />
                                </DataTable.Cell>
                            </DataTable.Row>
                        );
                    })}
                </DataTable>
            </ScrollView>
        </PaperProvider>
    );
};

const getStyles = () =>
    StyleSheet.create({
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
        },
        row: {
            flexDirection: "row",
            borderColor: "rgba(255, 255, 255, 0.2)",
        },
    });