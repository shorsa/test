import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { deleteLog, updateLog } from '../store/logsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ServiceLog, ServiceLogFormValues, ServiceType } from '../types/serviceLog';
import { isIsoDateInRange } from '../utils/date';
import { normalizeServiceLogValues } from '../utils/serviceLogNormalize';
import EditServiceLogDialog from './EditServiceLogDialog';

const typeLabelMap: Record<ServiceType, string> = {
  planned: 'Planned',
  unplanned: 'Unplanned',
  emergency: 'Emergency',
};

const typeColorMap: Record<ServiceType, 'success' | 'warning' | 'error'> = {
  planned: 'success',
  unplanned: 'warning',
  emergency: 'error',
};

const formatNumber = (value: number | null, suffix = ''): string => {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toLocaleString()}${suffix}`;
};

const ServiceLogsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((state) => state.logs.logs);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [editingLog, setEditingLog] = useState<ServiceLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceLog | null>(null);

  const summary = useMemo(() => {
    const counts: Record<ServiceType, number> = {
      planned: 0,
      unplanned: 0,
      emergency: 0,
    };
    let odometerTotal = 0;
    let odometerCount = 0;
    let hoursTotal = 0;
    let hoursCount = 0;
    let latestUpdated: string | null = null;

    logs.forEach((log) => {
      counts[log.type] += 1;
      if (typeof log.odometer === 'number' && Number.isFinite(log.odometer)) {
        odometerTotal += log.odometer;
        odometerCount += 1;
      }
      if (typeof log.engineHours === 'number' && Number.isFinite(log.engineHours)) {
        hoursTotal += log.engineHours;
        hoursCount += 1;
      }
      if (!latestUpdated || log.updatedAt > latestUpdated) {
        latestUpdated = log.updatedAt;
      }
    });

    return {
      total: logs.length,
      counts,
      avgOdometer: odometerCount ? Math.round(odometerTotal / odometerCount) : null,
      avgHours: hoursCount ? Math.round(hoursTotal / hoursCount) : null,
      latestUpdated: latestUpdated
        ? new Date(latestUpdated).toLocaleString()
        : '—',
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (typeFilter !== 'all' && log.type !== typeFilter) {
        return false;
      }
      if (rangeStart || rangeEnd) {
        if (!isIsoDateInRange(log.startDate, rangeStart, rangeEnd)) {
          return false;
        }
      }
      if (!query) {
        return true;
      }
      return (
        log.providerId.toLowerCase().includes(query) ||
        log.serviceOrder.toLowerCase().includes(query) ||
        log.carId.toLowerCase().includes(query) ||
        log.serviceDescription.toLowerCase().includes(query) ||
        log.type.toLowerCase().includes(query)
      );
    });
  }, [logs, rangeEnd, rangeStart, search, typeFilter]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }
    dispatch(deleteLog(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSaveEdit = (values: ServiceLogFormValues) => {
    if (!editingLog) {
      return;
    }
    const normalized = normalizeServiceLogValues(values);
    dispatch(
      updateLog({
        ...editingLog,
        ...normalized,
        updatedAt: new Date().toISOString(),
      }),
    );
    setEditingLog(null);
  };

  return (
    <Card>
      <CardHeader
        title="Service Logs"
        subheader={`${filteredLogs.length} of ${logs.length} logs`}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip label={`Total logs: ${summary.total}`} color="primary" variant="outlined" />
            <Chip label={`Planned: ${summary.counts.planned}`} />
            <Chip label={`Unplanned: ${summary.counts.unplanned}`} />
            <Chip label={`Emergency: ${summary.counts.emergency}`} />
            <Chip label={`Avg odometer: ${formatNumber(summary.avgOdometer, ' mi')}`} />
            <Chip label={`Avg hours: ${formatNumber(summary.avgHours, ' h')}`} />
            <Chip label={`Last update: ${summary.latestUpdated}`} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <TextField
                label="Search"
                value={search}

                onChange={(event) => setSearch(event.target.value)}
                placeholder="Provider, order, car ID, type..."
                fullWidth
              />
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                label="Type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as ServiceType | 'all')}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="unplanned">Unplanned</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date From"
              type="date"
              value={rangeStart}
              onChange={(event) => setRangeStart(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Start Date To"
              type="date"
              value={rangeEnd}
              onChange={(event) => setRangeEnd(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {filteredLogs.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                No service logs match the current filters.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Car</TableCell>
                    <TableCell>Odometer</TableCell>
                    <TableCell>Engine Hours</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.providerId}</TableCell>
                      <TableCell>{log.serviceOrder}</TableCell>
                      <TableCell>{log.carId}</TableCell>
                      <TableCell>{log.odometer ?? '-'}</TableCell>
                      <TableCell>{log.engineHours ?? '-'}</TableCell>
                      <TableCell>{log.startDate}</TableCell>
                      <TableCell>{log.endDate}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={typeLabelMap[log.type]}
                          color={typeColorMap[log.type]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{log.serviceDescription}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="Edit service log"
                          onClick={() => setEditingLog(log)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="Delete service log"
                          onClick={() => setDeleteTarget(log)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Stack>
      </CardContent>
      <EditServiceLogDialog
        open={Boolean(editingLog)}
        log={editingLog}
        onClose={() => setEditingLog(null)}
        onSave={handleSaveEdit}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete service log?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This action cannot be undone. The service log will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ServiceLogsTable;
