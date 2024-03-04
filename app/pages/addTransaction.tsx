import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";
import { CoinAPI } from "../models/coinData";
import { mockCoinAPI } from "../mocks/chartData";
import { DataTable, PaperProvider } from "react-native-paper";

export default function AddTransactionScreen() {
  return (
    <View style={styles.screenContainer}>
      <CurrenciesTable apiData={mockCoinAPI} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the screen
    backgroundColor: "black",
    paddingBottom: 20,
  },
  donutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the container
    backgroundColor: "black",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10, // Rounded rectangle
  },
  tradeButtonContainer: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: "black",
  },
});

interface CurrenciesTableProps {
  apiData: CoinAPI[];
}

export const CurrenciesTable: React.FC<CurrenciesTableProps> = ({
  apiData,
}) => {
  const styles = getStyles();

  return (
    <PaperProvider>
      <DataTable>
        {apiData.map((item) => {
          return (
            <DataTable.Row key={item.name}>
              <DataTable.Cell>
                <View style={styles.column}>
                  <View style={styles.row}>
                    <Text style={styles.ticker}>{item.name}</Text>
                  </View>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </PaperProvider>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    ticker: {
      fontWeight: "200",
      color: "#fff",
    },
    bold: {
      fontWeight: "bold",
      color: "#fff",
    },
    normal: {
      color: "#fff",
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
    },
    highlightedRow: {
      backgroundColor: "#222",
      flexDirection: "row",
    },
  });
