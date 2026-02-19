import { useGetActiveRaffles } from "@api/content";
import {
  BaseSubscriptionItemModel,
  CreateSubscriptionRequest,
  useCreateSubscription,
  useCreateSubscriptionUnAuth,
  useGetActiveSubscriptionModels,
} from "@api/subscriptions";
import SubscribeCard, { SubscribeCardItem } from "@components/SubscribeCard";
import { useAuth } from "@context/AuthContext";
import { colors } from "@styles/colors";
import { textStyles } from "@styles/globalStyles";
import { verticalScale } from "@styles/scaling";
import { fontSizes, sizes } from "@styles/sizes";
import { hapticSuccess } from "@utils/hapticHelper";
import { Toast } from "@utils/Toast";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

const SubscribeComponent: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } =
    useGetActiveSubscriptionModels();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { userData, addToUserBasket: updateUserBasketData } = useAuth();
  const { data: activeRaffle } = useGetActiveRaffles();
  const {
    mutateAsync: addSubscriptionToBasket,
    isPending: isLoadingAddToBasket,
    isSuccess: isSuccessAddToBasket,
    isError: isErrorAddToBasket,
  } = useCreateSubscription();

  const {
    mutateAsync: addToBasketAsAnonymous,
    isPending: isLoadingAddToBasketAsAnonymous,
    isSuccess: isSuccessAddToBasketAsAnonymous,
    isError: isErrorAddToBasketAsAnonymous,
  } = useCreateSubscriptionUnAuth();

  const addTicketToBasket = useCallback(
    async (id: string) => {
      if (!data) {
        return;
      }

      const item = data.subscriptionModels.find(
        (sub: BaseSubscriptionItemModel) => sub._id === id
      );
      if (!item) {
        return;
      }

      const model: CreateSubscriptionRequest = {
        subscription: {
          charity: "DEFAULT",
          count: 0,
          extra: item.extra,
          months: 1,
          numOfTickets: item.numOfTickets || 0,
          raffle: activeRaffle?.activeRaffles[0]._id,
          status: "PENDING_BASKET",
          subscriptionModel: item._id,
          totalCost: item.totalCost || 0,
        },
      };
      setLoadingItemId(id);
      const res = userData.isAnonymous
        ? await addToBasketAsAnonymous(model)
        : await addSubscriptionToBasket(model);

      if (res) {
        updateUserBasketData({
          subscriptionId: res.subscription._id,
        });
        hapticSuccess();
        Toast.success({
          message: "Subscription added to the card",
        });
        router.push("/cart?tab=subscriptions");
      }
    },
    [
      data,
      addSubscriptionToBasket,
      addToBasketAsAnonymous,
      userData,
      updateUserBasketData,
      activeRaffle?.activeRaffles,
    ]
  );

  const getData = useMemo(() => {
    if (!data || !data.subscriptionModels) {
      return [];
    }

    return data.subscriptionModels.map((item) => ({
      id: item._id,
      price: item.totalCost / 100,
      period: "month",
      oldTickets: Math.round((item.extra + item.numOfTickets) / 3 / 5) * 5,
      newTickets: item.extra + item.numOfTickets,
      exclusiveText: item.label,
      content: item.details,
    }));
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: SubscribeCardItem }) => (
      <View style={styles.item}>
        <SubscribeCard
          animationEnded={() => setLoadingItemId(null)}
          isSuccess={isSuccessAddToBasket || isSuccessAddToBasketAsAnonymous}
          isError={isErrorAddToBasket || isErrorAddToBasketAsAnonymous}
          item={item}
          isLoading={
            (isLoadingAddToBasket || isLoadingAddToBasketAsAnonymous) &&
            loadingItemId === item.id
          }
          onPress={() => addTicketToBasket(item.id)}
        />
      </View>
    ),
    [
      addTicketToBasket,
      isLoadingAddToBasket,
      isLoadingAddToBasketAsAnonymous,
      isSuccessAddToBasket,
      isSuccessAddToBasketAsAnonymous,
      isErrorAddToBasket,
      isErrorAddToBasketAsAnonymous,
      loadingItemId,
    ]
  );

  return (
    <View style={styles.container}>
      <FlatList<SubscribeCardItem>
        refreshControl={
          <RefreshControl
            tintColor={colors.darkGreen}
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            enabled={!isLoading}
          />
        }
        data={getData}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isLoading ? <ActivityIndicator style={styles.loader} /> : null
        }
      />
    </View>
  );
};

export default SubscribeComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    ...textStyles(fontSizes.xs, 400, colors.black),
    textAlign: "center",
    paddingHorizontal: sizes.h_base,
    lineHeight: fontSizes.xl,
  },
  header: {
    paddingTop: sizes.v_base * 2,
  },
  contentContainer: {
    paddingTop: sizes.v_xxs,
    paddingBottom: verticalScale(40),
  },
  item: {},
  loader: {
    marginVertical: sizes.v_base,
  },
});
