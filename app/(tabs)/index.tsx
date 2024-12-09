import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { FolioTable } from "@/components/index/folioTable/foliotable";
import { Link } from "expo-router";
import { fetchUserFolio } from "../services/folioService";
import { useDispatch, useSelector } from "react-redux";
import { setTotalPortfolioPercentageChange24hr, setTotalPortfolioValue } from "../slices/totalPortfolioValueSlice";
import { setUserFolio } from "../slices/userFolioSlice";
import { RootState } from "../store/store";
import { DonutChart } from "@/components/index/donutChart/donutChart";
import { useSQLiteContext } from "expo-sqlite";
import { setCurrencyType } from "../slices/currencyTypeSlice";
import { setLastTransaction } from "../slices/lastTransactionSlice";
import { ActivityIndicator } from "react-native-paper";
import { Folio } from "../models/Folio";
import { setFolios } from "../slices/foliosSlice";

export default function TabOneScreen() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const db = useSQLiteContext();

  const dispatch = useDispatch();

  let userFolio = useSelector((state: RootState) => state.userFolio.userFolio) || [];
  let lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);
  let currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
  const refresh = useSelector((state: RootState) => state.refresh.refresh);

  const [isLoadingFolioData, setIsLoadingFolioData] = useState(true);
  const [currentFolio, setCurrentFolio] = useState<Folio>();

  const fetchUserFolioData = async () => {
    //TODO: figure out why data is not being fetched on app launch but needs 1 refresh to show
    setIsLoadingFolioData(true);
    const userData = await fetchUserFolio(db);
    setCurrentFolio(userData.foliosList.find((folio) => folio.isFavorite));
    dispatch(setFolios(userData.foliosList));
    dispatch(setUserFolio(userData.folioEntries.filter((userData) => userData.folio.folioId === currentFolio?.folioId)));
    setIsLoadingFolioData(false);
  };

  useEffect(() => {
    dispatch(setCurrencyType("USD"));
  }, []);

  useEffect(() => {
    if (refresh) {
      dispatch(setLastTransaction(null));
    }
    fetchUserFolioData();
  }, [lastTransaction, refresh]);

  useEffect(() => {
    const totalPortfolioValue = userFolio.reduce(
      (total, item) => total + item.quantity * item.currentPrice,
      0
    );
    const totalPortfolioPercentageChange24hr = userFolio.reduce(
      (sum, folioEntry) => sum + folioEntry.priceChangePercentage24h, 0
    ) / userFolio.length;
    dispatch(setTotalPortfolioValue(totalPortfolioValue));
    dispatch(setTotalPortfolioPercentageChange24hr(totalPortfolioPercentageChange24hr));
  }, [userFolio]);

  return (
    <>
      {!isLoadingFolioData &&
        userFolio.length === 0 && (
          <View style={styles.container}>
            <Link href="/plusMenu" asChild>
              <Pressable>
                {({ pressed }) => (
                  <>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      You have no holdings yet!
                    </Text>
                    <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                      Tap here to get started.
                    </Text>
                  </>
                )}
              </Pressable>
            </Link>
          </View>
        )
      }
      {
        userFolio.length > 0 && (
          <View style={styles.screenContainer}>
            {isLoadingFolioData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <>
                <View style={styles.donutContainer}>
                  <DonutChart
                    data={userFolio}
                    width={screenWidth * 0.95}
                    height={screenHeight / 2}
                    currencyTicker={currencyType} />
                </View>
                <View style={styles.tableContainer}>
                  <FolioTable data={userFolio} />
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
