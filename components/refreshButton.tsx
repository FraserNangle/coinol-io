import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Animated, TouchableOpacity, View } from "react-native";

export function refreshButton(setRefresh: React.Dispatch<React.SetStateAction<boolean>>, rotateAnim: Animated.Value, xAdjustment: number = 0) {
    const startAnimation = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return <View style={[{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', paddingEnd: xAdjustment }]}>
        <TouchableOpacity onPress={() => {
            startAnimation();
            setRefresh(prevRefresh => !prevRefresh);
        }}>
            <Animated.View style={{ transform: [{ rotate }] }}>
                <MaterialIcons style={[{
                    color: 'white',
                }]} name={"refresh"} size={30} />
            </Animated.View>
        </TouchableOpacity>
    </View>;
}