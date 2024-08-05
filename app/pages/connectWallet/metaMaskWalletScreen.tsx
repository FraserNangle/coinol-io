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
                <View style={styles.walletOption}>
                    <Image source={require('@/assets/images/MetaMask_Fox.png')} style={styles.logo} />
                    <Text>Metamask</Text>
                </View>
                <Text style={{ fontWeight: 200, paddingLeft: 10, fontSize: 12 }}>Wallet Address</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter MetaMask Wallet Address"
                        value={walletAddress}
                        onChangeText={setWalletAddress}
                        multiline={false}
                        numberOfLines={1}
                        placeholderTextColor={'hsl(0, 0%, 60%)'}
                        selectionColor="white"
                        cursorColor="white"
                        textAlign="right"
                    />
                    <Button onPress={handlePaste}
                        buttonColor="hsl(0, 0%, 25%)"
                        mode="contained"
                        compact
                        style={{ marginRight: 5 }}
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
        backgroundColor: 'hsl(0, 0%, 15%)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        alignContent: 'center',
        borderColor: 'gray',
        borderRadius: 10,
        borderWidth: 1,
    },
    textInput: {
        padding: 10,
        marginRight: 10,
        color: 'white',
    },
    walletOption: {
        flexDirection: "row",
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
    subtitle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'hsl(0, 0%, 15%)',
        padding: 10,
    },
    logo: {
        width: 30,
        height: 30,
    },
});
