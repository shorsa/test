import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ServiceLog } from '../types/serviceLog';

interface LogsState {
  logs: ServiceLog[];
}

const initialState: LogsState = {
  logs: [],
};

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog(state, action: PayloadAction<ServiceLog>) {
      state.logs.unshift(action.payload);
    },
    updateLog(state, action: PayloadAction<ServiceLog>) {
      const index = state.logs.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        return;
      }
      state.logs[index] = action.payload;
    },
    deleteLog(state, action: PayloadAction<string>) {
      state.logs = state.logs.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addLog, updateLog, deleteLog } = logsSlice.actions;

export default logsSlice.reducer;
