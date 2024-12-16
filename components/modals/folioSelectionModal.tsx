import { Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { Button, DataTable, Modal, PaperProvider, Portal } from "react-native-paper";
import { SQLiteDatabase } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { RootState } from "@/app/store/store";
import { setCurrentlySelectedFolio } from "@/app/slices/currentlySelectedFolioSlice";
import { Folio } from "@/app/models/Folio";
import { Image } from "expo-image";
import { getFolioCoinImages } from "@/app/helpers/folioHelpers";
import FolioCreationModal from "./folioCreationModal";

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

    const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
    const folios = useSelector((state: RootState) => state.folios.folios);
    const currentFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
    const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);

    const hideModal = () => setVisible(false);

    const showCreationModal = () => setIsCreationModalVisible(true);

    const ROW_HEIGHT = 50;

    const getTotalFolioValue = (folio: Folio) => {
        let folioValue = 0;

        allFolioEntries.forEach((folioEntry) => {
            if (folioEntry.folio.folioId === folio.folioId) {
                folioValue += folioEntry.currentPrice * folioEntry.quantity;
            }
        });

        return folioValue;
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <ScrollView
                    fadingEdgeLength={5}
                    removeClippedSubviews={true}
                >
                    <PaperProvider>
                        <DataTable>
                            <DataTable.Header style={[{ borderColor: "rgba(255, 255, 255, 0.2)", borderBottomWidth: .5 }]}>
                                <DataTable.Title>
                                    <Text style={styles.mainDataTableTitle}>
                                        Folio
                                    </Text>
                                </DataTable.Title>
                                <DataTable.Title >
                                    <Text>
                                    </Text>
                                </DataTable.Title>
                                <DataTable.Title numeric>
                                    <TouchableOpacity onPress={hideModal}>
                                        <MaterialIcons color="white" name="cancel" size={20} />
                                    </TouchableOpacity>
                                </DataTable.Title>
                            </DataTable.Header>

                            {folios?.map((folio) => {
                                return (
                                    <DataTable.Row
                                        onPress={() => {
                                            dispatch(setCurrentlySelectedFolio(folio));
                                            hideModal();
                                        }}
                                        key={folio?.folioId}
                                        style={[currentFolio?.folioId == folio?.folioId
                                            ? { borderLeftColor: "white", borderLeftWidth: 5, borderTopLeftRadius: 2, borderBottomLeftRadius: 2, borderBottomColor: "rgba(255, 255, 255, 0.125)" }
                                            : { borderBottomColor: "rgba(255, 255, 255, 0.2)" }, { height: ROW_HEIGHT }]
                                        }
                                    >
                                        <DataTable.Cell style={{ flex: 1 }}>
                                            <View style={styles.column}>
                                                <Text style={[styles.leftAlign, styles.normal]}>
                                                    {folio?.folioName}
                                                </Text>
                                                <Text style={[styles.leftAlign, styles.light]}>
                                                    {convertToCurrencyFormat(getTotalFolioValue(folio), currencyType, false, true)}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell style={{ flex: 2 }}>
                                            <ScrollView
                                                horizontal
                                                fadingEdgeLength={25}
                                                contentContainerStyle={styles.row}
                                                showsHorizontalScrollIndicator={false}
                                            >
                                                {getFolioCoinImages(folio.folioId, allFolioEntries).map((image, index) => {
                                                    return (
                                                        <View key={index} style={{ paddingLeft: 10, backgroundColor: 'transparent' }}>
                                                            <Image
                                                                source={image}
                                                                style={{ width: 20, height: 20 }}
                                                                transition={100}
                                                                cachePolicy={'disk'}
                                                                priority={'high'}
                                                                contentPosition={'center'}
                                                                contentFit="cover"
                                                            />
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <MaterialIcons style={{
                                                color: "rgba(255, 255, 255, 0.8)",
                                            }} name="settings" size={20} />
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                );
                            })}
                        </DataTable>
                        <Button
                            buttonColor="black"
                            textColor={"white"}
                            rippleColor="white"
                            style={styles.bigButton}
                            compact
                            mode="contained"
                            onPress={showCreationModal}>
                            <MaterialIcons style={{
                                color: "white",
                            }} name="add-circle" size={20} />
                        </Button>
                    </PaperProvider>
                </ScrollView >
            </Modal>
            <FolioCreationModal
                db={db}
                visible={isCreationModalVisible}
                setVisible={setIsCreationModalVisible}
                onNewFolio={(folio) => {
                    dispatch(setCurrentlySelectedFolio(folio));
                }}
            />
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'black',
        margin: 20,
        borderRadius: 5,
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
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
    },
});