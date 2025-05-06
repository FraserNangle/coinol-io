import { GestureResponderEvent, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { Button, DataTable, Divider, Menu, Modal, PaperProvider, Portal } from "react-native-paper";
import { SQLiteDatabase } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { RootState } from "@/app/store/store";
import { setCurrentlySelectedFolio } from "@/app/slices/currentlySelectedFolioSlice";
import { Folio } from "@/app/models/Folio";
import { getFolioCoinImages } from "@/app/helpers/folioHelpers";
import FolioCreationModal from "./folioCreationModal";
import { setFavoriteFolio } from "@/app/services/folioService";
import { setFavoriteFolioReducer } from "@/app/slices/foliosSlice";
import FolioRenamingModal from "./folioRenamingModal";
import FolioDeletionModal from "./folioDeletionModal";
import { SvgCssUri } from 'react-native-svg/css';

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
    const [isRenamingModalVisible, setIsRenamingModalVisible] = useState(false);
    const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false);
    const [isFolioSettingsMenuVisible, setIsFolioSettingsMenuVisible] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })
    const [menuFolio, setMenuFolio] = useState<Folio>()

    const hideModal = () => setVisible(false);

    const showCreationModal = () => setIsCreationModalVisible(true);
    const showRenamingModal = () => {
        closeFolioSettingsMenu();
        setIsRenamingModalVisible(true)
    };
    const showDeletionModal = () => {
        closeFolioSettingsMenu();
        setIsDeletionModalVisible(true)
    };

    const openFolioSettingsMenu = (event: GestureResponderEvent) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setMenuAnchor(anchor);
        setIsFolioSettingsMenuVisible(true)
    };

    const closeFolioSettingsMenu = () => setIsFolioSettingsMenuVisible(false);

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

    const handleSetFavoriteFolio = async (folioId: string) => {
        await setFavoriteFolio(db, folioId);
        dispatch(setFavoriteFolioReducer(folioId));
    };

    useEffect(() => {
        // if no folios are set as favorite, set the first folio as favorite
        if (folios && folios.length > 0 && !folios.some(folio => folio.isFavorite)) {
            handleSetFavoriteFolio(folios[0].folioId);
        }
    }, [folios]);

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
                                            : { borderBottomColor: "rgba(255, 255, 255, 0.2)" }, { height: ROW_HEIGHT }, { paddingRight: 0 }]
                                        }
                                    >
                                        <DataTable.Cell style={{ flex: 1.25 }}>
                                            <View style={styles.column}>
                                                <Text style={[styles.leftAlign, styles.normal]}
                                                    numberOfLines={1} ellipsizeMode="middle">
                                                    {folio?.folioName}
                                                </Text>
                                                <Text style={[styles.leftAlign, styles.light]}
                                                    numberOfLines={1} ellipsizeMode="middle">
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
                                                            <View style={{ width: 20, height: 20, backgroundColor: 'transparent' }}>
                                                                <SvgCssUri
                                                                    width={20}
                                                                    height={20}
                                                                    uri={image}
                                                                    fallback={<MaterialIcons name="data-array" size={25} color={"white"} />}
                                                                />
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </DataTable.Cell>
                                        <TouchableOpacity
                                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={(event) => {
                                                setMenuFolio(folio);
                                                openFolioSettingsMenu(event);
                                            }}>
                                            <DataTable.Cell numeric>
                                                <MaterialIcons style={{
                                                    color: "rgba(255, 255, 255, 0.8)",
                                                }} name="more-horiz" size={20} />
                                            </DataTable.Cell>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ flex: .35, paddingRight: 12.5, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                handleSetFavoriteFolio(folio.folioId)
                                            }}
                                        >
                                            <DataTable.Cell numeric>
                                                <MaterialIcons style={folio.isFavorite ? { color: "gold" } : { color: "rgba(255, 255, 255, 0.8)" }}
                                                    name={folio.isFavorite ? "star" : "star-border"} size={20} />
                                            </DataTable.Cell>
                                        </TouchableOpacity>
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
            <FolioRenamingModal
                db={db}
                visible={isRenamingModalVisible}
                setVisible={setIsRenamingModalVisible}
                folioToRename={menuFolio}
            />
            <FolioDeletionModal
                db={db}
                visible={isDeletionModalVisible}
                setVisible={setIsDeletionModalVisible}
                folioToDelete={menuFolio}
            />
            <Menu
                style={{ backgroundColor: 'transparent', width: 120, borderRadius: 5, borderColor: "rgba(255, 255, 255, .3)" }}
                contentStyle={{ backgroundColor: 'black', borderWidth: 1, borderColor: "rgba(255, 255, 255, .2)", paddingVertical: 0 }}
                visible={isFolioSettingsMenuVisible}
                onDismiss={closeFolioSettingsMenu}
                anchor={menuAnchor}>
                <Menu.Item onPress={showRenamingModal} title="Rename" />
                <Divider />
                <Menu.Item titleStyle={{ color: 'red' }} onPress={showDeletionModal} title="Delete" />
            </Menu>
        </Portal >
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
        backgroundColor: 'transparent',
    },
    bigButton: {
        width: "100%",
        borderRadius: 5,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
    },
});