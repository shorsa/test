import { PageTitle } from "@components/index";
import PostalEntryComponent from "@components/screens/tickets/PostalEntryComponent";
import SinglePurchaseComponent from "@components/screens/tickets/SinglePurchaseComponent";
import SubscribeComponent from "@components/screens/tickets/SubscribeComponent";
import Tabs from "@components/Tabs";

import { sizes } from "@styles/sizes";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

const tabs = [
  {
    title: "Postal entry",
    subtitle: "No purchase necessary",
    key: "postal-entry",
    component: <PostalEntryComponent />,
  },
  {
    title: "Single purchase",
    key: "ticket",
    component: <SinglePurchaseComponent />,
  },
  {
    title: "Subscribe",
    key: "subscriptions",
    component: <SubscribeComponent />,
  },
];

export default function TicketScreen() {
  const params = useLocalSearchParams();
  const tab = params?.tab;
  const initialIndex =
    useMemo(() => {
      if (tab === undefined) return 2;
      if (tab === "ticket") return 1;
      if (tab === "subscriptions") return 2;
      return 0;
    }, [tab]) || 0;

  return (
    <View style={styles.container}>
      <PageTitle title="Ticket bundles" />
      <Tabs
        onTabChange={(index) => {
          router.setParams({
            tab: tabs[index].key,
          });
        }}
        initialIndex={initialIndex}
        scrollable={false}
        contentContainerStyle={styles.tabs}
        tabs={tabs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: sizes.v_lg,
    flex: 1,
  },
  tabs: {
    paddingHorizontal: 0,
  },
});
