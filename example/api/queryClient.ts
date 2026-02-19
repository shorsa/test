import NetInfo from "@react-native-community/netinfo";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MutationCache, onlineManager, QueryCache, QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { LocalStoreKey, mmkvStore } from "@utils/mmkvStore";
import { BasketQueryKeys } from "./basket/types";
import { CommonQueryKeys } from "./content/types";

onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
        const isOnline = !!(state.isConnected && state.isInternetReachable !== false);
        setOnline(isOnline);
    });
});

const formatQueryKey = (queryKey: unknown): string => {
    if (Array.isArray(queryKey)) {
        return queryKey.map((key) => (typeof key === "object" ? JSON.stringify(key) : String(key))).join(" → ");
    }
    return String(queryKey);
};

const queryCache = new QueryCache({
    onError: (error, query) => {
        if (__DEV__) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const status = (error as any)?.response?.status;

            console.log(
                `%c[QUERY ERROR] %c${formatQueryKey(query.queryKey)}`,
                "color: red; font-weight: bold;",
                "color: orange; font-weight: bold;"
            );
            console.log(`%cStatus: ${status ?? "N/A"} | Message: ${errorMessage}`, "color: red;");
            console.log("%cQuery State:", "color: gray;", query.state);
        }
    },
    onSuccess: (data, query) => {
        if (__DEV__) {
            console.log(
                `%c[QUERY SUCCESS] %c${formatQueryKey(query.queryKey)}`,
                "color: green; font-weight: bold;",
                "color: blue; font-weight: bold;"
            );
        }
    },
});

const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
        if (__DEV__) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const status = (error as any)?.response?.status;
            const mutationKey = mutation.options.mutationKey
                ? formatQueryKey(mutation.options.mutationKey)
                : "Unknown Mutation";

            console.log(
                `%c[MUTATION ERROR] %c${mutationKey}`,
                "color: red; font-weight: bold;",
                "color: orange; font-weight: bold;"
            );
            console.log(`%cStatus: ${status ?? "N/A"} | Message: ${errorMessage}`, "color: red;");
            console.log("%cVariables:", "color: gray;", variables);
        }
    },
    onSuccess: (data, variables, context, mutation) => {
        if (__DEV__) {
            const mutationKey = mutation.options.mutationKey
                ? formatQueryKey(mutation.options.mutationKey)
                : "Unknown Mutation";

            console.log(
                `%c[MUTATION SUCCESS] %c${mutationKey}`,
                "color: green; font-weight: bold;",
                "color: blue; font-weight: bold;"
            );
        }
    },
});



export enum CacheTimeEnum {
    NO_CACHE = 0,
    ONE_HOUR = 1000 * 60 * 60,
    SIX_HOURS = ONE_HOUR * 6,
    TWELVE_HOURS = ONE_HOUR * 12,
    ONE_DAY = ONE_HOUR * 24,
    THREE_DAYS = ONE_DAY * 3,
    ONE_WEEK = ONE_DAY * 7,
    ONE_MONTH = ONE_DAY * 30,
}

export enum CartTabType {
    ORDERS = "single",
    SUBSCRIPTIONS = "subscriptions",
}

export const queryClient = new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
        queries: {
            gcTime: CacheTimeEnum.ONE_DAY,
            staleTime: CacheTimeEnum.ONE_DAY,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 2,
        },
    },
});

const syncStoragePersister = createSyncStoragePersister({
    storage: {
        getItem: (key: string) => mmkvStore.getString(key) ?? null,
        setItem: (key: string, value: string) => mmkvStore.set(key, value),
        removeItem: (key: string) => mmkvStore.remove(key),
    },
    key: LocalStoreKey.CacheBuster,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
});

// Clear old cache format and invalid queries before persisting new one
try {
    const oldCacheKey = "REACT_QUERY_OFFLINE_CACHE";
    if (mmkvStore.contains(oldCacheKey)) {
        mmkvStore.remove(oldCacheKey);
    }

    // Clear the main cache buster key to remove old invalid queries
    const currentCacheKey = LocalStoreKey.CacheBuster;
    const cacheData = mmkvStore.getString(currentCacheKey);
    if (cacheData) {
        try {
            const parsed = JSON.parse(cacheData);
            if (parsed?.clientState?.queries) {
                // Filter out invalid queries with the problematic key
                const validQueries = parsed.clientState.queries.filter((q: any) => {
                    if (!q?.queryKey) return false;
                    const keyStr = JSON.stringify(q.queryKey);
                    return !(
                        keyStr.includes(CommonQueryKeys.HomeContent) &&
                        keyStr.includes(CommonQueryKeys.ActiveRaffles) &&
                        keyStr.includes(CommonQueryKeys.ActiveBonusDraws)
                    );
                });

                if (validQueries.length !== parsed.clientState.queries.length) {
                    parsed.clientState.queries = validQueries;
                    mmkvStore.set(currentCacheKey, JSON.stringify(parsed));
                }
            }
        } catch (parseError) {
            // If parsing fails, just delete the cache
            mmkvStore.remove(currentCacheKey);
        }
    }
} catch (error) {
    // Lazy require to avoid cycle: queryClient → handleCatchError → logoutManager → tokenManager → queryClient
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { handleCatchError } = require("@utils/handleCatchError");
    handleCatchError(error, {}, false);
}

persistQueryClient({
    queryClient,
    persister: syncStoragePersister,
    maxAge: CacheTimeEnum.ONE_DAY,
    dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey[0];

            // Skip basket queries
            if (
                queryKey === BasketQueryKeys.Basket ||
                queryKey === BasketQueryKeys.AnonymousBasket
            ) {
                return false;
            }

            // Skip invalid old format queries (combined keys)
            // if (Array.isArray(query.queryKey) && query.queryKey.length > 1) {
            //   const combinedKey = query.queryKey.join(",");
            //   if (
            //     combinedKey.includes(CommonQueryKeys.HomeContent) &&
            //     combinedKey.includes(CommonQueryKeys.ActiveRaffles) &&
            //     combinedKey.includes(CommonQueryKeys.ActiveBonusDraws)
            //   ) {
            //     return false;
            //   }
            // }

            // Only dehydrate queries that have a queryFn
            return query.state.status === "success";
        },
    },
});
