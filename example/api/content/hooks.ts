import { CacheTimeEnum } from '@api/queryClient';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getActiveBonusDraws,
  getActiveRaffles,
  getBonusDrawByRaffleId,
  getCharities,
  getHomeContent,
  getRafflesCountdowns,
  getWinners,
} from './requests';
import {
  CommonQueryKeys,
  CompetitionCountdownDreamHomeModel,
  CompetitionCountdownFixedOddsModel,
  CompetitionCountdownPrizeModel,
} from './types';


const useGetWinners = (year?: string | number, pageCount: number = 10) => {
  return useInfiniteQuery({
    queryKey: [CommonQueryKeys.Winners, year],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: async ({ pageParam = 1 }) => {
      return getWinners({ page: pageParam, year, pageCount });
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.allCount <= pages.length * pageCount) {
        return undefined;
      } else {
        return pages.length + 1;
      }
    },
    initialPageParam: 1,
    enabled: !!year,
  });
};

const useGetCharities = () => {
  return useQuery({
    queryKey: [CommonQueryKeys.Charities],
    staleTime: CacheTimeEnum.ONE_DAY,
    select: data => data.checkoutCharities,
    queryFn: () => getCharities(),
  });
};

const useGetActiveRaffles = () => {
  return useQuery({
    queryKey: [CommonQueryKeys.ActiveRaffles],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: () => getActiveRaffles(),
  });
};

const useGetRafflesCountdowns = () => {
  return useQuery({
    queryKey: [CommonQueryKeys.RafflesCountdowns],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: () => getRafflesCountdowns(),
    select: data => {
      const result: {
        dreamHome?: CompetitionCountdownDreamHomeModel;
        fixedOdds?: CompetitionCountdownFixedOddsModel;
        prize?: CompetitionCountdownPrizeModel;
      } = {};

      for (const item of data) {
        switch (item.competitionType) {
          case 'DREAMHOME':
            result.dreamHome = item as CompetitionCountdownDreamHomeModel;
            break;
          case 'FIXED_ODDS':
            result.fixedOdds = item as CompetitionCountdownFixedOddsModel;
            break;
          case 'PRIZE':
            result.prize = item as CompetitionCountdownPrizeModel;
            break;
          default:
            break;
        }
      }

      return result;
    },
  });
};

const useGetBonusDraw = ({
  raffleId,
  enabled,
}: {
  raffleId?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [CommonQueryKeys.BonusDraw, raffleId],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: () => getBonusDrawByRaffleId({ raffleId: raffleId! }),
    enabled: !!raffleId && enabled,
  });
};

const useGetActiveBonusDraws = () => {
  return useQuery({
    queryKey: [CommonQueryKeys.ActiveBonusDraws],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: () => getActiveBonusDraws(),
  });
};

const useGetHomeContent = () => {
  return useQuery({
    queryKey: [CommonQueryKeys.HomeContent],
    staleTime: CacheTimeEnum.ONE_DAY,
    queryFn: () => getHomeContent(),
  });
};

export {
  useGetActiveBonusDraws,
  useGetActiveRaffles,
  useGetBonusDraw,
  useGetCharities,
  useGetHomeContent,
  useGetRafflesCountdowns,
  useGetWinners
};

