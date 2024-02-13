import * as React from "react";
import { DataTable, PaperProvider } from "react-native-paper";
import { Coin, CoinAPI } from "../models/coinData";
import { StyleSheet, Text, View, useColorScheme, LayoutAnimation, UIManager, Platform } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
  const [sortField, setSortField] = React.useState<'name' | 'price' | 'total'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getStyles(isDarkMode);

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          const aApiItem = apiData.find(apiItem => apiItem.name === a.name);
          const bApiItem = apiData.find(apiItem => apiItem.name === b.name);
          const aPriceDifference = aApiItem ? ((a.price - aApiItem.price24) / aApiItem.price24) * 100 : 0;
          const bPriceDifference = bApiItem ? ((b.price - bApiItem.price24) / bApiItem.price24) * 100 : 0;
          comparison = aPriceDifference - bPriceDifference;
          break;
        case 'total':
          comparison = (a.quantity * a.price) - (b.quantity * b.price);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, apiData, sortField, sortOrder]);

  const handleSort = (field: 'name' | 'price' | 'total') => {
    // Configure the animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (field: 'name' | 'price' | 'total') => {
    if (sortField !== field) {
      return '';
    }

    return sortOrder === 'asc' ? ' ↓' : ' ↑';
  };

  return (
    <PaperProvider>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title onPress={() => handleSort('name')}>
            <Text style={styles.mainDataTableTitle}>Coins{getSortIndicator('name')}</Text>
          </DataTable.Title>
          <DataTable.Title numeric onPress={() => handleSort('price')}>
            <Text style={styles.dataTableTitle}>Price (24h %){getSortIndicator('price')}</Text>
          </DataTable.Title>
          <DataTable.Title numeric onPress={() => handleSort('total')}>
            <Text style={styles.dataTableTitle}>Total{getSortIndicator('total')}</Text>
          </DataTable.Title>
        </DataTable.Header>

        {sortedData.map((item) => {
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