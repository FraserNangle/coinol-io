import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";
import { useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function PlusMenuScreen() {
  const navigation = useNavigation();

  const handlePress = (page: string) => {
    if (page == "transactionScreen") {
      navigation.navigate("pages/addTransaction/addTransactionCurrencyListScreen");
    } else if (page == "connectWalletScreen") {
      navigation.navigate("pages/connectWallet/connectWalletScreen");
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.tableContainer}>
        <View style={styles.column}>
          <View>
            <TouchableOpacity style={styles.choice} onPress={() => handlePress('transactionScreen')}>
              <MaterialIcons name="add-card" color={"white"} size={100} />
              <Text style={styles.text}>Add a Transaction</Text>
            </TouchableOpacity>
          </View>
          <View style={{ borderTopWidth: 1, borderColor: "white", width: "100%" }}></View>
          <View>
            <TouchableOpacity style={styles.choice} onPress={() => handlePress('connectWalletScreen')}>
              <MaterialIcons name="wallet" color={"white"} size={100} />
              <Text style={styles.text}>Connect a Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tableContainer: {
    flex: .5,
  },
  choice: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10
  }
});
