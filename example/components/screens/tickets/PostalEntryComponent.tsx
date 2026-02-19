import { Button } from "@components/Button";
import { AppText } from "@components/index";
import { TABS_HEIGHT } from "@components/TabBar";
import { images } from "@constants/images";
import { useAuth } from "@context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "@styles/colors";
import { flexStyles, textStyles } from "@styles/globalStyles";
import { moderateScale, verticalScale } from "@styles/scaling";
import { fontSizes, fullWidth, sizes } from "@styles/sizes";
import { LocalStore, LocalStoreKey } from "@utils/mmkvStore";
import { Router, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const renderFirstPage = ({
  isAuthenticated,
  navigation,
}: {
  isAuthenticated: boolean;
  navigation: Router;
}) => (
  <View style={styles.page}>
    <AppText style={styles.title}>How to enter for free by post</AppText>
    <View style={styles.iconWrapper}>
      <View style={styles.icon}>
        <images.tabIcons.ProfileActiveIcon />
        <View
          style={[
            styles.rightLine,
            { width: fullWidth / 2 - sizes.h_base + fullWidth * 0.3 },
          ]}
        />
      </View>
    </View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <AppText style={styles.text}>
        Raffle House offers a postal entry for its competitions. Just like the
        paid method of entering its competitions, the postal method requires
        that you create an online account and accept our T&Cs. This is so that
        we can verify your entry details and provide you with an electronic
        record of your entry.
      </AppText>
      {!isAuthenticated && (
        <>
          <AppText style={styles.text}>
            Click the button below to create an account.
          </AppText>
          <Button
            hitSlop={moderateScale(10)}
            text="Create an account"
            onPress={() => router.push("/(auth)/sign-up")}
          />
        </>
      )}
    </ScrollView>
  </View>
);

const renderSecondPage = () => (
  <View style={styles.page}>
    <AppText style={styles.title}>How to enter for free by post</AppText>
    <View style={styles.iconWrapper}>
      <View style={styles.icon}>
        <View style={styles.leftLine} />
        <images.icons.EditListIcon />
        <View style={styles.rightLine} />
      </View>
    </View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <AppText style={styles.text}>
        On a blank sheet of paper write your full name, date of birth, telephone
        number, email address, and the title of the competition you are
        submitting an entry for. Please refer to the individual product pages
        for competition titles. Examples of these can be found in our T&Cs. This
        information must match the information that you use to create your
        online account and needs to be written legibly otherwise the entry may
        be deemed invalid.
      </AppText>
    </ScrollView>
  </View>
);

const renderThirdPage = () => (
  <View style={styles.page}>
    <AppText style={styles.title}>How to enter for free by post</AppText>
    <View style={styles.iconWrapper}>
      <View style={styles.icon}>
        <View style={styles.leftLine} />
        <images.icons.OpenListIcon />
        <View style={styles.rightLine} />
      </View>
    </View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <AppText style={styles.text}>
        We have appointed Civica Election Services, formerly known as Electoral
        Reform Services (ERS), as our independent scrutineers to administer this
        competition. They have over 100 years&apos; experience in administering
        elections, ballots and competitions for a wide range of clients
        including TV programmes and various lottery projects. Please send the
        sheet of paper in an envelope to the following address via first- or
        second-class post to:
      </AppText>
      <View style={styles.textBoldWrapper}>
        <AppText style={styles.textBold}>Raffle House Postal Entry</AppText>
        <AppText style={styles.textBold}>Civica Election Services</AppText>
        <AppText style={styles.textBold}>33 Clarendon Road</AppText>
        <AppText style={styles.textBold}>London</AppText>
        <AppText style={styles.textBold}>N8 0NW</AppText>
      </View>
    </ScrollView>
  </View>
);

const renderFourthPage = () => (
  <View style={styles.page}>
    <AppText style={styles.title}>How to enter for free by post</AppText>
    <View style={styles.iconWrapper}>
      <View style={styles.icon}>
        <View style={styles.leftLine} />
        <images.icons.OpenListIcon />
      </View>
    </View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <AppText style={styles.text}>
        A maximum of one entry can be made per envelope received.
      </AppText>
      <AppText style={styles.text}>
        Postal entries are treated in exactly the same way as paid entries for
        the purposes of determining a winner. However, there is a difference in
        the deadlines for postal entries for the property competition.
      </AppText>
      <AppText style={styles.text}>
        Our property draw closes at midnight on its final day; the corresponding
        cut-off for postal entries will be that they are received and processed
        before 5pm four business days later.
      </AppText>
      <AppText style={styles.text}>
        One postal entry has an equal chance of winning as any one paid entry.
        If a postal entry wins a prize there will be no further purchase or
        payment necessary to be notified of the win or to receive the prize. If
        the above steps are not followed as described, then a postal entry will
        be invalid.{" "}
      </AppText>
      <AppText style={styles.text}>
        You will not be notified if your entry is invalid and only valid entries
        will appear on your online account.
      </AppText>
    </ScrollView>
  </View>
);

const pages = [
  renderFirstPage,
  renderSecondPage,
  renderThirdPage,
  renderFourthPage,
];

const PostalEntryComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ tab: string }>();

  const [currentPage, setCurrentPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [hasUserSwiped, setHasUserSwiped] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const fingerOpacity = useSharedValue(0);
  const fingerTranslateX = useSharedValue(0);
  const fingerScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const scrollX = useSharedValue(0);

  const hideSwipeHint = useCallback(() => {
    if (!showSwipeHint) {
      return;
    }

    fingerOpacity.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 300 });
    fingerScale.value = withTiming(1, { duration: 200 });
    fingerTranslateX.value = withTiming(0, { duration: 300 });
    scrollX.value = withTiming(0, { duration: 300 });

    setTimeout(() => {
      setShowSwipeHint(false);

      setHasUserSwiped(true);
    }, 350);
  }, [
    fingerOpacity,
    textOpacity,
    fingerScale,
    fingerTranslateX,
    scrollX,
    showSwipeHint,
  ]);

  const startSwipeHintAnimation = useCallback(() => {
    if (!showSwipeHint || hasUserSwiped) {
      return;
    }

    fingerOpacity.value = withTiming(1, { duration: 500 });
    textOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    fingerScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      3,
      true
    );

    fingerTranslateX.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-100, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.quad) })
        ),
        2,
        false
      )
    );

    scrollX.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(SCREEN_WIDTH * 0.1, {
            duration: 1200,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.quad) })
        ),
        2,
        false
      )
    );

    setTimeout(() => {
      if (showSwipeHint && !hasUserSwiped) {
        hideSwipeHint();
      }
    }, 6000);
  }, [
    fingerOpacity,
    textOpacity,
    fingerTranslateX,
    fingerScale,
    scrollX,
    hideSwipeHint,
    showSwipeHint,
    hasUserSwiped,
  ]);

  useFocusEffect(
    useCallback(() => {
      const swipeTicketHintHidden = LocalStore.get(
        LocalStoreKey.SwipeTicketHintHidden
      );

      if (swipeTicketHintHidden) {
        hideSwipeHint();
      }
      if (
        !hasUserSwiped &&
        showSwipeHint &&
        !swipeTicketHintHidden &&
        params?.tab === "postal-entry"
      ) {
        const showHintTimeout = setTimeout(() => {
          startSwipeHintAnimation();
        }, 1500);

        return () => clearTimeout(showHintTimeout);
      }
    }, [
      startSwipeHintAnimation,
      hasUserSwiped,
      showSwipeHint,
      params?.tab,
      hideSwipeHint,
    ])
  );

  const handleScroll = (event: any) => {
    LocalStore.set(LocalStoreKey.SwipeTicketHintHidden, true);
    const pageIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setCurrentPage(pageIndex);
  };

  const animatedFingerStyle = useAnimatedStyle(() => ({
    opacity: fingerOpacity.value,
    transform: [
      { translateX: fingerTranslateX.value },
      { scale: fingerScale.value },
    ],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedScrollViewStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.value }],
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {pages.map((page, index) => (
          <Animated.View
            key={index}
            style={[styles.page, animatedScrollViewStyle]}
          >
            {page({ isAuthenticated, navigation: router })}
          </Animated.View>
        ))}
      </ScrollView>

      {showSwipeHint && !hasUserSwiped && (
        <View style={styles.fingerHint}>
          <View style={styles.fingerContainer}>
            <Animated.View style={[styles.finger, animatedFingerStyle]} />
            <Animated.Text style={[styles.swipeText, animatedTextStyle]}>
              Swipe to see more
            </Animated.Text>
          </View>
        </View>
      )}

      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default PostalEntryComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingBottom: TABS_HEIGHT,
  },
  text: {
    ...textStyles(fontSizes.xs, 400),
    lineHeight: moderateScale(22),
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    marginTop: sizes.v_lg,
    ...textStyles(fontSizes.base, "gravity500"),
  },
  iconWrapper: {
    paddingTop: sizes.v_xl,
    ...flexStyles("row", "center", "center"),
    position: "relative",
  },
  icon: {
    width: moderateScale(48),
    height: moderateScale(48),
    backgroundColor: colors.darkGreen,
    borderRadius: moderateScale(100),
    ...flexStyles("row", "center", "center"),
  },
  rightLine: {
    width: fullWidth / 2 - sizes.h_base,
    position: "absolute",
    left: moderateScale(48),
    zIndex: 100,
    height: moderateScale(1),
    backgroundColor: colors.darkGreen,
  },
  leftLine: {
    width: fullWidth / 2 - sizes.h_base,
    position: "absolute",
    right: moderateScale(48),
    zIndex: 100,
    height: moderateScale(1),
    backgroundColor: colors.darkGreen,
  },
  content: {
    paddingHorizontal: sizes.h_base,
    paddingTop: sizes.v_xl,
    gap: sizes.v_base,
    paddingBottom: TABS_HEIGHT,
  },
  textBold: {
    ...textStyles(fontSizes.md, 500),
  },
  textBoldWrapper: {
    gap: verticalScale(6),
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: sizes.v_base,
    position: "absolute",
    top: "88%",
    alignSelf: "center",
    opacity: 0.4,
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(4),
    marginHorizontal: moderateScale(4),
  },
  activeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: colors.darkGreen,
  },
  inactiveDot: {
    backgroundColor: colors.lightGrey,
    opacity: 0.5,
  },
  fingerHint: {
    position: "absolute",
    bottom: "15%",
    alignSelf: "center",
    zIndex: 1000,
    alignItems: "center",
  },
  fingerContainer: {
    alignItems: "center",
    gap: verticalScale(12),
  },
  finger: {
    width: moderateScale(36),
    height: moderateScale(44),
    backgroundColor: colors.darkGreen,
    borderRadius: moderateScale(18),
    opacity: 0.95,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: moderateScale(6),
    },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 10,
    borderWidth: moderateScale(3),
    borderColor: colors.white,
  },
  swipeText: {
    ...textStyles(fontSizes.xs, 500),
    color: colors.darkGreen,
    textAlign: "center",
    backgroundColor: colors.lightBackground,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(24),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: moderateScale(3),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(6),
    elevation: 5,
    borderWidth: moderateScale(1),
    borderColor: colors.darkGreen,
    opacity: 0.9,
  },
});
