import React, { useEffect, useMemo, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PendingIcon from '@mui/icons-material/Pending';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useForm } from 'react-hook-form';

import { serviceLogSchema } from '../validation/serviceLogSchema';
import {
  createDraftAction,
  deleteDraft,
  markDraftSaved,
  resetToNewDraft,
  setActiveDraft,
  updateDraftValues,
} from '../store/draftsSlice';
import { addLog } from '../store/logsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ServiceLogDraft, ServiceLogFormValues } from '../types/serviceLog';
import { addDaysToIsoDate, parseIsoDateString } from '../utils/date';
import { createId } from '../utils/id';
import { createDefaultServiceLogValues } from '../utils/serviceLogDefaults';
import { normalizeServiceLogValues } from '../utils/serviceLogNormalize';
import ServiceLogFields from './ServiceLogFields';

const DRAFTS_VISIBLE_COUNT = 7;
const DRAFT_ITEM_HEIGHT = 56;

const ServiceLogForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drafts, activeDraftId } = useAppSelector((state) => state.drafts);
  const [isDraftOpen, setIsDraftOpen] = useState(true);

  const activeDraft = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId) ?? null,
    [drafts, activeDraftId],
  );

  const initialValuesRef = useRef<ServiceLogFormValues>(
    activeDraft?.values ?? createDefaultServiceLogValues(),
  );
  const activeDraftRef = useRef<ServiceLogDraft | null>(activeDraft);
  const lastSavedValuesRef = useRef<string>('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<ServiceLogFormValues>({
    defaultValues: initialValuesRef.current,
    resolver: yupResolver(serviceLogSchema),
    mode: 'onChange',
  });
  const watchRef = useRef(watch);

  useEffect(() => {
    activeDraftRef.current = activeDraft;
  }, [activeDraft]);

  useEffect(() => {
    watchRef.current = watch;
  }, [watch]);

  useEffect(() => {
    const nextValues =
      activeDraftRef.current?.values ?? createDefaultServiceLogValues();
    reset(nextValues);
  }, [activeDraftId, reset]);

  const startDate = watch('startDate');
  const watchedValues = watch();
  const saveTimeoutRef = useRef<number | null>(null);

  const completion = useMemo(() => {
    const values = watchedValues ?? {};
    const checks = [
      Boolean(values.providerId?.trim()),
      Boolean(values.serviceOrder?.trim()),
      Boolean(values.carId?.trim()),
      typeof values.odometer === 'number' && Number.isFinite(values.odometer),
      typeof values.engineHours === 'number' && Number.isFinite(values.engineHours),
      Boolean(values.startDate),
      Boolean(values.endDate),
      Boolean(values.type),
      Boolean(values.serviceDescription?.trim()),
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    const percent = Math.round((filled / total) * 100);
    return { filled, total, percent };
  }, [watchedValues]);

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

  useEffect(() => {
    const subscription = watchRef.current((values) => {
      if (!activeDraftId) {
        return;
      }
      const normalized = normalizeServiceLogValues(values as ServiceLogFormValues);
      const serialized = JSON.stringify(normalized);
      if (serialized === lastSavedValuesRef.current) {
        return;
      }
      lastSavedValuesRef.current = serialized;
      dispatch(updateDraftValues({ id: activeDraftId, values: normalized }));

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        dispatch(markDraftSaved(activeDraftId));
      }, 600);
    });

    return () => subscription.unsubscribe();
  }, [activeDraftId, dispatch]);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    },
    [],
  );

  const handleCreateDraft = () => {
    dispatch(createDraftAction());
  };

  const handleDeleteDraft = () => {
    if (!activeDraftId) {
      return;
    }
    if (drafts.length <= 1) {
      dispatch(resetToNewDraft());
      return;
    }
    dispatch(deleteDraft(activeDraftId));
  };

  const handleClearDrafts = () => {
    dispatch(resetToNewDraft());
  };

  const onSubmit = (values: ServiceLogFormValues) => {
    const normalized = normalizeServiceLogValues(values);
    const now = new Date().toISOString();

    dispatch(
      addLog({
        id: createId(),
        createdAt: now,
        updatedAt: now,
        ...normalized,
      }),
    );

    if (!activeDraftId) {
      return;
    }

    if (drafts.length > 1) {
      dispatch(deleteDraft(activeDraftId));
      return;
    }

    dispatch(deleteDraft(activeDraftId));
    dispatch(createDraftAction());
  };

  const statusLabel =
    activeDraft?.status === 'saving'
      ? 'Saving...'
      : activeDraft?.status === 'saved'
        ? 'Draft saved'
        : 'Draft idle';

  return (
    <Card>
      <CardHeader
        title="Service Log Draft"
        action={(
          <IconButton
            onClick={() => setIsDraftOpen((prev) => !prev)}
            aria-label={isDraftOpen ? 'Collapse draft form' : 'Expand draft form'}
            aria-expanded={isDraftOpen}
          >
            <ExpandMoreIcon
              sx={{
                transform: isDraftOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
        )}
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              color={activeDraft?.status === 'saved' ? 'success' : 'default'}
              label={statusLabel}
            />
            {activeDraft?.isSaved && (
              <Typography variant="caption" color="text.secondary">
                Auto-save enabled
              </Typography>
            )}
          </Stack>
        }
      />
      <Collapse in={isDraftOpen} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Box flex={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Drafts
                </Typography>
                <List
                  dense
                  sx={{
                    maxHeight: DRAFTS_VISIBLE_COUNT * DRAFT_ITEM_HEIGHT,
                    overflowY: 'auto',
                    pr: 1,
                  }}
                >
                  {drafts.map((draft) => {
                    const isActive = draft.id === activeDraftId;
                    const StatusIcon = draft.status === 'saving'
                      ? PendingIcon
                      : draft.isSaved
                        ? CheckCircleIcon
                        : RadioButtonUncheckedIcon;
                    return (
                      <ListItemButton
                        key={draft.id}
                        selected={isActive}
                        onClick={() => dispatch(setActiveDraft(draft.id))}
                      >
                        <ListItemIcon>
                          <StatusIcon
                            color={draft.isSaved ? 'success' : 'action'}
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={draft.name}
                          secondary={`Updated ${new Date(draft.updatedAt).toLocaleString()}`}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button variant="outlined" size="small" onClick={handleCreateDraft}>
                    Create Draft
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={handleDeleteDraft}>
                    Delete Draft
                  </Button>
                  <Button variant="text" color="error" size="small" onClick={handleClearDrafts}>
                    Clear All Drafts
                  </Button>
                </Stack>
              </Box>
              <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
              <Box flex={2}>
                <Stack spacing={1.5} component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Draft completion</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {completion.filled}/{completion.total} fields
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={completion.percent} />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`${completion.percent}% complete`}
                        color={completion.percent === 100 ? 'success' : 'default'}
                      />
                    </Stack>
                  </Stack>
                  <ServiceLogFields
                    control={control}
                    errors={errors}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={!isValid}
                  >
                    Create Service Log
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ServiceLogForm;
