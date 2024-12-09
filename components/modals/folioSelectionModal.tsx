import { LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager } from "react-native";
import { Text, View } from "@/components/Themed";
import React from "react";
import { DataTable, Modal, PaperProvider, Portal } from "react-native-paper";
import { SQLiteDatabase } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { numberFormatter } from "@/app/utils/numberFormatter";
import { RootState } from "@/app/store/store";

interface FolioSelectionModalProps {
    db: SQLiteDatabase;
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

export default function FolioSelectionModal({ db, visible, setVisible }: FolioSelectionModalProps) {
    // Enable LayoutAnimation on Android
    if (Platform.OS === "android") {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }
    const dispatch = useDispatch();

    const folios = useSelector((state: RootState) => state.folios.folios);
    const currentFolio = useSelector((state: RootState) => state.currentFolio.currentfolio);
    type SortField = "ticker" | "price" | "total";

    const [sortField, setSortField] = React.useState<SortField>("total");
    const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

    const hideModal = () => setVisible(false);

    const ROW_HEIGHT = 50;

    const handleSort = (field: "ticker" | "price" | "total") => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIndicator = (
        field: "ticker" | "price" | "total"
    ) => {
        if (sortField !== field) {
            return "";
        }

        return sortOrder === "asc" ? " ↓" : " ↑";
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Your Folios</Text>
                    <TouchableOpacity onPress={hideModal}>
                        <MaterialIcons color="white" name="cancel" size={20} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    fadingEdgeLength={5}
                    removeClippedSubviews={true}
                >
                    <PaperProvider>
                        <DataTable>
                            <DataTable.Header style={[{ borderColor: "rgba(255, 255, 255, 0.2)", borderBottomWidth: .5, borderTopWidth: .5 }]}>
                                <DataTable.Title onPress={() => handleSort("ticker")}>
                                    <Text style={styles.mainDataTableTitle}>
                                        Coins{getSortIndicator("ticker")}
                                    </Text>
                                </DataTable.Title>
                                <DataTable.Title numeric onPress={() => handleSort("price")}>
                                    <Text style={styles.dataTableTitle}>
                                        Price (24h %){getSortIndicator("price")}
                                    </Text>
                                </DataTable.Title>
                                <DataTable.Title numeric onPress={() => handleSort("total")}>
                                    <Text style={styles.dataTableTitle}>
                                        Total{getSortIndicator("total")}
                                    </Text>
                                </DataTable.Title>
                            </DataTable.Header>

                            {folios?.map((folio) => {
                                return (
                                    <DataTable.Row
                                        onPress={() => { }}
                                        key={folio?.folioId}
                                        style={[currentFolio?.folioId == folio?.folioId
                                            ? { borderLeftColor: "white", borderLeftWidth: 5, borderTopLeftRadius: 2, borderBottomLeftRadius: 2, borderBottomColor: "rgba(255, 255, 255, 0.125)" }
                                            : { borderBottomColor: "rgba(255, 255, 255, 0.2)" }, { height: ROW_HEIGHT }]
                                        }
                                    >
                                        <DataTable.Cell>
                                            <View style={styles.row}>
                                                <View style={{ flexDirection: 'column', alignSelf: "center", paddingRight: 15, backgroundColor: 'transparent' }}>
                                                </View>
                                                <View style={[styles.column]}>
                                                    <View style={styles.row}>
                                                        <Text style={styles.ticker}>TEST</Text>
                                                        <Text style={styles.bold}> TEST</Text>
                                                    </View>
                                                    <Text style={[styles.leftAlign, styles.normal]}>
                                                        TEST
                                                    </Text>
                                                </View>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <Text
                                                style={[
                                                    styles.rightAlign
                                                ]}
                                            >
                                                {"TEST"}
                                            </Text>
                                        </DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <Text
                                                style={
                                                    styles.normal
                                                }
                                            >
                                                TEST
                                            </Text>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                );
                            })}
                        </DataTable>
                    </PaperProvider>
                </ScrollView >
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'black',
        margin: 20,
        borderRadius: 5,
        //borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    ticker: {
        fontWeight: "200",
        color: 'white',
    },
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
        fontWeight: "bold",
        color: 'white',
    },
    dataTableTitle: {
        fontWeight: "200",
        color: 'white',
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
        textAlignVertical: "center",
        flexDirection: "column",
        backgroundColor: 'transparent'
    },
    row: {
        flexDirection: "row",
        justifyContent: 'flex-start',
        backgroundColor: 'transparent'
    },
    bigButton: {
        width: "100%",
        borderRadius: 5,
        borderWidth: 1,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
        marginTop: 10,
    },
});