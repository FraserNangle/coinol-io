import React, { useLayoutEffect, useCallback, useEffect } from "react";
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
} from "@/components/Animation";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import { RootState } from "@/app/store/store";
import { SectionFolioEntry } from "@/app/models/FolioEntry";
import { useNavigation } from "expo-router";

interface SectionProps {
    section: SectionFolioEntry,
    index: number,
    totalValue: number,
    outerRadius: number,
    color: string,
}

export const Section: React.FC<SectionProps> = ({
    section,
    index,
    totalValue,
    outerRadius,
    color
}: SectionProps) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const selectedSection = useSelector(
        (state: RootState) => state.selectedSection.section
    );

    const totalAnimationTime = 2000;

    const animation = useSharedValue(0);
    const scale = useSharedValue(1);

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
        animation.value = 0;
        const delay = (section.accumulatedValue / totalValue) * totalAnimationTime;
        const duration = ((section.currentPrice * section.quantity) / totalValue) * totalAnimationTime;
        setTimeout(() => {
            animation.value = withTiming(1, { duration });
        }, delay);
    }, [section.currentPrice, section.quantity, section.accumulatedValue, totalValue, totalAnimationTime]);

    useLayoutEffect(() => {
        scale.value = withTiming(selectedSection?.details?.coinId === section.coinId ? 1.1 : 1, {
            duration: 200,
        });

        // Cleanup function
        return () => {
            scale.value = 1;
        };
    }, [selectedSection]);

    const handlePress = useCallback(() => {
        if (selectedSection?.details?.coinId === section.coinId) {
            navigation.navigate("pages/coinGraph/coinGraphScreen", { folioEntry: section });
        }
        dispatch(setSelectedSection({ details: section, index: index }));
    }, [dispatch, index, section, selectedSection]);


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