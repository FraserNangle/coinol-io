import { StyleSheet, Image, TextInput, TouchableOpacity, Modal } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import { Button } from "react-native-paper";
import PermissionWarning from "./components/permissionWarning";
import QrScanner from "./components/qrScanner";
import { BarcodeScanningResult } from "expo-camera";

export default function MetaMaskWalletScreen() {
    const [walletAddress, setWalletAddress] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handlePaste = async () => {
        const clipboardContent = await Clipboard.getStringAsync();
        setWalletAddress(clipboardContent);
    };

    const handleScan = (result: BarcodeScanningResult) => {
        setWalletAddress(result.data);
        toggleModal();
    }

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
                <View style={styles.rowWithQr}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={walletAddress}
                            placeholder="Wallet Address"
                            onChangeText={setWalletAddress}
                            multiline={false}
                            numberOfLines={1}
                            placeholderTextColor={'hsl(0, 0%, 60%)'}
                            selectionColor={'hsl(0, 0%, 60%)'}
                            cursorColor="white"
                            textAlign="left"
                        />
                        <Button onPress={handlePaste}
                            icon={"content-paste"}
                            buttonColor="hsl(0, 0%, 25%)"
                            mode="contained"
                            compact
                            style={{ marginRight: 10 }}
                        >PASTE</Button>
                    </View>
                    <TouchableOpacity style={styles.qrCodeIcon} onPress={toggleModal}>
                        <FontAwesome name="qrcode" color={"white"} size={styles.logo.width} style={styles.logo} />
                    </TouchableOpacity>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={toggleModal}
                    >
                        <View style={styles.modalContainer}>
                            <QrScanner onScan={handleScan} />
                            <Button
                                icon={"close"}
                                onPress={toggleModal}
                                buttonColor="hsl(0, 0%, 25%)"
                                mode="contained"
                                compact
                            >Close</Button>
                        </View>
                    </Modal>
                </View>
            </View>
            {PermissionWarning()}
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
        flex: 1,
        justifyContent: "flex-end",
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderColor: 'hsl(0, 0%, 60%)',
        borderRadius: 10,
        borderWidth: 1,
        height: 60,
        overflow: "hidden",
    },
    textInput: {
        flex: 1,
        padding: 10,
        color: 'white',
        backgroundColor: 'hsl(0, 0%, 15%)',
    },
    walletOption: {
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 15%)',
        paddingBottom: 10,
        justifyContent: "center",
    },
    qrCodeIcon: {
        flex: .1,
        flexDirection: "row",
        alignItems: 'center',
        paddingLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    bold: {
        fontWeight: "bold",
    },
    light: {
        fontWeight: "200",
        fontSize: 12,
        paddingLeft: 10,
    },
    rowWithQr: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 60,
        backgroundColor: 'hsl(0, 0%, 15%)',
    },
    logo: {
        width: 30,
        height: 30,
    },
});
