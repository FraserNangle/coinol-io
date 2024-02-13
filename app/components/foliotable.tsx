import * as React from "react";
import { DataTable, PaperProvider } from "react-native-paper";
import { Coin, CoinAPI } from "../models/coinData";
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface FolioTableProps {
  data: Coin[];
  apiData: CoinAPI[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  ticker: {
    fontWeight: "200",
    color: isDarkMode ? '#fff' : '#000',
  },
  bold: {
    fontWeight: "bold",
    color: isDarkMode ? '#fff' : '#000',
  },
  normal: {
    color: isDarkMode ? '#fff' : '#000',
  },
  mainDataTableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: isDarkMode ? '#fff' : '#000',
  },
  dataTableTitle: {
    fontWeight: "200",
    color: isDarkMode ? '#fff' : '#000',
  },
  positive: {
    color: '#00ff00',
  },
  negative: {
    color: 'red',
  },
  rightAlign: {
    textAlign: 'right',
  },
  leftAlign: {
    textAlign: 'left',
  },
  column: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});

const getPriceDifferenceDisplay = (priceDifference: number) => {
  return priceDifference > 0 ? `+${priceDifference.toFixed(2)}%` : `${priceDifference.toFixed(2)}%`;
}

export const FolioTable: React.FC<FolioTableProps> = ({ data, apiData }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  return (
    <PaperProvider>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>
            <Text style={styles.mainDataTableTitle}>Coins</Text>
          </DataTable.Title>
          <DataTable.Title numeric>
            <Text style={styles.dataTableTitle}>Price (24h %)</Text>
          </DataTable.Title>
          <DataTable.Title numeric>
            <Text style={styles.dataTableTitle}>Total</Text>
          </DataTable.Title>
        </DataTable.Header>

        {data.map((item) => {
          const apiItem = apiData.find(apiItem => apiItem.name === item.name);
          const priceDifference = apiItem ? ((item.price - apiItem.price24) / apiItem.price24) * 100 : 0;
          const priceDifferenceDisplay = getPriceDifferenceDisplay(priceDifference);

          return (
            <DataTable.Row key={item.key}>
              <DataTable.Cell>
                <View style={styles.column}>
                  <View style={styles.row}>
                    <Text style={styles.ticker}>{item.name}</Text>
                    <Text style={styles.bold}>   {item.quantity}</Text>
                  </View>
                  <Text style={[styles.leftAlign, styles.bold]}>{currencyFormatter.format(item.price)}</Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={[styles.rightAlign, priceDifference > 0 ? styles.positive : styles.negative]}>{priceDifferenceDisplay}</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={[styles.bold, priceDifference > 0 ? styles.positive : styles.negative]}>
                  {currencyFormatter.format(item.quantity * item.price)}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </PaperProvider>
  );
};