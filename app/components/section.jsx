import React, { useLayoutEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { G } from "react-native-svg";
import {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  totalAnimationTime,
  AnimatedPath,
} from "../styling/donutChartAnimation";
import { setSelectedSection } from "../slices/selectedSectionSlice";
import { donutChartColors } from "../styling/donutChartColors";

export const Section = ({
  section,
  index,
  accumulatedValue,
  totalValue,
  outerRadius,
  totalSections,
}) => {
  const dispatch = useDispatch();
  const selectedIndex = useSelector(
    (state) => state.selectedSlice.value?.index
  );

  const { value, startAngle, endAngle } = section;
  const animation = useSharedValue(0);
  const scale = useSharedValue(1);

  const color = useMemo(() => {
    const colorIndex = interpolate(
      index,
      [0, totalSections - 1],
      [0, donutChartColors.length - 1]
    );
    const roundedColorIndex = Math.round(colorIndex);
    return donutChartColors[roundedColorIndex];
  }, [index, totalSections]);

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
    const duration = (section.value / totalValue) * totalAnimationTime;
    setTimeout(() => {
      animation.value = withTiming(1, { duration });
    }, delay);
  }, [section.value, accumulatedValue, totalValue, totalAnimationTime]);

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
    dispatch(setSelectedSection({ ...section, color, index }));
  }, [setSelectedSection, section, color, index]);

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
        r
      />
    </G>
  );
};
