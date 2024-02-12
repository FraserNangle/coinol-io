import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { View, Text } from "react-native";

const CounterDisplay = () => {
  const counter = useSelector((state: RootState) => state.counter);

  return (
    <View>
      <Text>COUNTER:{counter.value}</Text>
    </View>
  );
};

export default CounterDisplay;
