import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { hapticClick } from "@utils/hapticHelper";

import { colors } from "@styles/colors";
import { flexStyles, textStyles } from "@styles/globalStyles";
import { moderateScale } from "@styles/scaling";
import { fontSizes, fullWidth, sizes } from "@styles/sizes";

import AppText from "./AppText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ACTIVE_OPACITY = 0.8;
const SCROLL_EVENT_THROTTLE = 16;
const TAB_BORDER_RADIUS = moderateScale(40);

export interface TabItem {
  title: string;
  subtitle?: string;
  key: string | number;
  component: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  initialIndex?: number;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onTabChange?: (index: number) => void;
}

/**
 * Horizontal swipeable tabs component with animated indicator.
 * Supports smooth scrolling between tab content and animated tab indicator.
 *
 * @param {TabItem[]} tabs - Array of tab items with title, key, and component
 * @param {number} initialIndex - Initial active tab index
 * @default 0
 * @param {boolean} scrollable - Enable horizontal swipe between tabs
 * @default true
 * @param {StyleProp<ViewStyle>} contentContainerStyle - Custom styles for tab content container
 * @param {(index: number) => void} onTabChange - Callback when active tab changes
 * @returns {React.FC<TabsProps>} The Tabs component
 * @example
 * <Tabs
 *   tabs={[
 *     { key: 'tab1', title: 'Tab 1', component: <Tab1Content /> },
 *     { key: 'tab2', title: 'Tab 2', subtitle: '(5)', component: <Tab2Content /> },
 *   ]}
 *   onTabChange={(index) => console.log('Active tab:', index)}
 * />
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  initialIndex = 0,
  scrollable = true,
  contentContainerStyle,
  onTabChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentScrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(
    new Animated.Value(initialIndex * SCREEN_WIDTH)
  ).current;

  const tabWidth = useMemo(() => {
    return (fullWidth - sizes.h_base * 2) / tabs.length;
  }, [tabs.length]);

  const indicatorTranslateX = useMemo(() => {
    return scrollX.interpolate({
      inputRange: tabs.map((_, i) => i * SCREEN_WIDTH),
      outputRange: tabs.map((_, i) => i * tabWidth),
      extrapolate: "clamp",
    });
  }, [scrollX, tabs, tabWidth]);

  const handleTabPress = useCallback(
    (index: number) => {
      hapticClick();
      setActiveIndex(index);
      contentScrollRef.current?.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
      onTabChange?.(index);
    },
    [onTabChange]
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        onTabChange?.(newIndex);
      }
    },
    [activeIndex, onTabChange]
  );

  const handleScroll = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      {
        useNativeDriver: false,
      }
    );
  }, [scrollX]);

  useEffect(() => {
    if (initialIndex !== undefined && initialIndex !== activeIndex) {
      handleTabPress(initialIndex);
    }
  }, [initialIndex, handleTabPress, activeIndex]);

  const renderTabItem = useCallback(
    (tab: TabItem, index: number) => {
      const isActive = index === activeIndex;

      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, { width: tabWidth }]}
          activeOpacity={ACTIVE_OPACITY}
          onPress={() => {
            handleTabPress(index);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={`${tab.title} tab${
            tab.subtitle ? `, ${tab.subtitle}` : ""
          }`}
        >
          <AppText style={[styles.tabTitle, isActive && styles.tabTitleActive]}>
            {tab.title}
          </AppText>

          {tab.subtitle && (
            <AppText
              style={[styles.tabSubtitle, isActive && styles.tabSubtitleActive]}
            >
              {tab.subtitle}
            </AppText>
          )}
        </TouchableOpacity>
      );
    },
    [activeIndex, tabWidth, handleTabPress]
  );

  const renderTabContent = useCallback(
    (tab: TabItem) => (
      <View
        key={tab.key}
        style={[styles.tabContentContainer, contentContainerStyle]}
      >
        {tab.component}
      </View>
    ),
    [contentContainerStyle]
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsBarWrapper}>
        <View style={styles.tabsBar} accessibilityRole="tablist">
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />

          {tabs.map(renderTabItem)}
        </View>
      </View>

      <Animated.ScrollView
        ref={contentScrollRef}
        horizontal
        scrollEnabled={scrollable}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={SCROLL_EVENT_THROTTLE}
        contentContainerStyle={styles.contentScroll}
      >
        {tabs.map(renderTabContent)}
      </Animated.ScrollView>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightBackground,
    marginBottom: 0,
    flex: 1,
    overflow: "hidden",
  },
  tabsBarWrapper: {
    borderWidth: moderateScale(1),
    borderColor: colors.darkGreen,
    marginHorizontal: sizes.h_base,
    borderRadius: moderateScale(40),
    overflow: "hidden",
  },
  tabsBar: {
    ...flexStyles("row", "center", "center"),
    position: "relative",
    width: "100%",
  },
  tabIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.darkGreen,
    borderRadius: moderateScale(40),
    zIndex: 0,
  },
  tabItem: {
    paddingVertical: sizes.v_xxs,
    paddingHorizontal: sizes.h_xxs,
    ...flexStyles("column", "center", "center"),
    zIndex: 1,
  },
  tabTitle: {
    ...textStyles(fontSizes.xxs, "gravity500", colors.darkGreen),
    textAlign: "center",
  },
  tabTitleActive: {
    color: colors.white,
  },
  tabSubtitle: {
    ...textStyles(fontSizes.xxs, 300, colors.darkGreen),
    textAlign: "center",
  },
  tabSubtitleActive: {
    color: colors.white,
  },
  contentScroll: {
    flexGrow: 0,
  },
  tabContentContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: sizes.h_base,
  },
});
