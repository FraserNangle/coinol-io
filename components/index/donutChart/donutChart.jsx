import React, {
  useLayoutEffect,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import { donutChartColors } from "@/app/styling/donutChartColors";
import Svg, { G, Text, Circle } from "react-native-svg";
import { Section } from "./section";

export const DonutChart = ({
  data,
  width = 300,
  height = 500,
  backgroundColor = "white",
  currencyTicker = "USD",
}) => {
  const styles = getStyles();

  const dispatch = useDispatch();
  const selectedSection = useSelector((state) => state.selectedSlice.value);

  const [outerRadius, setOuterRadius] = useState(150);
  const [thickness, setThickness] = useState(30);
  const [displayMode, setDisplayMode] = useState("percentage");

  const totalMoney = data.reduce((acc, section) => acc + section.value, 0);
  const significantItems = data.filter(
    (section) => section.value / totalMoney >= 0.05
  );
  const otherItemValue = data.reduce((acc, section) => {
    if (section.value / totalMoney < 0.05) {
      return acc + section.value;
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

  let sections = sortedData.map((section) => {
    const gapSize = 2 / outerRadius;
    const sliceAngle = Math.max(
      2 * Math.PI * (section.value / totalMoney),
      minSliceAngle
    );
    const startAngleGap = startAngle + gapSize;
    const endAngle = startAngleGap + sliceAngle - 2 * gapSize;
    const s = {
      ...section,
      startAngle: startAngleGap,
      endAngle,
      accumulatedValue,
    };
    startAngle = endAngle + gapSize;
    accumulatedValue += section.value;
    return s;
  });

  const totalAngle = sections.reduce(
    (total, section) => total + (section.endAngle - section.startAngle),
    0
  );

  if (totalAngle > 2 * Math.PI) {
    const scale = (2 * Math.PI) / totalAngle;
    let startAngle = -Math.PI / 2;

    sections = sections.map((section) => {
      const gapSize = 2 / outerRadius;
      const sliceAngle = (section.endAngle - section.startAngle) * scale;
      const startAngleGap = startAngle + gapSize * scale;
      const endAngle = startAngleGap + sliceAngle - 2 * gapSize * scale;
      const s = { ...section, startAngle: startAngleGap, endAngle };
      startAngle = endAngle + gapSize * scale;
      return s;
    });
  }

  useLayoutEffect(() => {
    if (sections.length > 0) {
      sections[0].color = donutChartColors[0];
      dispatch(
        setSelectedSection({ ...sections[0], ...donutChartColors[0], index: 0 })
      );
    }
  }, []);

  useEffect(() => {
    setThickness(outerRadius * 0.3);
  }, [outerRadius]);

  const prevSelectedSectionRef = useRef();

  useEffect(() => {
    prevSelectedSectionRef.current = selectedSection;
  }, [selectedSection]);
  
  useEffect(() => {
    const prevSelectedSection = prevSelectedSectionRef.current;
    if (
      selectedSection !== prevSelectedSection &&
      (
        (displayMode === "percentage" && !((selectedSection?.value / totalMoney) * 100)) ||
        (displayMode === "value" && !selectedSection?.value) ||
        (displayMode === "quantity" && !selectedSection?.quantity)
      )
    ) {
      toggleDisplayMode();
    }
  }, [selectedSection, displayMode, toggleDisplayMode]);

  const toggleDisplayMode = () => {
    setDisplayMode((prevMode) => {
      let newMode;
      switch (prevMode) {
        case "percentage":
          newMode = selectedSection?.value ? "value" : "quantity";
          break;
        case "value":
          newMode = selectedSection?.quantity ? "quantity" : "percentage";
          break;
        case "quantity":
        default:
          newMode =
            (selectedSection?.value / totalMoney) * 100
              ? "percentage"
              : "value";
          break;
      }
      if (newMode !== prevMode) {
        return newMode;
      }
      return prevMode;
    });
  };

  /* const toggleDisplayMode = useCallback(() => {
    setDisplayMode((prevMode) => {
      let newMode;
      switch (prevMode) {
        case "percentage":
          newMode = selectedSection?.value ? "value" : "quantity";
          break;
        case "value":
          newMode = selectedSection?.quantity ? "quantity" : "percentage";
          break;
        case "quantity":
        default:
          newMode =
            (selectedSection?.value / totalMoney) * 100
              ? "percentage"
              : "value";
          break;
      }
      return newMode;
    });
  }, [selectedSection]); */

  const formatNumber = (num) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + "B";
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + "M";
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + "K";
    } else {
      return num.toString();
    }
  };

  const getText = () => {
    if (
      displayMode === "percentage" &&
      (selectedSection?.value / totalMoney) * 100
    ) {
      return `${((selectedSection?.value / totalMoney) * 100).toFixed(2)}%`;
    } else if (displayMode === "value" && selectedSection?.value) {
      return formatNumber(selectedSection?.value);
    } else if (displayMode === "quantity" && selectedSection?.quantity) {
      return formatNumber(selectedSection?.quantity);
    } else {
      return null;
    }
  };

  const text = getText();

  const circleSize = 10;

  function formatQuantity(quantity) {
    if (quantity >= 1e9) {
      return (quantity / 1e9).toFixed(2) + 'B';
    } else if (quantity >= 1e6) {
      return (quantity / 1e6).toFixed(2) + 'M';
    } else {
      return new Intl.NumberFormat().format(quantity);
    }
  }

  function formatCurrency(value, currencyTicker) {
    if (value >= 1e9) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyTicker,
      }).format(value / 1e9) + 'B';
    } else if (value >= 1e6) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyTicker,
      }).format(value / 1e6) + 'M';
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyTicker,
      }).format(value);
    }
  }

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
          {sections.map((section, index) => (
            <Section
              key={index}
              section={section}
              index={index}
              accumulatedValue={section.accumulatedValue}
              totalValue={totalMoney}
              outerRadius={outerRadius}
              totalSections={sections.length}
            />
          ))}
          <Circle
            r={outerRadius - thickness}
            fill={backgroundColor}
            onPressIn={toggleDisplayMode}
          />
          {selectedSection && (
            <View>
              <Text style={styles.selectedSliceValue}>
                {displayMode === "percentage" &&
                (selectedSection.value / totalMoney) * 100
                  ? `${((selectedSection.value / totalMoney) * 100).toFixed(2)}%`
                  : displayMode === "value" && selectedSection.value
                  ? formatCurrency(selectedSection.value, currencyTicker)
                  : displayMode === "quantity" && selectedSection.quantity
                  ? formatQuantity(Number(selectedSection.quantity))
                  : null}
              </Text>
              {selectedSection.image ? (
                <Image
                  source={{ uri: selectedSection.image }}
                  style={[
                    styles.selectedSliceImage,
                    { width: circleSize * 2, height: circleSize * 2 },
                  ]}
                />
              ) : (
                <G style={styles.selectedSliceCircle}>
                  <Circle r={circleSize} fill={selectedSection.color} />
                </G>
              )}
              <Text style={styles.selectedSliceName}>
                {selectedSection.name}
              </Text>
            </View>
          )}
        </G>
      </Svg>
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "black",
    },
    selectedSliceValue: {
      y: -10,
      textAnchor: "middle",
      fill: "white",
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
      fill: "rgba(255, 255, 255, 0.5)",
    },
  });
