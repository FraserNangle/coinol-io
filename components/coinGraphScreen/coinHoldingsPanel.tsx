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

    return (
        <View style={styles.infoContainer}>
            <View style={[styles.holdingsContainer, { borderColor: coinMarket?.color }]}>
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
                <TouchableOpacity
                    style={{ justifyContent: "center", alignContent: "center" }}
                    onPress={() =>
                        navigation.navigate("pages/addTransaction/addTransactionScreen",
                            {
                                item: {
                                    id: coinMarket.id,
                                    symbol: coinMarket.symbol,
                                    name: coinMarket.name,
                                    image: coinMarket.image,
                                }
                            })
                    }
                >
                    <MaterialIcons name="add-card" color={coinMarket.color} size={40} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoContainer: {
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        width: "90%",
    },
    holdingsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderBottomWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    bigText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    smallText: {
        color: "white",
        textAlign: "left",
        textAlignVertical: "center",
    },
});