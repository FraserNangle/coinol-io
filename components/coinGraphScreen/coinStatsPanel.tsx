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
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import { numberFormatter } from "@/app/utils/numberFormatter";

interface CoinStatsPanelProps {
    folioEntry: FolioEntry;
}

export const CoinStatsPanel: React.FC<CoinStatsPanelProps> = ({
    folioEntry
}: CoinStatsPanelProps) => {

    const navigation = useNavigation();
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

    const statsRow = (text: string, data: string) => <View style={styles.statsRow}>
        <Text style={[styles.smallText, {
            color: 'hsl(0, 0%, 80%)',
        }]}>
            {text}
        </Text>
        <Text style={[styles.bigText, { color: 'white' }]}>
            {data}
        </Text>
    </View>;

    const percentageStatsRow = (text: string, data: number) => <View style={styles.statsRow}>
        <Text style={[styles.smallText, {
            color: 'hsl(0, 0%, 80%)',
        }]}>
            {text}
        </Text>
        <Text style={[styles.bigText, { color: data >= 0 ? "#00ff00" : "red" }]}>
            {getPercentageChangeDisplay(data)}%
        </Text>
    </View>;

    return (
        <View style={styles.infoContainer}>
            <Text style={[styles.statsTitle]}>
                Holdings
            </Text>
            <View style={[styles.holdingsContainer]}>
                <View>
                    <Text style={[styles.bigText]}>
                        {convertToCurrencyFormat(folioEntry.currentPrice * folioEntry.quantity, currencyType, false, true)}
                    </Text>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        {folioEntry.quantity} {folioEntry.ticker.toUpperCase()}
                    </Text>
                </View>
                <TouchableOpacity
                    style={{ justifyContent: "center", alignContent: "center" }}
                    onPress={() =>
                        navigation.navigate("pages/addTransaction/addTransactionScreen",
                            {
                                item: {
                                    id: folioEntry.coinId,
                                    symbol: folioEntry.ticker,
                                    name: folioEntry.name
                                }
                            })
                    }
                >
                    <MaterialIcons name="add-card" color={folioEntry.color} size={40} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.statsTitle, { marginTop: 20, color: 'white' }]}>
                Stats
            </Text>
            <View style={[styles.statsContainer]}>
                {statsRow("Rank", "#" + folioEntry.ranking.toString())}
                {statsRow("Market Cap", convertToCurrencyFormat(folioEntry.marketCap, currencyType, false, true).toString())}
                {statsRow("Fully Diluted Valuation", convertToCurrencyFormat(folioEntry.fullyDilutedValuation, currencyType, false, true).toString())}
                {statsRow("Total Volume", convertToCurrencyFormat(folioEntry.totalVolume, currencyType, false, true).toString())}
                {statsRow("High (24H)", convertToCurrencyFormat(folioEntry.high24h, currencyType, false, true).toString())}
                {statsRow("Low (24H)", convertToCurrencyFormat(folioEntry.low24h, currencyType, false, true).toString())}
                {statsRow("Circulating Supply", numberFormatter(folioEntry.circulatingSupply))}
                {statsRow("Total Supply", numberFormatter(folioEntry.totalSupply))}
                {statsRow("Max Supply", numberFormatter(folioEntry.maxSupply))}
                {statsRow("All Time High", convertToCurrencyFormat(folioEntry.ath, currencyType, false, true).toString())}
                {percentageStatsRow("All Time High Change %", folioEntry.athChangePercentage)}
                {statsRow("All Time High Date", new Date(folioEntry.athDate).toDateString())}
                {statsRow("All Time Low", convertToCurrencyFormat(folioEntry.atl, currencyType, false, true).toString())}
                {percentageStatsRow("All Time Low Change %", folioEntry.atlChangePercentage)}
                {statsRow("All Time Low Date", new Date(folioEntry.atlDate).toDateString())}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "black",
    },
    buttonContainer: {
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    infoContainer: {
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        width: "90%",
        paddingVertical: 10
    },
    holdingsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 20,
        borderRadius: 5,
        borderBottomWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    statsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        padding: 20,
        borderRadius: 5,
        borderBottomWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    statsRow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1,
        marginBottom: 10,
    },
    bigText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        borderColor: 'white',
        marginBottom: 10,
        width: 80,
        textAlign: 'left',
    },
    smallText: {
        color: "white",
        textAlign: "left",
        textAlignVertical: "center",
    },
    dateLabelText: {
        color: "hsl(0, 0%, 80%)",
        textAlign: "right",
        textAlignVertical: "center",
        fontSize: 12,
    },
    infoText: {
        flex: 1,
        padding: 10,
        color: 'white',
    },
    button: {
        width: "20%",
        borderRadius: 5,
        borderWidth: 0,
        borderColor: "rgba(255, 255, 255, 1)",
    },
    tableContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "transparent",
    },
    graphContainer: {
        flex: 1,
        justifyContent: "center",
    },
    errorText: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
});