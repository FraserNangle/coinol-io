import { StyleSheet, Image, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import { Button } from "react-native-paper";
import permissionWarning from "./components/permissionWarning";

export default function MetaMaskWalletScreen() {
    const [walletAddress, setWalletAddress] = useState('');

    const handlePaste = async () => {
        const clipboardContent = await Clipboard.getStringAsync();
        setWalletAddress(clipboardContent);
    };

    const navigation = useNavigation();

    const handlePress = (walletType: string) => {
        navigation.navigate("pages/connectWallet/" + walletType);
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.tableContainer}>
                <View style={styles.title}>
                    <View style={styles.walletOption}>
                        <Image source={require('@/assets/images/MetaMask_Fox.png')} style={styles.logo} />
                        <Text>Metamask</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter MetaMask Wallet Address"
                        value={walletAddress}
                        onChangeText={setWalletAddress}
                    />
                    <Button onPress={handlePaste}
                        buttonColor="hsl(0, 0%, 25%)"
                        compact
                        mode="contained"
                    >Paste</Button>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
    },
    walletOption: {
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    bold: {
        fontWeight: "bold",
    },
    light: {
        fontWeight: "200",
        fontSize: 12,
        paddingLeft: 10,
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
    subtitle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
});
