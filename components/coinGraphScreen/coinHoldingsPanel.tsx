import * as React from "react";
import {
    StyleSheet,
} from "react-native";
import { View, Text } from "@/components/Themed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FolioEntry } from "@/app/models/FolioEntry";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { useNavigation } from "expo-router";
import { RootState } from "@/app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { CoinsMarkets } from "@/app/models/CoinsMarkets";
import { Button } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { setCurrentlySelectedFolio } from "@/app/slices/currentlySelectedFolioSlice";
import { useEffect, useState } from "react";

interface CoinHoldingsPanelProps {
    coinMarket: CoinsMarkets;
}

export const CoinHoldingsPanel: React.FC<CoinHoldingsPanelProps> = ({
    coinMarket
}: CoinHoldingsPanelProps) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
    const currentFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);
    const folios = useSelector((state: RootState) => state.folios.folios) || [];
    const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];

    const [folioEntry, setFolioEntry] = useState<FolioEntry>();

    useEffect(() => {
        setFolioEntry(allFolioEntries.find((folioEntry) => folioEntry.coinId === coinMarket.id && folioEntry.folio.folioId === currentFolio?.folioId));
    }, [allFolioEntries, coinMarket, currentFolio]);

    return (
        <View style={styles.infoContainer}>
            <View style={[styles.holdingsContainer, { borderColor: coinMarket?.color }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Dropdown
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        activeColor="rgba(255, 255, 255, 0.15)"
                        itemContainerStyle={styles.dropdownItemContainer}
                        iconStyle={styles.iconStyle}
                        selectedTextProps={{ style: styles.smallText }}
                        inputSearchStyle={styles.inputSearchStyle}
                        placeholder={folios.length > 0 ? 'Select a folio' : 'No Folios'}
                        data={folios}
                        labelField="folioName"
                        valueField="folioId"
                        search
                        searchField="folioName"
                        value={currentFolio}
                        searchPlaceholder="Search..."
                        onChange={(folio) => {
                            dispatch(setCurrentlySelectedFolio(folio));
                        }}
                        renderItem={(folio) => {
                            return (
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                                    <Text style={[{ height: 50, paddingLeft: 15, textAlignVertical: 'center' }]}>
                                        {folio.folioName}
                                    </Text>
                                </View>
                            );
                        }}
                    >
                    </Dropdown>
                </View>
                <View>
                    <Text style={[styles.bigText]}>
                        {folioEntry ? convertToCurrencyFormat(coinMarket.current_price * folioEntry.quantity, currencyType, false, true) : convertToCurrencyFormat(0, currencyType, false, true)}
                    </Text>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        {folioEntry ? folioEntry.quantity : 0} {coinMarket.symbol.toUpperCase()}
                    </Text>
                </View>
            </View>
            <Button
                buttonColor="black"
                textColor={"white"}
                rippleColor={coinMarket.color}
                style={[styles.bigButton, { borderColor: coinMarket.color }]}
                compact
                mode="contained"
                onPress={() =>
                    navigation.navigate("pages/addTransaction/transactionScreen",
                        {
                            item: {
                                id: coinMarket.id,
                                symbol: coinMarket.symbol,
                                name: coinMarket.name,
                                image: coinMarket.image,
                            }
                        })
                }>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="add-circle" color={coinMarket.color} size={20} />
                    <Text style={{ color: 'white', fontSize: 14 }}> ADD TRANSACTION</Text>
                </View>
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    infoContainer: {
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        width: "90%",
        paddingBottom: 10,
    },
    holdingsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    bigText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    smallText: {
        color: "white",
        textAlign: "right",
        textAlignVertical: "center",
    },
    bigButton: {
        width: "100%",
        borderRadius: 5,
        borderWidth: 1,
    },
    dropdown: {
        width: 150,
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
    iconStyle: {
        width: 20,
        height: 20,
        marginLeft: 5,
    },
    inputSearchStyle: {
        backgroundColor: "transparent",
        color: "white",
        borderWidth: 0,
        height: 40,
        paddingVertical: 0,
        marginVertical: 0,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 20,
        padding: 0,
    },
});