import * as React from "react";
import { DataTable, PaperProvider } from "react-native-paper";
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { FolioEntry } from "@/app/models/FolioEntry";
import { RootState } from "@/app/store/store";
import { useNavigation } from "@react-navigation/native";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { hexToRgba } from "@/app/utils/hexToRgba";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FolioTableProps {
  data: FolioEntry[];
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
});

const getPriceDifferenceDisplay = (priceDifference: number) => {
  return priceDifference > 0
    ? `+${priceDifference.toFixed(2)}%`
    : `${priceDifference.toFixed(2)}%`;
};

export const FolioTable: React.FC<FolioTableProps> = (props: FolioTableProps) => {
  type SortField = "ticker" | "price" | "total";

  const [sortField, setSortField] = React.useState<SortField>("total");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const selectedSection = useSelector(
    (state: RootState) => state.selectedSection.section
  );

  const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

  const styles = getStyles();

  const navigation = useNavigation();

  const sortedData = React.useMemo(() => {
    return [...props.data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "ticker":
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case "price": {
          comparison = a.priceChangePercentage24h - b.priceChangePercentage24h;
          break;
        }
        case "total": {
          comparison = a.quantity * a.currentPrice - b.quantity * b.currentPrice;
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [props.data, sortField, sortOrder]);

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

        {sortedData.map((folioEntry) => {
          const priceDifferenceDisplay =
            getPriceDifferenceDisplay(folioEntry.priceChangePercentage24h);
          return (
            <DataTable.Row
              onPress={() => { navigation.navigate("pages/coinGraph/coinGraphScreen", { folioEntry: folioEntry }) }}
              key={folioEntry?.coinId}
              style={[styles.row, selectedSection?.details?.coinId == folioEntry?.coinId
                ? { backgroundColor: hexToRgba(selectedSection?.details?.color, 0.15) } // Adjust alpha value here
                : { backgroundColor: "transparent" }]
              }
            >
              <DataTable.Cell>
                <View style={styles.column}>
                  <View style={styles.row}>
                    <Text style={styles.ticker}>{folioEntry.ticker.toUpperCase()}</Text>
                    <Text style={styles.bold}> {numberFormatter.format(folioEntry.quantity)}</Text>
                  </View>
                  <Text style={[styles.leftAlign, styles.normal]}>
                    {convertToCurrencyFormat(folioEntry.currentPrice, currencyType, true)}
                  </Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text
                  style={[
                    styles.rightAlign,
                    folioEntry.priceChangePercentage24h > 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {priceDifferenceDisplay}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text
                  style={
                    styles.normal
                  }
                >
                  {convertToCurrencyFormat(folioEntry.quantity * folioEntry.currentPrice, currencyType, true)}
                </Text>
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
    ticker: {
      fontWeight: "200",
      color: "#fff",
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
      color: "#fff",
    },
    dataTableTitle: {
      fontWeight: "200",
      color: "#fff",
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
      flexDirection: "column",
    },
    row: {
      flexDirection: "row",
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  });