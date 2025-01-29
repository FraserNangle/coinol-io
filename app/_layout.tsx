import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import { ActivityIndicator } from "react-native";
import { initiateGuestUser } from "./services/apiService";
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { PaperProvider } from "react-native-paper";


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const fetchGuestUser = async () => {
      try {
        await initiateGuestUser();
        setLoading(false);
      } catch (e) {
        console.error('Could not get guest token', e);
        setLoading(false);
      }
    };

    fetchGuestUser();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>);
}

function RootLayoutNav() {
  return (
    <SQLiteProvider databaseName="coinolio.db">
      <RootSiblingParent>
        <GestureHandlerRootView >
          <PaperProvider>
            <ThemeProvider value={DarkTheme}>
              <Stack
                screenOptions={{
                  animation: "slide_from_right",
                }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                <Stack.Screen
                  name="pages/addTransaction/addTransactionCurrencyListScreen"
                  options={{
                    presentation: "fullScreenModal",
                    title: "Select Currency",
                    headerStyle: { backgroundColor: 'black' },
                    headerTitleAlign: 'center',
                  }}
                />
                <Stack.Screen
                  name="pages/addTransaction/transactionScreen"
                  options={{
                    presentation: "fullScreenModal",
                    title: "Add Transaction",
                    headerStyle: { backgroundColor: 'black' },
                    headerTitleAlign: 'center',
                  }}
                />
                <Stack.Screen
                  name="pages/coinGraph/coinGraphScreen"
                  options={{
                    presentation: "fullScreenModal",
                    title: "Coin Graph",
                    headerStyle: { backgroundColor: 'black' },
                    headerTitleAlign: 'center',
                  }}
                />
              </Stack>
            </ThemeProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </RootSiblingParent>
    </SQLiteProvider>
  );
}