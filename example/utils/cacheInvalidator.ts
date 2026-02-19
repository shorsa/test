import { queryClient } from "@api/queryClient";
import { handleCatchError } from "./handleCatchError";
import { LocalStore, LocalStoreKey } from "./mmkvStore";

/**
 * Checks if midnight UTC+1 has passed since the last cache invalidation
 */
export const shouldInvalidateCache = async (): Promise<boolean> => {
  try {
    const lastInvalidation = await LocalStore.get(
      LocalStoreKey.LastCacheInvalidation
    );

    if (!lastInvalidation || typeof lastInvalidation !== "string") {
      // If there's no record of the last invalidation, invalidate
      return true;
    }

    const lastInvalidationDate = new Date(lastInvalidation);
    const now = new Date();

    // Convert to UTC+1
    const lastInvalidationUTC1 = new Date(lastInvalidationDate.getTime());
    const nowUTC1 = new Date(now.getTime());

    // Get the midnight date for the last invalidation in UTC+1
    const lastMidnightUTC1 = new Date(lastInvalidationUTC1);
    lastMidnightUTC1.setUTCHours(0, 0, 0, 0);

    // Get the next midnight date after the last invalidation
    const nextMidnightAfterLastInvalidation = new Date(lastMidnightUTC1);
    nextMidnightAfterLastInvalidation.setUTCDate(
      nextMidnightAfterLastInvalidation.getUTCDate() + 1
    );

    // If current time is after midnight and last invalidation was before midnight
    return nowUTC1 >= nextMidnightAfterLastInvalidation;
  } catch (error) {
    if (__DEV__) {
      handleCatchError(error, {}, false);
    }
    return true; // In case of error, invalidate for safety
  }
};

/**
 * Invalidates all cache and saves the invalidation time
 */
export const invalidateAllCache = async (): Promise<void> => {
  try {
    await queryClient.clear();
    await LocalStore.set(
      LocalStoreKey.LastCacheInvalidation,
      new Date().toISOString()
    );
  } catch (error) {
    if (__DEV__) {
      handleCatchError(error, {}, false);
      return;
    }
  }
};

/**
 * Checks and invalidates cache on app start
 */
export const checkAndInvalidateCacheOnAppStart = async () => {
  const shouldInvalidate = await shouldInvalidateCache();
  if (shouldInvalidate) {
    await invalidateAllCache();
  } else {
    const lastInvalidation = await LocalStore.get(
      LocalStoreKey.LastCacheInvalidation
    );
    console.log(
      "[CacheInvalidator] Cache is up to date. Last invalidation:",
      lastInvalidation
    );
  }
};

/**
 * Calculates the time until midnight UTC+1 (for UI)
 */
export const getTimeUntilMidnightUTC1 = (): number => {
  const now = new Date();

  // Get current time in UTC+1
  const utc1Now = new Date(now.getTime());

  // Create date for next midnight in UTC+1
  const tomorrowMidnightUTC1 = new Date(utc1Now);
  tomorrowMidnightUTC1.setUTCHours(0, 0, 0, 0);
  tomorrowMidnightUTC1.setUTCDate(tomorrowMidnightUTC1.getUTCDate() + 1);

  // If midnight has already passed, take the next day
  if (utc1Now >= tomorrowMidnightUTC1) {
    tomorrowMidnightUTC1.setUTCDate(tomorrowMidnightUTC1.getUTCDate() + 1);
  }

  // Calculate the difference in milliseconds
  return tomorrowMidnightUTC1.getTime() - now.getTime();
};

/**
 * Gets the current time in UTC+1 for debugging
 */
export const getCurrentTimeUTC1 = (): string => {
  const now = new Date();
  const utc1Time = new Date(now.getTime());
  return utc1Time.toISOString();
};
