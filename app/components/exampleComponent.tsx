import React from "react";
import { useDispatch } from "react-redux";
import { decrement, increment } from "../slices/exampleSlice";
import { View, Button } from "react-native";

export const CounterComponent = () => {
  const dispatch = useDispatch();

  return (
    <View>
      <Button title="Increment" onPress={() => dispatch(increment())} />
      <Button title="Decrement" onPress={() => dispatch(decrement())} />
    </View>
  );
};
