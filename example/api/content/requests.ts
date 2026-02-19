import api from '@api/axios.interceptor';
import {ApiEndpoints} from '@api/apiEndpoints';
import {handleCatchError} from '@utils/handleCatchError';
import {
  ActiveRafflesResponse,
  RafflesCountdownsResponse,
  BonusDrawResponse,
  WinnersResponse,
  CharitiesResponse,
  HomeContentResponse,
} from './types';

const getWinners = async ({
  page,
  year,
  pageCount,
}: {
  page: number;
  year?: number | string;
  pageCount: number;
}) => {
  try {
    const response = await api.get<WinnersResponse>(
      ApiEndpoints.content.winners,
      {
        params: {
          pageNumber: page,
          pageCount,
          year,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleCatchError(error, {page, year, pageCount});
    throw error;
  }
};

const getRafflesCountdowns = async () => {
  try {
    const response = await api.get<RafflesCountdownsResponse[]>(
      ApiEndpoints.content.rafflesCountdowns,
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

const getActiveRaffles = async () => {
  try {
    const response = await api.get<ActiveRafflesResponse>(
      ApiEndpoints.content.activeRaffles,
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

const getBonusDrawByRaffleId = async ({raffleId}: {raffleId: string}) => {
  try {
    const response = await api.post<BonusDrawResponse[]>(
      ApiEndpoints.content.getBonusDrawByRaffleId,
      {
        raffleId: raffleId,
      },
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

const getActiveBonusDraws = async () => {
  try {
    const response = await api.get<BonusDrawResponse[]>(
      ApiEndpoints.content.getActiveBonusDraws,
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

const getCharities = async () => {
  try {
    const response = await api.get<CharitiesResponse>(
      ApiEndpoints.content.charities,
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

const getHomeContent = async () => {
  try {
    const response = await api.get<HomeContentResponse>(
      ApiEndpoints.content.homeContent,
    );
    return response.data;
  } catch (error) {
    handleCatchError(error);
    throw error;
  }
};

export {
  getActiveRaffles,
  getWinners,
  getRafflesCountdowns,
  getBonusDrawByRaffleId,
  getActiveBonusDraws,
  getCharities,
  getHomeContent,
};
