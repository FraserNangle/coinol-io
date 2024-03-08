import { Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";
import { Link } from "expo-router";

export default function PlusMenuScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Link href="/pages/addTransaction/addTransactionCurrencyList" asChild>
          <Pressable>
            {({ pressed }) => (
              <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                Add a Transaction
              </Text>
            )}
          </Pressable>
        </Link>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: "white",
          width: "70%",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Connect a Wallet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
