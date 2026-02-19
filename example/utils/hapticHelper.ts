import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export enum HapticType {
  LIGHT = "light",
  MEDIUM = "medium",
  HEAVY = "heavy",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  SOFT = "soft",
  RIGID = "rigid",
  SELECTION = "selection",
  CLICK = "click",
  TICK = "tick",
  LONG_PRESS = "longPress",
  KEYBOARD_TAP = "keyboardTap",
}

type HapticExecutor = () => Promise<void>;

const selection: HapticExecutor = () => Haptics.selectionAsync();

const impact =
  (style: Haptics.ImpactFeedbackStyle): HapticExecutor =>
  () =>
    Haptics.impactAsync(style);

const notification =
  (type: Haptics.NotificationFeedbackType): HapticExecutor =>
  () =>
    Haptics.notificationAsync(type);

const androidFirst =
  (
    androidType: Haptics.AndroidHaptics,
    fallback: HapticExecutor = selection
  ): HapticExecutor =>
  async () => {
    if (Platform.OS === "android") {
      await Haptics.performAndroidHapticsAsync(androidType);
      return;
    }
    await fallback();
  };

const hapticExecutors: Record<HapticType, HapticExecutor> = {
  [HapticType.LIGHT]: impact(Haptics.ImpactFeedbackStyle.Light),
  [HapticType.MEDIUM]: impact(Haptics.ImpactFeedbackStyle.Medium),
  [HapticType.HEAVY]: impact(Haptics.ImpactFeedbackStyle.Heavy),
  [HapticType.SOFT]: impact(Haptics.ImpactFeedbackStyle.Soft),
  [HapticType.RIGID]: impact(Haptics.ImpactFeedbackStyle.Rigid),
  [HapticType.SUCCESS]: notification(Haptics.NotificationFeedbackType.Success),
  [HapticType.WARNING]: notification(Haptics.NotificationFeedbackType.Warning),
  [HapticType.ERROR]: notification(Haptics.NotificationFeedbackType.Error),
  [HapticType.SELECTION]: selection,
  [HapticType.CLICK]: androidFirst(
    Haptics.AndroidHaptics.Virtual_Key,
    impact(Haptics.ImpactFeedbackStyle.Light)
  ),
  [HapticType.TICK]: androidFirst(
    Haptics.AndroidHaptics.Segment_Tick,
    selection
  ),
  [HapticType.LONG_PRESS]: androidFirst(
    Haptics.AndroidHaptics.Long_Press,
    impact(Haptics.ImpactFeedbackStyle.Heavy)
  ),
  [HapticType.KEYBOARD_TAP]: androidFirst(
    Haptics.AndroidHaptics.Keyboard_Tap,
    selection
  ),
};

export const triggerHaptic = (type: HapticType): void => {
  const executor = hapticExecutors[type];
  if (!executor) {
    return;
  }
  executor().catch(() => null);
};

export const hapticLight = () => triggerHaptic(HapticType.LIGHT);
export const hapticMedium = () => triggerHaptic(HapticType.MEDIUM);
export const hapticHeavy = () => triggerHaptic(HapticType.HEAVY);
export const hapticSuccess = () => triggerHaptic(HapticType.SUCCESS);
export const hapticError = () => triggerHaptic(HapticType.ERROR);
export const hapticWarning = () => triggerHaptic(HapticType.WARNING);
export const hapticSelection = () => triggerHaptic(HapticType.SELECTION);
export const hapticClick = () => triggerHaptic(HapticType.CLICK);
export const hapticTick = () => triggerHaptic(HapticType.TICK);
export const hapticKeyboardTap = () => triggerHaptic(HapticType.KEYBOARD_TAP);
export const hapticLongPress = () => triggerHaptic(HapticType.LONG_PRESS);
