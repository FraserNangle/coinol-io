import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";
import permissionWarning from "./components/permissionWarning";

export default function ConnectWalletScreen() {
    const navigation = useNavigation();

    const handlePress = (walletType: string) => {
        navigation.navigate("pages/connectWallet/" + walletType);
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.tableContainer}>
                <View style={styles.title}>
                    <Text style={styles.bold}>Connect Wallet</Text>
                </View>
                <View>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.walletOption} onPress={() => handlePress('metaMaskWalletScreen')}>
                            <Image source={require('@/assets/images/MetaMask_Fox.png')} style={styles.logo} />
                            <Text>Metamask</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.walletOption} onPress={() => handlePress('BinancePage')}>
                            <Image source={require('@/assets/images/Binance_Logo.png')} style={styles.logo} />
                            <Text>Binance</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.walletOption} onPress={() => handlePress('OtherPage')}>
                            <FontAwesome name="briefcase" color={"white"} size={styles.logo.width} style={styles.logo} />
                            <Text>Other</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {permissionWarning()}
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'hsl(0, 0%, 0%)',
    },
    tableContainer: {
        width: "80%",
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderRadius: 10,
        padding: 10,
    },
    walletOption: {
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    bold: {
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    title: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
        fontWeight: "bold",
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
});

