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

interface CoinStatsPanelProps {
    folioEntry: FolioEntry;
}

export const CoinStatsPanel: React.FC<CoinStatsPanelProps> = ({
    folioEntry
}: CoinStatsPanelProps) => {

    const navigation = useNavigation();
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

    return (
        <View style={styles.infoContainer}>
            <Text style={styles.statsTitle}>
                Holdings
            </Text>
            <View style={[styles.holdingsContainer]}>
                <View>
                    <Text style={styles.bigText}>
                        {convertToCurrencyFormat(folioEntry.currentPrice * folioEntry.quantity, currencyType, false)}
                    </Text>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        {folioEntry.quantity} {folioEntry.ticker.toUpperCase()}
                    </Text>
                </View>
                <TouchableOpacity
                    style={{ justifyContent: "center", alignContent: "center" }}
                /* onPress={() => setShowDatePicker(true)} */
                >
                    <MaterialIcons name="add-card" color={"white"} size={40} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.statsTitle, { marginTop: 20 }]}>
                Stats
            </Text>
            <View style={[styles.statsContainer]}>
                <View style={styles.statsRow}>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        Rank
                    </Text>
                    <Text style={styles.bigText}>
                        #{folioEntry.ranking}
                    </Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        Market Cap
                    </Text>
                    <Text style={styles.bigText}>
                        {convertToCurrencyFormat(folioEntry.marketCap, currencyType, false)}
                    </Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={[styles.smallText, {
                        color: 'hsl(0, 0%, 80%)',
                    }]}>
                        Fully Diluted Valuation
                    </Text>
                    <Text style={styles.bigText}>
                        {convertToCurrencyFormat(folioEntry.fullyDilutedValuation, currencyType, false)}
                    </Text>
                </View>
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
        //borderBottomWidth: 2,
        borderColor: 'white',
        marginBottom: 10,
        width: 80,
        textAlign: 'center',
        borderRadius: 5
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