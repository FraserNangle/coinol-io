import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";

export default function PlusMenuScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Add a Transaction</Text>
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
