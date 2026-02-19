import React, { useMemo } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { images } from "@constants/images";

import { colors } from "@styles/colors";
import { flexStyles, textStyles } from "@styles/globalStyles";
import { moderateScale, scale, verticalScale } from "@styles/scaling";
import { fontSizes, sizes } from "@styles/sizes";

import AppText from "./AppText";

export type InputAlign = "left" | "center" | "right";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onToggleSecure?: () => void;
  align?: InputAlign;
  placeholder?: string;
  error?: boolean;
  errorText?: string;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  password?: boolean;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  inputWrapperStyle?: StyleProp<ViewStyle>;
}

/**
 * Styled text input component with label, error states, and icon support.
 * Includes password visibility toggle and validation error display.
 *
 * @param {string} label - Input label text displayed above the field
 * @param {string} value - Current input value (controlled)
 * @param {(text: string) => void} onChangeText - Callback when text changes
 * @param {() => void} onBlur - Callback when input loses focus
 * @param {() => void} onToggleSecure - Callback to toggle password visibility
 * @param {InputAlign} align - Text alignment inside input
 * @default "left"
 * @example "left" | "center" | "right"
 * @param {string} placeholder - Placeholder text
 * @param {boolean} error - Show error state styling
 * @default false
 * @param {string} errorText - Error message to display below input
 * @param {boolean} secureTextEntry - Hide text for password input
 * @default false
 * @param {React.ReactNode} leftIcon - Icon displayed on the left side
 * @param {KeyboardTypeOptions} keyboardType - Keyboard type
 * @default "default"
 * @param {boolean} password - Enable password mode with visibility toggle
 * @default false
 * @param {React.ReactNode} rightIcon - Icon displayed on the right side
 * @param {boolean} disabled - Disable input interactions
 * @default false
 * @returns {React.FC<InputProps>} The Input component
 * @example
 * <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
 * <Input label="Password" value={password} onChangeText={setPassword} password secureTextEntry />
 */
export const Input: React.FC<InputProps> = (props) => {
  const {
    label,
    onToggleSecure,
    onBlur,
    placeholder,
    error,
    errorText,
    leftIcon,
    rightIcon,
    align = "left",
    keyboardType = "default",
    secureTextEntry = false,
    password = false,
    style,
    inputStyle,
    disabled,
    inputWrapperStyle,
  } = props;

  const getInputStyle = useMemo((): any => {
    const baseInputStyle: StyleProp<TextStyle> = [styles.input];

    if (leftIcon) {
      baseInputStyle.push(styles.inputWithLeftIcon);
    }

    if (Platform.OS === "android") {
      baseInputStyle.push(styles.inputAndroid);
    }

    if (align) {
      baseInputStyle.push({ textAlign: align });
    }

    if (align === "center") {
      baseInputStyle.push(styles.inputCentered);
    }

    if (inputStyle) {
      baseInputStyle.push(inputStyle);
    }

    return baseInputStyle as StyleProp<TextStyle>;
  }, [align, inputStyle, leftIcon]);

  const getInputContainerStyle = useMemo(() => {
    const baseContainerStyle: StyleProp<ViewStyle> = [styles.inputContainer];

    if (error) {
      baseContainerStyle.push(styles.inputError);
    }

    if (disabled) {
      baseContainerStyle.push(styles.inputDisabled);
    }

    if (inputWrapperStyle) {
      baseContainerStyle.push(inputWrapperStyle);
    }

    return baseContainerStyle;
  }, [error, disabled, inputWrapperStyle]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <AppText style={[styles.label, error && styles.labelError]}>
          {label}
        </AppText>
      )}

      <View style={getInputContainerStyle}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={getInputStyle}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.grey}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          numberOfLines={1}
          autoCapitalize="none"
          allowFontScaling={false}
          scrollEnabled={false}
          lineBreakModeIOS="tail"
          multiline={false}
          {...props}
        />

        {password && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onToggleSecure}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry ? "Show password" : "Hide password"}
          >
            {secureTextEntry ? (
              <images.inputs.EyeIcon />
            ) : (
              <images.inputs.EyeHideIcon />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !password && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error && errorText && (
        <AppText style={styles.errorText}>{errorText}</AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: verticalScale(48),
  },
  label: {
    ...textStyles(fontSizes.xxs, 500, colors.textColor),
    marginBottom: sizes.v_xxs,
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    ...flexStyles("row", "flex-end", "center"),
    borderRadius: moderateScale(48),
    borderWidth: scale(1),
    borderColor: "transparent",
    height: verticalScale(48),
    backgroundColor: colors.white,
    color: colors.white,
    position: "relative",
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.white40,
  },
  leftIconContainer: {
    paddingLeft: sizes.h_sm,
    position: "absolute",
    left: 0,
  },
  input: {
    flex: 1,
    left: 0,
    right: 0,
    height: "100%",
    overflow: "hidden",
    paddingHorizontal: sizes.h_sm,
    minWidth: 120,
    ...textStyles(fontSizes.xs, 400, colors.textColor),
  },
  inputAndroid: {
    lineHeight: sizes.h_base,
  },
  inputWithLeftIcon: {
    paddingLeft: moderateScale(36),
    left: sizes.h_xs,
  },
  inputCentered: {
    paddingLeft: sizes.h_sm + sizes.h_base,
  },
  clearButton: {
    padding: sizes.h_sm,
  },
  errorText: {
    ...textStyles(fontSizes.xxs, 300, colors.error),
    marginTop: verticalScale(4),
    paddingLeft: sizes.h_sm,
  },
  rightIconContainer: {
    paddingRight: sizes.h_sm,
  },
});
