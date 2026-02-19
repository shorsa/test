import * as yup from 'yup';

import { ServiceLogFormValues, ServiceType } from '../types/serviceLog';
import { parseIsoDateString } from '../utils/date';

const isValidIsoDate = (value?: string): boolean => {
  if (!value) {
    return false;
  }
  return Boolean(parseIsoDateString(value));
};

export const serviceLogSchema: yup.ObjectSchema<ServiceLogFormValues> = yup
  .object({
    providerId: yup.string().trim().required('Provider ID is required'),
    serviceOrder: yup.string().trim().required('Service order is required'),
    carId: yup.string().trim().required('Car ID is required'),
    odometer: yup
      .number()
      .typeError('Odometer must be a number')
      .nullable()
      .defined()
      .moreThan(0, 'Odometer must be greater than 0')
      .test(
        'odometer-required',
        'Odometer is required',
        (value) => value !== null && value !== undefined,
      ),
    engineHours: yup
      .number()
      .typeError('Engine hours must be a number')
      .nullable()
      .defined()
      .moreThan(0, 'Engine hours must be greater than 0')
      .test(
        'engine-hours-required',
        'Engine hours is required',
        (value) => value !== null && value !== undefined,
      ),
    startDate: yup
      .string()
      .required('Start date is required')
      .test('valid-start-date', 'Start date is invalid', isValidIsoDate),
    endDate: yup
      .string()
      .required('End date is required')
      .test('valid-end-date', 'End date is invalid', isValidIsoDate)
      .test('end-date-range', 'End date cannot be before start date', function (value) {
        const startDate = this.parent?.startDate as string | undefined;
        if (!value || !startDate) {
          return false;
        }
        const startDateValue = parseIsoDateString(startDate);
        const endDateValue = parseIsoDateString(value);
        if (!startDateValue || !endDateValue) {
          return false;
        }
        return endDateValue >= startDateValue;
      }),
    type: yup
      .mixed<ServiceType>()
      .oneOf(['planned', 'unplanned', 'emergency'], 'Select a valid service type')
      .required('Service type is required'),
    serviceDescription: yup
      .string()
      .trim()
      .required('Service description is required'),
  })
  .required();
