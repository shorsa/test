import { ServiceLogFormValues } from '../types/serviceLog';
import { addDaysToIsoDate, getTodayIsoDate } from './date';

export const createDefaultServiceLogValues = (): ServiceLogFormValues => {
  const startDate = getTodayIsoDate();
  return {
    providerId: '',
    serviceOrder: '',
    carId: '',
    odometer: null,
    engineHours: null,
    startDate,
    endDate: addDaysToIsoDate(startDate, 1),
    type: 'planned',
    serviceDescription: '',
  };
};
