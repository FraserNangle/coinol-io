import React, {
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { View, StyleSheet, Image, useColorScheme } from "react-native";
import Svg, { Path, G, Text, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const colors = [
  "#FF7F00",
  "#FF6E1A",
  "#FF5D34",
  "#FF4C4E",
  "#FF3B68",
  "#FF2A82",
  "#FF199C",
  "#FF08B6",
  "#F000D2",
  "#E400E0",
  "#D800EE",
  "#CC00FC",
  "#C000FA",
  "#B400F8",
  "#A800F6",
  "#9C00F4",
  "#9000F2",
  "#8400F0",
  "#7800EE",
  "#6C00EC",
];
const totalAnimationTime = 1000;

const Slice = ({
  slice,
  index,
  setSelectedSlice,
  setSelectedIndex,
  selectedIndex,
  accumulatedValue,
  totalValue,
  outerRadius,
  totalSlices,
}) => {
  const { value, startAngle, endAngle } = slice;
  const animation = useSharedValue(0);
  const scale = useSharedValue(1);

  const color = useMemo(() => {
    const colorIndex = interpolate(
      index,
      [0, totalSlices - 1],
      [0, colors.length - 1]
    );
    const roundedColorIndex = Math.round(colorIndex);
    return colors[roundedColorIndex];
  }, [index, totalSlices]);

  const animatedEndAngle = useDerivedValue(() => {
    return interpolate(animation.value, [0, 1], [startAngle, endAngle]);
  });

  const animatedProps = useAnimatedProps(() => {
    const x1 = outerRadius * Math.cos(startAngle);
    const y1 = outerRadius * Math.sin(startAngle);
    const x2 = outerRadius * Math.cos(animatedEndAngle.value);
    const y2 = outerRadius * Math.sin(animatedEndAngle.value);
    const largeArcFlag = animatedEndAngle.value - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0`;

    return { d };
  });

  const overlayAnimatedProps = useAnimatedProps(() => {
    const x1 = outerRadius * Math.cos(startAngle);
    const y1 = outerRadius * Math.sin(startAngle);
    const x2 = outerRadius * Math.cos(animatedEndAngle.value);
    const y2 = outerRadius * Math.sin(animatedEndAngle.value);
    const largeArcFlag = animatedEndAngle.value - startAngle > Math.PI ? 1 : 0;
    const d = `M 0 0 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return { d };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useLayoutEffect(() => {
    animation.value = 0; // reset the animation value
    const delay = (accumulatedValue / totalValue) * totalAnimationTime;
    const duration = (slice.value / totalValue) * totalAnimationTime;
    setTimeout(() => {
      animation.value = withTiming(1, { duration });
    }, delay);
  }, [slice.value, accumulatedValue, totalValue, totalAnimationTime]);

  useLayoutEffect(() => {
    scale.value = withTiming(selectedIndex === index ? 1.1 : 1, {
      duration: 200,
    });

    // Cleanup function
    return () => {
      scale.value = 1;
    };
  }, [selectedIndex]);

  const handlePress = useCallback(() => {
    setSelectedSlice({ ...slice, color });
    setSelectedIndex(index);
  }, [setSelectedSlice, setSelectedIndex, slice, color, index]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  return (
    <G>
      <AnimatedPath
        animatedProps={animatedProps}
        fill={color}
        style={animatedStyle}
      />
      <AnimatedPath
        animatedProps={overlayAnimatedProps}
        fill="transparent"
        onPressIn={handlePress}
      />
    </G>
  );
};

export const DonutChart = ({
  data,
  width = 300,
  height = 500,
  backgroundColor = "white",
  currencyTicker = "USD",
}) => {
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [outerRadius, setOuterRadius] = useState(150);
  const [thickness, setThickness] = useState(30);
  const [showPercentage, setShowPercentage] = useState(true);

  const totalMoney = data.reduce((acc, slice) => acc + slice.value, 0);
  const significantItems = data.filter(
    (slice) => slice.value / totalMoney >= 0.05
  );
  const otherItemValue = data.reduce((acc, slice) => {
    if (slice.value / totalMoney < 0.05) {
      return acc + slice.value;
    }
    return acc;
  }, 0);

  if (otherItemValue > 0) {
    significantItems.push({ name: "Other", value: otherItemValue });
  }

  const sortedData = useMemo(() => {
    return [...significantItems].sort((a, b) => b.value - a.value);
  }, [significantItems]);

  const minSliceAngle = 2 * Math.PI * 0.05;
  let startAngle = -Math.PI / 2;
  let accumulatedValue = 0;

  let slices = sortedData.map((slice) => {
    const gapSize = 2 / outerRadius;
    const sliceAngle = Math.max(
      2 * Math.PI * (slice.value / totalMoney),
      minSliceAngle
    );
    const startAngleGap = startAngle + gapSize;
    const endAngle = startAngleGap + sliceAngle - 2 * gapSize;
    const s = {
      ...slice,
      startAngle: startAngleGap,
      endAngle,
      accumulatedValue,
    };
    startAngle = endAngle + gapSize;
    accumulatedValue += slice.value;
    return s;
  });

  const totalAngle = slices.reduce(
    (total, slice) => total + (slice.endAngle - slice.startAngle),
    0
  );

  if (totalAngle > 2 * Math.PI) {
    const scale = (2 * Math.PI) / totalAngle;
    let startAngle = -Math.PI / 2;

    slices = slices.map((slice) => {
      const gapSize = 2 / outerRadius;
      const sliceAngle = (slice.endAngle - slice.startAngle) * scale;
      const startAngleGap = startAngle + gapSize * scale;
      const endAngle = startAngleGap + sliceAngle - 2 * gapSize * scale;
      const s = { ...slice, startAngle: startAngleGap, endAngle };
      startAngle = endAngle + gapSize * scale;
      return s;
    });
  }

  useEffect(() => {
    setThickness(outerRadius * 0.3);
  }, [outerRadius]);

  useLayoutEffect(() => {
    if (slices.length > 0) {
      slices[0].color = colors[0];
      setSelectedIndex(0);
      setSelectedSlice(slices[0]);
    }
  }, []);

  const toggleShowPercentage = useCallback(() => {
    setShowPercentage((prevShowPercentage) => !prevShowPercentage);
  }, []);

  const circleSize = 10;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setOuterRadius(Math.min(width, height) / 2.5 / 1.1);
      }}
    >
      <Svg width={width} height={height}>
        <G x={width / 2} y={height / 2}>
          {slices.map((slice, index) => (
            <Slice
              key={index}
              slice={slice}
              index={index}
              setSelectedSlice={setSelectedSlice}
              setSelectedIndex={setSelectedIndex}
              selectedIndex={selectedIndex}
              accumulatedValue={slice.accumulatedValue}
              totalValue={totalMoney}
              outerRadius={outerRadius}
              totalSlices={slices.length}
            />
          ))}
          <Circle
            r={outerRadius - thickness}
            fill={backgroundColor}
            onPressIn={toggleShowPercentage}
          />
          {selectedSlice && (
            <View>
              <Text style={styles.selectedSliceValue}>
                {showPercentage
                  ? `${((selectedSlice.value / totalMoney) * 100).toFixed(2)}%`
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currencyTicker,
                    }).format(selectedSlice.value)}
              </Text>
              {selectedSlice.image ? (
                <Image
                  source={{ uri: selectedSlice.image }}
                  style={[
                    styles.selectedSliceImage,
                    { width: circleSize * 2, height: circleSize * 2 },
                  ]}
                />
              ) : (
                <G style={styles.selectedSliceCircle}>
                  <Circle r={circleSize} fill={selectedSlice.color} />
                </G>
              )}
              <Text style={styles.selectedSliceName}>{selectedSlice.name}</Text>
            </View>
          )}
        </G>
      </Svg>
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: isDark ? "black" : "rgba(147,112,219,1)",
    },
    selectedSliceValue: {
      y: -10,
      textAnchor: "middle",
      fill: isDark ? "white" : "black",
      fontSize: 24,
    },
    selectedSliceImage: {
      width: 20,
      height: 20,
    },
    selectedSliceCircle: {
      y: 10,
      x: -13,
    },
    selectedSliceName: {
      y: 10,
      x: 2,
      dy: "0.35em",
      fill: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
    },
  });
