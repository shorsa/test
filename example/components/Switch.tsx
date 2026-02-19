import React, { useCallback, useEffect } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@styles/colors";
import { elevationShadowStyle } from "@styles/globalStyles";
import { moderateScale } from "@styles/scaling";

export interface TrackColors {
  on: string;
  off: string;
}

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  trackColors?: TrackColors;
  disabled?: boolean;
}

const DEFAULT_ANIMATION_DURATION = 300;
const TRACK_WIDTH = moderateScale(56);
const TRACK_HEIGHT = moderateScale(31);
const TRACK_PADDING = moderateScale(2);

const DEFAULT_TRACK_COLORS: TrackColors = {
  on: colors.darkGreen,
  off: colors.lightGrey,
};

/**
 * Animated toggle switch component with smooth color and position transitions.
 * Uses Reanimated for performant animations.
 *
 * @param {boolean} value - Current switch state (controlled)
 * @param {(value: boolean) => void} onChange - Callback when switch is toggled
 * @param {StyleProp<ViewStyle>} style - Custom track styles
 * @param {number} duration - Animation duration in milliseconds
 * @default 300
 * @param {TrackColors} trackColors - Custom colors for on/off states
 * @default { on: colors.darkGreen, off: colors.lightGrey }
 * @param {boolean} disabled - Disable switch interactions
 * @default false
 * @returns {React.FC<SwitchProps>} The Switch component
 * @example
 * <Switch value={isEnabled} onChange={setIsEnabled} />
 * <Switch value={darkMode} onChange={toggleDarkMode} trackColors={{ on: 'green', off: 'gray' }} />
 */
const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  style,
  duration = DEFAULT_ANIMATION_DURATION,
  disabled = false,
  trackColors = DEFAULT_TRACK_COLORS,
}) => {
  const isOn = useSharedValue(value);

  useEffect(() => {
    isOn.value = value;
  }, [value, isOn]);

  const height = useSharedValue(0);
  const width = useSharedValue(0);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(isOn.value),
      [0, 1],
      [trackColors.off, trackColors.on],
    );
    const colorValue = withTiming(color, { duration });

    return {
      backgroundColor: colorValue,
      borderRadius: height.value / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(isOn.value),
      [0, 1],
      [0, width.value - height.value],
    );
    const translateValue = withTiming(moveValue, { duration });

    return {
      transform: [{ translateX: translateValue }],
      borderRadius: height.value / 2,
    };
  });

  const handlePress = useCallback((): void => {
    if (disabled) return;
    onChange(!isOn.value);
  }, [disabled, isOn, onChange]);

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number; width: number } } }): void => {
      height.value = e.nativeEvent.layout.height;
      width.value = e.nativeEvent.layout.width;
    },
    [height, width]
  );

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View
        onLayout={handleLayout}
        style={[styles.track, style, trackAnimatedStyle]}
      >
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </Pressable>
  );
};

export default Switch;

const styles = StyleSheet.create({
  track: {
    alignItems: "flex-start",
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    padding: TRACK_PADDING,
  },
  thumb: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: colors.yellow,
    ...elevationShadowStyle(1, colors.black, 0.15, 1),
  },
});
