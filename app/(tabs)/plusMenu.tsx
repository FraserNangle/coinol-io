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
            <View style={styles.choice}>
              <MaterialIcons name="wallet" color={"white"} size={100} />
              <Text style={styles.text}>Connect a Wallet</Text>
            </View>
            <View style={styles.overlay}>
              <MaterialIcons name="construction" color={"white"} size={100} />
              <Text style={styles.overlayText}>COMING SOON</Text>
            </View>
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
  },
  overlay: {
    flexDirection: "row",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, .8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});