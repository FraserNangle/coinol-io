import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { FolioTable } from "@/components/index/folioTable/foliotable";
import { Link, useNavigation } from "expo-router";
import { fetchUserData, generateFolioEntries } from "../services/folioService";
import { useDispatch, useSelector } from "react-redux";
import { setTotalPortfolioPercentageChange24hr, setTotalPortfolioValue } from "../slices/totalPortfolioValueSlice";
import { setAllFolioEntries, setCurrentFolioEntries } from "../slices/folioEntriesSlice";
import { RootState } from "../store/store";
import { DonutChart } from "@/components/index/donutChart/donutChart";
import { useSQLiteContext } from "expo-sqlite";
import { setCurrencyType } from "../slices/currencyTypeSlice";
import { setLastTransaction } from "../slices/lastTransactionSlice";
import { ActivityIndicator } from "react-native-paper";
import { setFolios } from "../slices/foliosSlice";
import { deleteAllUserDataFromLocalStorage } from "../services/sqlService";
import { setCurrentlySelectedFolio } from "../slices/currentlySelectedFolioSlice";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { setAllTransactions } from "../slices/allTransactionsSlice";
import { UserData } from "../models/UserData";
import { CoinsMarkets } from "../models/CoinsMarkets";
import { refreshButton } from "@/components/refreshButton";
import { setCoinsMarketsList } from "../slices/allCoinDataSlice";
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { LineGraph } from "@/components/coinGraphScreen/lineGraph";
import { deleteAllCoinHistoryFromLocalStorage } from "../services/coinHistoryService";
import { getPercentageChangeDisplayNoSymbol } from "../utils/getPercentageChange";
import { convertToCurrencyFormat } from "../utils/convertToCurrencyValue";


