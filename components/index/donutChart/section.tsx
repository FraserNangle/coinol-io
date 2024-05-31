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
} from "@/app/styling/donutChartAnimation";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import { donutChartColors } from "@/app/styling/donutChartColors";
import { RootState } from "@/app/store/store";

export interface DonutSection {
    startAngle: number;
    endAngle: number;
    accumulatedValue: number;
    name: string;
    id: string;
    quantity: number;
    currentPrice: number;
}

interface SectionProps {
    section: DonutSection,
    index: number,
    totalValue: number,
    outerRadius: number,
    totalSections: number,
}

export const Section: React.FC<SectionProps> = ({
    section,
    index,
    totalValue,
    outerRadius,
    totalSections,
}: SectionProps) => {

    const dispatch = useDispatch();
    const selectedSection = useSelector(
        (state: RootState) => state.selectedSection.id
    );

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
        return interpolate(animation.value, [0, 1], [section.startAngle, section.endAngle]);
    });

    const animatedProps = useAnimatedProps(() => {
        const x1 = outerRadius * Math.cos(section.startAngle);
        const y1 = outerRadius * Math.sin(section.startAngle);
        const x2 = outerRadius * Math.cos(animatedEndAngle.value);
        const y2 = outerRadius * Math.sin(animatedEndAngle.value);
        const largeArcFlag = animatedEndAngle.value - section.startAngle > Math.PI ? 1 : 0;
        const d = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0`;

        return { d };
    });

    const overlayAnimatedProps = useAnimatedProps(() => {
        const x1 = outerRadius * Math.cos(section.startAngle);
        const y1 = outerRadius * Math.sin(section.startAngle);
        const x2 = outerRadius * Math.cos(animatedEndAngle.value);
        const y2 = outerRadius * Math.sin(animatedEndAngle.value);
        const largeArcFlag = animatedEndAngle.value - section.startAngle > Math.PI ? 1 : 0;
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
        const delay = (section.accumulatedValue / totalValue) * totalAnimationTime;
        const duration = (section.currentPrice / totalValue) * totalAnimationTime;
        setTimeout(() => {
            animation.value = withTiming(1, { duration });
        }, delay);
    }, [section.currentPrice, section.accumulatedValue, totalValue, totalAnimationTime]);

    useLayoutEffect(() => {
        scale.value = withTiming(selectedSection === section.id ? 1.1 : 1, {
            duration: 200,
        });

        // Cleanup function
        return () => {
            scale.value = 1;
        };
    }, [selectedSection]);

    const handlePress = useCallback(() => {
        dispatch(setSelectedSection(section.id));
    }, [setSelectedSection]);

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