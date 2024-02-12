import React, { useLayoutEffect, useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Path, G, Text, Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, useDerivedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const colors = ['#5D3FD3', '#FF6B35', '#0096FF', '#FFC542', '#6C757D', '#6610F2', '#E83E8C', '#28A745', '#17A2B8', '#343A40'];
const totalAnimationTime = 1000;

const Slice = ({ slice, index, setSelectedSlice, setSelectedIndex, selectedIndex, accumulatedValue, totalValue, outerRadius }) => {

  const { value, startAngle, endAngle } = slice;
  const animation = useSharedValue(0);
  const scale = useSharedValue(1);

  const color = colors[index % colors.length];

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
    scale.value = withTiming(selectedIndex === index ? 1.1 : 1, { duration: 200 });

    // Cleanup function
    return () => {
        scale.value = 1;
    };
  }, [selectedIndex]);

  const handlePress = useCallback(() => {
    setSelectedSlice({ ...slice, color });
    setSelectedIndex(index);
  }, [setSelectedSlice, setSelectedIndex, slice, color, index]);

  return (
    <G onPress={handlePress}>
      <AnimatedPath
        animatedProps={animatedProps}
        fill={color}
        style={animatedStyle}
      />
    </G>
  );
};

export const DonutChart = ({ data, width = 300, height = 300, backgroundColor = 'white' }) => {
    const [selectedSlice, setSelectedSlice] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [outerRadius, setOuterRadius] = useState(150);
    const [thickness, setThickness] = useState(30);
  
    let startAngle = -Math.PI / 2;
    let accumulatedValue = 0;
  
    const sortedData = useMemo(() => {
      return [...data].sort((a, b) => b.value - a.value);
    }, [data]);
  
    const slices = sortedData.map((slice) => {
      const gapSpacing = 2; // Adjust this value to increase or decrease the gap size
      const gapSize = gapSpacing / outerRadius;
      const startAngleGap = startAngle + gapSize;
      const endAngle = startAngleGap + (2 * Math.PI * (slice.value / 100)) - (2 * gapSize);
      const s = { ...slice, startAngle: startAngleGap, endAngle, accumulatedValue };
      startAngle = endAngle + gapSize;
      accumulatedValue += slice.value;
      return s;
    });
  
    const totalValue = data.reduce((acc, slice) => acc + slice.value, 0);
  
    useEffect(() => {
      setThickness(outerRadius * 0.3); // adjust the factor as needed
    }, [outerRadius]);
  
    return (
      <View style={styles.container} onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setOuterRadius(Math.min(width, height) / 2 / 1.1); // consider the scale factor
      }}>
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
                totalValue={totalValue}
                outerRadius={outerRadius}
              />
            ))}
            <Circle cx="0" cy="0" r={outerRadius - thickness} fill={backgroundColor} />
            {selectedSlice && (
              <View style={styles.selectedSliceContainer}>
                  <Text
                  style={styles.selectedSliceValue}
                  >
                  {`${selectedSlice.value}%`}
                  </Text>
                  {selectedSlice.image ? (
                  <Image
                      source={{ uri: selectedSlice.image }}
                      style={styles.selectedSliceImage}
                  />
                  ) : (
                  <G style={styles.selectedSliceCircle}>
                      <Circle cx="0" cy="0" r="7" fill={selectedSlice.color} />
                  </G>
                  )}
                  <Text
                  style={styles.selectedSliceName}
                  >
                  {selectedSlice.name}
                  </Text>
              </View>
              )}
          </G>
        </Svg>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSliceContainer: {
    position: 'absolute',
    right: 10,
  },
  selectedSliceValue: {
    x: "0",
    y: "-10",
    textAnchor: "middle",
    fill: "black",
    fontSize: 24,
  },
  selectedSliceImage: {
    width: 20,
    height: 20,
  },
  selectedSliceCircle: {
    x: "-25",
    y: "5",
  },
  selectedSliceName: {
    x: "0",
    y: "10",
    textAnchor: "middle",
    fill: "rgba(0, 0, 0, 0.5)",
  },
});