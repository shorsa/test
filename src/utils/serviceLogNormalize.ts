import { ServiceLogFormValues } from '../types/serviceLog';

export const normalizeServiceLogValues = (
  values: ServiceLogFormValues,
): ServiceLogFormValues => ({
  ...values,
  providerId: values.providerId.trim(),
  serviceOrder: values.serviceOrder.trim(),
  carId: values.carId.trim(),
  serviceDescription: values.serviceDescription.trim(),
  odometer:
    typeof values.odometer === 'number' && Number.isFinite(values.odometer)
      ? values.odometer
      : null,
  engineHours:
    typeof values.engineHours === 'number' && Number.isFinite(values.engineHours)
      ? values.engineHours
      : null,
});
