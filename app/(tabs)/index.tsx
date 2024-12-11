import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { FolioTable } from "@/components/index/folioTable/foliotable";
import { Link } from "expo-router";
import { fetchUserData } from "../services/folioService";
import { useDispatch, useSelector } from "react-redux";
import { setTotalPortfolioPercentageChange24hr, setTotalPortfolioValue } from "../slices/totalPortfolioValueSlice";
import { setAllFolioEntries as setAllFolioEntries, setCurrentFolioEntries } from "../slices/folioEntriesSlice";
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

export default function TabOneScreen() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const db = useSQLiteContext();

  const dispatch = useDispatch();

  const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
  const currentFolioEntries = useSelector((state: RootState) => state.folioEntries.currentFolioEntries) || [];
  const currentlySelectedFolio = useSelector((state: RootState) => state.currentlySelectedFolio.currentfolio);
  const lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);
  const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
  const refresh = useSelector((state: RootState) => state.refresh.refresh);

  const [isLoadingFolioData, setIsLoadingFolioData] = useState(true);

  const fetchUserFolioData = async () => {
    setIsLoadingFolioData(true);
    const userData = await fetchUserData(db);
    const favoriteFolio = userData.foliosList.find((folio) => folio.isFavorite);
    if (currentlySelectedFolio === undefined) {
      dispatch(setCurrentlySelectedFolio(favoriteFolio));
    }
    dispatch(setFolios(userData.foliosList));
    dispatch(setAllFolioEntries(userData.folioEntries));
    setIsLoadingFolioData(false);
  };

  useEffect(() => {
    if (refresh) {
      dispatch(setLastTransaction(null));
    }
    fetchUserFolioData();
  }, [lastTransaction, refresh]);

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

  return (
    <>
      {!isLoadingFolioData &&
        currentFolioEntries.length === 0 && (
          <View style={styles.container}>
            <Link href="/plusMenu" asChild>
              <Pressable>
                {({ pressed }) => (
                  <>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      {allFolioEntries.length === 0 ? "You have no transactions yet!" : "The selected folio is empty!"}
                    </Text>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      {allFolioEntries.length === 0 ? (
                        "Tap here to get started."
                      ) : (
                        <>
                          Click the <MaterialIcons name="menu" size={20} /> icon to select a folio.
                        </>
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
