import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface QrScannerProps {
    onScan: (result: BarcodeScanningResult) => void;
}

export default function QrScanner({ onScan }: Readonly<QrScannerProps>) {
    const [permission, requestPermission] = useCameraPermissions();

    const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
        const ethAddressRegex = /^ethereum:0x[a-fA-F0-9]{40}$/;
        const isValidEthAddress = ethAddressRegex.test(scanningResult.data);

        if (isValidEthAddress) {
            onScan(scanningResult);
        } else {
            console.log("Invalid Ethereum address scanned:", scanningResult.data);
        }
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet. 
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={(scanningResult: BarcodeScanningResult) => handleBarCodeScanned(scanningResult)}>
                <View style={styles.buttonContainer}>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 160,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});