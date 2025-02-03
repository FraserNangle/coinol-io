import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Animated,
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

export default function TabOneScreen() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const db = useSQLiteContext();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
  const currentFolioEntries = useSelector((state: RootState) => state.folioEntries.currentFolioEntries) || [];
  const allTransactions = useSelector((state: RootState) => state.allTransactions.transactions) || [];
  const coinsMarketsList = useSelector((state: RootState) => state.allCoinData.coinsMarketsList) || [];
  const foliosList = useSelector((state: RootState) => state.folios.folios) || [];
  const currentlySelectedFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);
  const lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);
  const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

  const [isLoadingFolioData, setIsLoadingFolioData] = useState(true);
  const [refresh, setRefresh] = useState(false);

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
      headerRight: () => (
        refreshButton(setRefresh, rotateAnim, 10)
      ),
    });
  }, [navigation]);

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
      {
        currentFolioEntries.length > 0 && (
          <View style={styles.screenContainer}>
            {isLoadingFolioData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <>
                <View style={styles.donutContainer}>
                  <DonutChart
                    data={currentFolioEntries}
                    width={screenWidth * 0.95}
                    height={screenHeight / 2}
                    currencyTicker={currencyType} />
                </View>
                <View style={styles.tableContainer}>
                  <FolioTable data={currentFolioEntries} />
                </View>
              </>
            )}
          </View>
        )
      }
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
  donutContainer: {
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
});