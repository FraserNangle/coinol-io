import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useSelector } from "react-redux";
import { convertToCurrencyFormat } from "../utils/convertToCurrencyValue";
import { getPercentageChangeDisplayNoSymbol } from "../utils/getPercentageChange";
import { RootState } from "../store/store";
import FolioSelectionModal from "@/components/modals/folio/folioSelectionModal";
import { useSQLiteContext } from "expo-sqlite";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: Readonly<{
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  size?: number;
}>) {
  return <MaterialIcons size={28} {...props} />;
}

export default function TabLayout() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);

  const db = useSQLiteContext();

  const totalPortfolioValue = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioValue
  );

  const totalPortfolioPercentageChange24hr = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioPercentageChange24hr
  );
  const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

  const formattedTotalPortfolioValue = convertToCurrencyFormat(totalPortfolioValue, currencyType, true, true);

  return (
    <Tabs
      screenOptions={{
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: "black",
        },
        headerTitleAlign: "center",
        tabBarActiveTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Portfolio",
          tabBarActiveBackgroundColor: "black",
          tabBarInactiveBackgroundColor: "black",
          headerStyle: { backgroundColor: 'black' },
          headerTitleAlign: 'center',
          tabBarLabel: () => null,
          headerLeft: () => (
            <>
              <TouchableOpacity
                onPress={showModal}
              >
                <MaterialIcons style={[{ justifyContent: 'center', paddingStart: 10, color: "white" }]} name="menu" size={30} />
              </TouchableOpacity>
              <FolioSelectionModal
                db={db}
                visible={isModalVisible}
                setVisible={setIsModalVisible}
              />
            </>
          ),
          headerTitle: () => (
            <View style={styles.titleContainer}>
              {totalPortfolioValue > 0 && (
                <>
                  <Text style={styles.headerTitle}>
                    {formattedTotalPortfolioValue}
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="data-usage" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plusMenu"
        options={{
          headerShown: false,
          tabBarActiveBackgroundColor: "black",
          tabBarInactiveBackgroundColor: "black",
          headerTitle: () => null,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="add-circle" color={color} size={40} />
          ),
          tabBarIconStyle: { justifyContent: "center", alignItems: "center", flex: 1, textAlign: "center", textAlignVertical: "center" },
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          tabBarActiveBackgroundColor: "black",
          tabBarInactiveBackgroundColor: "black",
          tabBarLabel: () => null,
          tabBarShowLabel: true,
          headerTitle: () => (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                {formattedTotalPortfolioValue} ({totalPortfolioPercentageChange24hr}%)
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
