import * as React from "react";
import {
    StyleSheet,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import { numberFormatter } from "@/app/utils/numberFormatter";
import { CoinsMarkets } from "@/app/models/CoinsMarkets";

interface CoinStatsPanelProps {
    coinsMarkets: CoinsMarkets;
}

export const CoinStatsPanel: React.FC<CoinStatsPanelProps> = ({
    coinsMarkets
}: CoinStatsPanelProps) => {

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
            <View style={[styles.statsContainer, { borderColor: coinsMarkets.color }]}>
                {statsRow("Rank", "#" + coinsMarkets.market_cap_rank.toString())}
                {statsRow("Market Cap", convertToCurrencyFormat(coinsMarkets.market_cap, currencyType, false, true).toString())}
                {statsRow("Fully Diluted Valuation", convertToCurrencyFormat(coinsMarkets.fully_diluted_valuation, currencyType, false, true).toString())}
                {statsRow("Total Volume", convertToCurrencyFormat(coinsMarkets.total_volume, currencyType, false, true).toString())}
                {statsRow("High (24H)", convertToCurrencyFormat(coinsMarkets.high_24h, currencyType, false, true).toString())}
                {statsRow("Low (24H)", convertToCurrencyFormat(coinsMarkets.low_24h, currencyType, false, true).toString())}
                {statsRow("Circulating Supply", numberFormatter(coinsMarkets.circulating_supply))}
                {statsRow("Total Supply", numberFormatter(coinsMarkets.total_supply))}
                {statsRow("Max Supply", numberFormatter(coinsMarkets.max_supply))}
                {statsRow("All Time High", convertToCurrencyFormat(coinsMarkets.ath, currencyType, false, true).toString())}
                {percentageStatsRow("All Time High Change %", coinsMarkets.ath_change_percentage)}
                {statsRow("All Time High Date", new Date(coinsMarkets.ath_date).toDateString())}
                {statsRow("All Time Low", convertToCurrencyFormat(coinsMarkets.atl, currencyType, false, true).toString())}
                {percentageStatsRow("All Time Low Change %", coinsMarkets.atl_change_percentage)}
                {statsRow("All Time Low Date", new Date(coinsMarkets.atl_date).toDateString())}
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
        paddingVertical: 10
    },
    statsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'column',
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
});