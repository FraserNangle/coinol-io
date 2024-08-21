import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useSelector } from "react-redux";
import { convertToCurrencyFormat } from "../utils/convertToCurrencyValue";
import { getPercentageChangeDisplay } from "../utils/getPercentageChange";

const CURRENCY_TYPE = "USD";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: Readonly<{
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  size?: number;
}>) {
  return <MaterialIcons size={28} {...props} />;
}

export default function TabLayout() {

  const totalPortfolioValue = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioValue
  );

  const totalPortfolioPercentageChange24hr = useSelector(
    (state: any) => state?.totalPortfolioValue?.totalPortfolioPercentageChange24hr
  );

  const formattedTotalPortfolioValue = convertToCurrencyFormat(totalPortfolioValue, CURRENCY_TYPE);

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
          tabBarLabel: () => null,
          headerTitle: () => (
            <View style={styles.titleContainer}>
              {totalPortfolioValue > 0 && (
                <>
                  <Text style={styles.headerTitle}>
                    {formattedTotalPortfolioValue}
                  </Text>

                  <Text style={[
                    styles.percentageContainer,
                    totalPortfolioPercentageChange24hr > 0 ? styles.positive : styles.negative,
                  ]}
                  >
                    {getPercentageChangeDisplay(totalPortfolioPercentageChange24hr)}%
                  </Text>
                </>
              )}
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="data-usage" color={color} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="user"
                    size={25}
                    color={"white"}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="plusMenu"
        options={{
          headerShown: false,
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  percentageContainer: {
    borderRadius: 10,
    marginLeft: 10,
    padding: 5,
  },
  positive: {
    color: "white",
    backgroundColor: "green",
  },
  negative: {
    color: "white",
    backgroundColor: "red",
  },
});
