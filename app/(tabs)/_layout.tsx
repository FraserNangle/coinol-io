import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

// Import or define mockCoins and CURRENCY_TYPE
import { mockCoins } from "../mocks/chartData";
const CURRENCY_TYPE = "USD";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  size?: number;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const percentageIncrease = 10; // Replace this with your calculation
const titleColor = percentageIncrease >= 0 ? "#00ff00" : "red"; // Use a lighter green color for positive increase and pinkish color for negative
const titleShadowColor =
  percentageIncrease >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 105, 180, 0.5)";

const getStyles = (isDark) =>
  StyleSheet.create({
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
      color: isDark ? "white" : "black",
    },
    percentageContainer: {
      color: titleColor,
      textShadowColor: titleShadowColor,
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 1,
      backgroundColor:
        percentageIncrease >= 0
          ? "rgba(0, 255, 0, 0.2)"
          : "rgba(255, 105, 180, 0.2)", // Adjust the color based on the increase
      borderRadius: 3,
      marginLeft: 10,
      padding: 3,
    },
  });

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const totalPortfolioValue = mockCoins.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  const formattedTotalPortfolioValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_TYPE,
  }).format(totalPortfolioValue);

  return (
    <Tabs
      screenOptions={{
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTitleAlign: "center",
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Portfolio",
          tabBarShowLabel: true,
          headerTitle: () => (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                {formattedTotalPortfolioValue}
              </Text>
              <Text style={styles.percentageContainer}>
                {percentageIncrease}%
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="briefcase" color={color} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="user"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="addToken"
        options={{
          headerTitle: () => null,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-circle" color={color} size={40} />
          ),
          tabBarIconStyle: { justifyContent: "center" },
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          tabBarLabel: "Alerts",
          tabBarShowLabel: true,
          headerTitle: () => (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                {formattedTotalPortfolioValue} ({percentageIncrease}%)
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
    </Tabs>
  );
}
