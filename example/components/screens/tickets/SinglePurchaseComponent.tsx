import { useGetActiveRaffles } from "@api/content";
import {
  AddTicketToBasketRequest,
  TicketBundleModel,
  useAddTicketsToBasket,
  useAddTicketsToBasketAsAnonymous,
  useSinglePurchaseTickets,
} from "@api/orders";
import TicketPurchaseCard from "@components/TicketPurchaseCard";
import { useAuth } from "@context/AuthContext";
import { colors } from "@styles/colors";
import { verticalScale } from "@styles/scaling";
import { fullWidth, sizes } from "@styles/sizes";
import { Toast } from "@utils/Toast";
import { hapticSuccess } from "@utils/hapticHelper";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

const SinglePurchaseComponent: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } = useSinglePurchaseTickets();
  const { data: activeRaffles } = useGetActiveRaffles();
  const { userData } = useAuth();
  const {
    mutateAsync: addToBasket,
    isPending: isLoadingAddToBasket,
    isSuccess: isSuccessAddToBasket,
    isError: isErrorAddToBasket,
  } = useAddTicketsToBasket();
  const {
    mutateAsync: addToBasketAsAnonymous,
    isPending: isLoadingAddToBasketAsAnonymous,
    isSuccess: isSuccessAddToBasketAsAnonymous,
    isError: isErrorAddToBasketAsAnonymous,
  } = useAddTicketsToBasketAsAnonymous();

  const [loadingItemTicketBundle, setLoadingItemTicketBundle] = useState<
    number | null
  >(null);


  const sortedBundles = useMemo(() => {
    if (!data?.bundles) return [];

    if (activeRaffles?.activeRaffles.length !== 1) {
      return [...data.bundles].sort((a, b) => a.totalCost - b.totalCost);
    }

    const mostPopular = data.bundles.find((b) => b.isMostPopular);
    const lowestTicketCost = data.bundles.find(
      (b) => b.isLowestTicketCost && b !== mostPopular
    );
    const rest = data.bundles
      .filter((b) => b !== mostPopular && b !== lowestTicketCost)
      .sort((a, b) => a.totalCost - b.totalCost);

    return [
      ...(mostPopular ? [mostPopular] : []),
      ...(lowestTicketCost ? [lowestTicketCost] : []),
      ...rest,
    ];
  }, [data?.bundles, activeRaffles?.activeRaffles.length]);

  const addTicketToBasket = useCallback(
    async (item: TicketBundleModel) => {
      if (!data) {
        return;
      }
      if (loadingItemTicketBundle !== null) {
        return;
      }
      setLoadingItemTicketBundle(item.ticketBundle);
      const model: AddTicketToBasketRequest = {
        bonusDraw: undefined,
        numOfTickets: item.ticketBundle,
        orderType: "DEFAULT",
        prizeId: data.prizeId!,
        prizeType: "raffle",
      };

      const res = userData.isAnonymous
        ? await addToBasketAsAnonymous(model)
        : await addToBasket(model);

      if (res) {
        hapticSuccess();
        Toast.success({ message: "Ticket added to the card" });
        router.push("/cart");
      }
      setLoadingItemTicketBundle(null);
    },
    [
      data,
      addToBasket,
      addToBasketAsAnonymous,
      userData,
      loadingItemTicketBundle,
    ]
  );

  const renderItem = useCallback(
    ({ item }: { item: TicketBundleModel }) => (
      <View
        style={data?.type === "double" ? styles.itemDouble : styles.itemSingle}
      >
        <TicketPurchaseCard
          animationEnded={() => setLoadingItemTicketBundle(null)}
          isSuccess={isSuccessAddToBasket || isSuccessAddToBasketAsAnonymous}
          isError={isErrorAddToBasket || isErrorAddToBasketAsAnonymous}
          item={item}
          type={data?.type ?? "single"}
          onPress={() => addTicketToBasket(item)}
          isLoading={
            (isLoadingAddToBasket || isLoadingAddToBasketAsAnonymous) &&
            loadingItemTicketBundle === item.ticketBundle
          }
        />
      </View>
    ),
    [
      isSuccessAddToBasket,
      isSuccessAddToBasketAsAnonymous,
      isErrorAddToBasket,
      isErrorAddToBasketAsAnonymous,
      loadingItemTicketBundle,
      addTicketToBasket,
      data?.type,
      isLoadingAddToBasket,
      isLoadingAddToBasketAsAnonymous,
    ]
  );

  return (
    <View style={styles.container}>
      {!data ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              tintColor={colors.darkGreen}
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              enabled={!isLoading}
            />
          }
          data={sortedBundles}
          numColumns={data?.type === "double" ? 1 : 2}
          columnWrapperStyle={
            data?.type === "single" ? styles.columnWrapper : undefined
          }
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={
            data?.type === "single"
              ? styles.contentContainer
              : styles.contentContainerDouble
          }
          keyExtractor={(item) => item.ticketBundle.toString()}
          ListFooterComponent={
            isLoading ? <ActivityIndicator style={styles.loader} /> : null
          }
        />
      )}
    </View>
  );
};

export default SinglePurchaseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: sizes.v_xl,
    paddingBottom: verticalScale(40),
    gap: sizes.h_base,
  },
  item: {
    paddingHorizontal: sizes.h_base,
  },
  loader: {
    marginVertical: verticalScale(16),
  },
  columnWrapper: {
    gap: sizes.h_base,
    alignItems: "flex-end",
    paddingHorizontal: sizes.h_base,
  },
  contentContainerDouble: {
    paddingTop: sizes.v_xl,
    paddingBottom: verticalScale(40),
    gap: verticalScale(32),
  },
  itemDouble: {
    paddingHorizontal: sizes.h_base,
  },
  itemSingle: {
    width: fullWidth / 2 - sizes.h_xl,
  },
});
