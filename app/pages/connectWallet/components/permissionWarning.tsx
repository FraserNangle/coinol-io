import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View, Text, StyleSheet } from "react-native";

export default function permissionWarning() {
    return <View style={styles.permissionWarning}>
        <FontAwesome
            name="shield"
            size={30}
            color={"green"}
            style={{ paddingLeft: 10 }} />
        <Text style={styles.light}>
            By connecting a wallet you are only granting Coinolio
            <Text style={{ fontWeight: '500', fontStyle: 'italic' }}> View Permissions. </Text>
            This app will not have access to your private keys and cannot make any transactions on your behalf.
        </Text>
    </View>;
}

const styles = StyleSheet.create({
    permissionWarning: {
        margin: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
        backgroundColor: 'hsl(0, 0%, 15%)',
        borderRadius: 10,
        padding: 10,
    },
    light: {
        color: 'white',
        fontWeight: "200",
        fontSize: 12,
        padding: 10,
    },
});