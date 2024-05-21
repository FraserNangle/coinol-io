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

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FolioTableProps {
  data: FolioEntry[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const getPriceDifferenceDisplay = (priceDifference: number) => {
  return priceDifference > 0
    ? `+${priceDifference.toFixed(2)}%`
    : `${priceDifference.toFixed(2)}%`;
};

export const FolioTable: React.FC<FolioTableProps> = ({ data }) => {
  type SortField = "ticker" | "price" | "total";

  const [sortField, setSortField] = React.useState<SortField>("total");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const selectedSection = useSelector(
    (state: any) => state.selectedSlice.value
  );

  const styles = getStyles();

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "ticker":
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case "price": {
          comparison = a.currentPrice - b.currentPrice;
          break;
        }
        case "total": {
          comparison = a.quantity * a.currentPrice - b.quantity * b.currentPrice;
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

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
        <DataTable.Header>
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

        {sortedData.map((item) => {
          const priceDifference = item
            ? ((item.currentPrice - item.price24h) / item.price24h) * 100
            : 0;
          const priceDifferenceDisplay =
            getPriceDifferenceDisplay(priceDifference);

          return (
            <DataTable.Row
              key={item.coinId}
              style={
                selectedSection?.name == item?.name
                  ? styles.highlightedRow
                  : styles.row
              }
            >
              <DataTable.Cell>
                <View style={styles.column}>
                  <View style={styles.row}>
                    <Text style={styles.ticker}>{item.ticker}</Text>
                    <Text style={styles.bold}> {item.quantity}</Text>
                  </View>
                  <Text style={[styles.leftAlign, styles.bold]}>
                    {currencyFormatter.format(item.currentPrice)}
                  </Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text
                  style={[
                    styles.rightAlign,
                    priceDifference > 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {priceDifferenceDisplay}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text
                  style={
                    styles.normal /* [
                    styles.bold,
                    priceDifference > 0 ? styles.positive : styles.negative,
                  ] */
                  }
                >
                  {currencyFormatter.format(item.quantity * item.currentPrice)}
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
      color: "#fff",
    },
    normal: {
      color: "#fff",
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
    },
    highlightedRow: {
      backgroundColor: "#222",
      flexDirection: "row",
    },
  });