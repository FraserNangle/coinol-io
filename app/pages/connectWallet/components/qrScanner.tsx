import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

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
                <View style={styles.tableContainer}>
                    <Text style={styles.message}>In order to show the QR Scanner, we need camera permission.</Text>
                    <Text style={styles.message}>(You only need to approve this once).</Text>
                    <Button
                        buttonColor="green"
                        style={styles.bigButton}
                        mode="contained"
                        onPress={requestPermission}>
                        Grant Camera Permission
                    </Button>
                </View>
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
    tableContainer: {
        width: "80%",
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderRadius: 10,
        padding: 10,
    },
    message: {
        color: 'white',
        textAlign: 'center',
        paddingBottom: 10,
        fontSize: 15,
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
    bigButton: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});