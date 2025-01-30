import * as React from "react";
import {
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FolioEntry } from "@/app/models/FolioEntry";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { useNavigation } from "expo-router";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { CoinsMarkets } from "@/app/models/CoinsMarkets";
import { Button } from "react-native-paper";

interface CoinHoldingsPanelProps {
    folioEntry?: FolioEntry;
    coinMarket: CoinsMarkets;
}

export const CoinHoldingsPanel: React.FC<CoinHoldingsPanelProps> = ({
    folioEntry,
    coinMarket
}: CoinHoldingsPanelProps) => {

    const navigation = useNavigation();
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
    const currentFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);

    return (
        <View style={styles.infoContainer}>
            <View style={[styles.holdingsContainer, { borderColor: coinMarket?.color }]}>
                <View style={{ justifyContent: "center", alignContent: "center" }}>
                    <Text style={[styles.smallText, {
                        color: 'white',
                    }]}>
                        {currentFolio?.folioName || ''}
                    </Text>
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
});