export default function TabOneScreen() {
  const adUnitId = process.env.NODE_ENV === 'development' ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-7783549357889885/7026088718';

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const db = useSQLiteContext();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef<BannerAd>(null);

  const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
  const currentFolioEntries = useSelector((state: RootState) => state.folioEntries.currentFolioEntries) || [];
  const allTransactions = useSelector((state: RootState) => state.allTransactions.transactions) || [];
  const coinsMarketsList = useSelector((state: RootState) => state.allCoinData.coinsMarketsList) || [];
  const foliosList = useSelector((state: RootState) => state.folios.folios) || [];
  const currentlySelectedFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);
  const lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);
  const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
  const totalPortfolioValue = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioValue
  );
  const totalPortfolioPercentageChange24hr = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioPercentageChange24hr
  );

  const [isLoadingFolioData, setIsLoadingFolioData] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [chart, setChart] = useState<'DONUT' | 'LINE'>('DONUT');
  const [isGraphHighlighted, setIsGraphHighlighted] = useState(false);

  const fetchData = async () => {
    setIsLoadingFolioData(true);
    const data: { userData: UserData, coinsMarketsList: CoinsMarkets[] } = await fetchUserData(db);
    const favoriteFolio = data.userData.folios.find((folio) => folio.isFavorite);
    if (currentlySelectedFolio === undefined) {
      dispatch(setCurrentlySelectedFolio(favoriteFolio));
    }
    dispatch(setFolios(data.userData.folios));
    dispatch(setCoinsMarketsList(data.coinsMarketsList));
    dispatch(setAllTransactions(data.userData.transactions));
    setIsLoadingFolioData(false);
  };

  const handleToggleChart = () => {
    setChart(chart === 'DONUT' ? 'LINE' : 'DONUT');
  };

  useEffect(() => {
    if (refresh) {
      dispatch(setLastTransaction(null));
    }
    fetchData();
  }, [lastTransaction, refresh]);

  useEffect(() => {
    const folioEntries = generateFolioEntries(allTransactions, coinsMarketsList, foliosList);
    dispatch(setAllFolioEntries(folioEntries));
  }, [allTransactions]);

  useEffect(() => {
    if (currentlySelectedFolio && currentFolioEntries) {
      dispatch(setCurrentFolioEntries(allFolioEntries.filter((folioEntry) => folioEntry.folio.folioId === currentlySelectedFolio?.folioId)));
    }
  }, [allFolioEntries, currentlySelectedFolio]);

  useEffect(() => {
    dispatch(setCurrencyType("USD"));
  }, []);

  useEffect(() => {
    const totalPortfolioValue = currentFolioEntries.reduce(
      (total, item) => total + item.quantity * item.currentPrice,
      0
    );
    const totalPortfolioPercentageChange24hr = currentFolioEntries.reduce(
      (sum, folioEntry) => sum + folioEntry.priceChangePercentage24h, 0
    ) / currentFolioEntries.length;
    dispatch(setTotalPortfolioValue(totalPortfolioValue));
    dispatch(setTotalPortfolioPercentageChange24hr(totalPortfolioPercentageChange24hr));
  }, [currentFolioEntries]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.titleContainer}>
          {totalPortfolioValue > 0 && chart === 'DONUT' && (
            <>
              <Text style={styles.headerTitle}>
                {convertToCurrencyFormat(totalPortfolioValue, currencyType, true, true)}
              </Text>

              <Text style={[styles.percentageContainer, { color: totalPortfolioPercentageChange24hr >= 0 ? "#00ff00" : "red" }]}
              >
                {getPercentageChangeDisplayNoSymbol(totalPortfolioPercentageChange24hr)}%
                <MaterialIcons style={{
                  color: totalPortfolioPercentageChange24hr >= 0 ? "#00ff00" : "red",
                }} name={totalPortfolioPercentageChange24hr >= 0 ? "arrow-drop-up" : "arrow-drop-down"} />
              </Text>
            </>
          )}
        </View>
      ),
      headerRight: () => (
        refreshButton(setRefresh, rotateAnim, 10)
      ),
    });
  }, [navigation, chart, totalPortfolioValue, totalPortfolioPercentageChange24hr, currencyType]);

  const memoizedLineGraph = useMemo(() => (
    <LineGraph
      coinsMarketsIds={currentFolioEntries.map((folioEntry) => folioEntry.coinId)}
      width={screenWidth}
      height={screenHeight / 4}
      currencyType={currencyType}
      refresh={setRefresh}
      color={'white'}
      transactions={allTransactions}
      onHighlightChange={setIsGraphHighlighted}
      totalsGraph
    />
  ), [currentFolioEntries, currencyType, screenWidth, screenHeight, refresh]);

  return (
    <>
      {!isLoadingFolioData &&
        currentFolioEntries.length === 0 && (
          <View style={styles.container}>
            <Link href="/(tabs)/searchMenu" asChild>
              <Pressable>
                {({ pressed }) => (
                  <>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      {allFolioEntries.length === 0 ? "You have no transactions yet!" : "The selected folio is empty."}
                    </Text>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      {allFolioEntries.length === 0 ? (
                        "Tap here to get started."
                      ) : (
                        <View style={[{ flexDirection: 'row', alignItems: 'center' }, { opacity: pressed ? 0.5 : 1 }]}>
                          <Text>Click here or on the </Text>
                          <MaterialIcons name="search" size={20} style={{ color: 'white' }} />
                          <Text> icon to add a transaction.</Text>
                        </View>
                      )}
                    </Text>
                  </>
                )}
              </Pressable>
            </Link>
          </View>
        )
      }
      {isLoadingFolioData &&
        currentFolioEntries.length === 0 && (
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          </View>
        )
      }
      {
        currentFolioEntries.length > 0 && (
          <View style={styles.screenContainer}>
            {isLoadingFolioData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <>
                <View style={styles.chartContainer}>
                  {chart === 'DONUT' && (
                    <DonutChart
                      data={currentFolioEntries}
                      width={screenWidth * 0.95}
                      height={screenHeight / 2}
                      currencyTicker={currencyType} />
                  )}
                  {chart === 'LINE' &&
                    memoizedLineGraph
                  }
                  {!isGraphHighlighted && (
                    <TouchableOpacity
                      style={[styles.toggleButton, { left: screenWidth - 60, bottom: screenHeight / 2 - 150 }]}
                      onPress={handleToggleChart}
                    >
                      {chart === 'DONUT' ? (
                        <MaterialIcons style={{ color: "white", textAlign: 'center' }} name="show-chart" size={30} />
                      ) : (
                        <MaterialIcons style={{ color: "white", textAlign: 'center', left: 10 }} name="data-usage" size={30} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tableContainer}>
                  <FolioTable data={currentFolioEntries} />
                </View>
              </>
            )}
          </View>
        )
      }
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "black",
  },
  tradeButtonContainer: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  toggleButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 50,
    width: 50,
    display: 'flex',
    alignContent: 'center',
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  percentageContainer: {
    marginLeft: 10,
    color: "white",
  },
});