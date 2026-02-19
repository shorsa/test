import React from 'react';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { ServiceLogFormValues } from '../types/serviceLog';

interface ServiceLogFieldsProps {
  control: Control<ServiceLogFormValues>;
  errors: FieldErrors<ServiceLogFormValues>;
}

const ServiceLogFields: React.FC<ServiceLogFieldsProps> = ({
  control,
  errors,
}) => {
  const startDate = useWatch({ control, name: 'startDate' });

  return (
    <Grid container spacing={1.5}>
    <Grid size={{ xs: 12, md: 4 }}>
      <Controller
        name="providerId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Provider ID"
            error={Boolean(errors.providerId)}
            helperText={errors.providerId?.message}
            fullWidth
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Controller
        name="serviceOrder"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Service Order"
            error={Boolean(errors.serviceOrder)}
            helperText={errors.serviceOrder?.message}
            fullWidth
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Controller
        name="carId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Car ID"
            error={Boolean(errors.carId)}
            helperText={errors.carId?.message}
            fullWidth
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="odometer"
        control={control}
        render={({ field }) => (
          <TextField
            label="Odometer (mi)"
            type="number"
            value={field.value ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              field.onChange(value === '' ? null : Number(value));
            }}
            error={Boolean(errors.odometer)}
            helperText={errors.odometer?.message}
            fullWidth
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="engineHours"
        control={control}
        render={({ field }) => (
          <TextField
            label="Engine Hours"
            type="number"
            value={field.value ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              field.onChange(value === '' ? null : Number(value));
            }}
            error={Boolean(errors.engineHours)}
            helperText={errors.engineHours?.message}
            fullWidth
            slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Start Date"
            type="date"
            error={Boolean(errors.startDate)}
            helperText={errors.startDate?.message}
            fullWidth
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="endDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="End Date"
            type="date"
            error={Boolean(errors.endDate)}
            helperText={errors.endDate?.message}
            fullWidth
            slotProps={{ htmlInput: { min: startDate || undefined } }}
            size="small"
          />
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={Boolean(errors.type)} size="small">
            <InputLabel id="service-type-label">Service Type</InputLabel>
            <Select
              {...field}
              labelId="service-type-label"
              label="Service Type"
              size="small"
            >
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="unplanned">Unplanned</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </Select>
            <FormHelperText>{errors.type?.message}</FormHelperText>
          </FormControl>
        )}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name="serviceDescription"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Service Description"
            error={Boolean(errors.serviceDescription)}
            helperText={errors.serviceDescription?.message}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
        )}
      />
    </Grid>
    </Grid>
  );
};

export default ServiceLogFields;
