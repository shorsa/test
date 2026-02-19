import React, { useEffect, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import { serviceLogSchema } from '../validation/serviceLogSchema';
import { ServiceLog, ServiceLogFormValues } from '../types/serviceLog';
import { addDaysToIsoDate, parseIsoDateString } from '../utils/date';
import { createDefaultServiceLogValues } from '../utils/serviceLogDefaults';
import ServiceLogFields from './ServiceLogFields';

interface EditServiceLogDialogProps {
  open: boolean;
  log: ServiceLog | null;
  onClose: () => void;
  onSave: (values: ServiceLogFormValues) => void;
}

const EditServiceLogDialog: React.FC<EditServiceLogDialogProps> = ({
  open,
  log,
  onClose,
  onSave,
}) => {
  const defaultValues = useMemo<ServiceLogFormValues>(() => {
    if (!log) {
      return createDefaultServiceLogValues();
    }
    return {
      providerId: log.providerId,
      serviceOrder: log.serviceOrder,
      carId: log.carId,
      odometer: log.odometer,
      engineHours: log.engineHours,
      startDate: log.startDate,
      endDate: log.endDate,
      type: log.type,
      serviceDescription: log.serviceDescription,
    };
  }, [log]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<ServiceLogFormValues>({
    defaultValues,
    resolver: yupResolver(serviceLogSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const startDate = useWatch({ control, name: 'startDate' });

  useEffect(() => {
    if (!startDate) {
      return;
    }
    const nextEndDate = addDaysToIsoDate(startDate, 1);
    const currentEndDate = getValues('endDate');

    if (!currentEndDate) {
      setValue('endDate', nextEndDate, { shouldDirty: true, shouldValidate: true });
      return;
    }

    const startDateValue = parseIsoDateString(startDate);
    const endDateValue = parseIsoDateString(currentEndDate);
    if (!startDateValue || !endDateValue) {
      setValue('endDate', nextEndDate, { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (endDateValue < startDateValue) {
      setValue('endDate', nextEndDate, { shouldDirty: true, shouldValidate: true });
    }
  }, [getValues, setValue, startDate]);

  const handleSave = (values: ServiceLogFormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Service Log</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <ServiceLogFields control={control} errors={errors} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(handleSave)} disabled={!isValid}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServiceLogDialog;
