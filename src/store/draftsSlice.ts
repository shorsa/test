import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ServiceLogDraft, ServiceLogFormValues } from '../types/serviceLog';
import { createId } from '../utils/id';
import { createDefaultServiceLogValues } from '../utils/serviceLogDefaults';

interface DraftsState {
  drafts: ServiceLogDraft[];
  activeDraftId: string | null;
}

const createDraft = (name: string): ServiceLogDraft => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name,
    values: createDefaultServiceLogValues(),
    status: 'saved',
    isSaved: true,
    createdAt: now,
    updatedAt: now,
  };
};

const initialDraft = createDraft('Draft 1');

const initialState: DraftsState = {
  drafts: [initialDraft],
  activeDraftId: initialDraft.id,
};

export const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    createDraft(state) {
      const name = `Draft ${state.drafts.length + 1}`;
      const draft = createDraft(name);
      state.drafts.unshift(draft);
      state.activeDraftId = draft.id;
    },
    setActiveDraft(state, action: PayloadAction<string>) {
      state.activeDraftId = action.payload;
    },
    updateDraftValues(
      state,
      action: PayloadAction<{ id: string; values: ServiceLogFormValues }>,
    ) {
      const draft = state.drafts.find((item) => item.id === action.payload.id);
      if (!draft) {
        return;
      }
      draft.values = action.payload.values;
      draft.status = 'saving';
      draft.isSaved = false;
      draft.updatedAt = new Date().toISOString();
    },
    markDraftSaved(state, action: PayloadAction<string>) {
      const draft = state.drafts.find((item) => item.id === action.payload);
      if (!draft) {
        return;
      }
      draft.status = 'saved';
      draft.isSaved = true;
      draft.updatedAt = new Date().toISOString();
    },
    deleteDraft(state, action: PayloadAction<string>) {
      state.drafts = state.drafts.filter((item) => item.id !== action.payload);
      if (state.activeDraftId === action.payload) {
        state.activeDraftId = state.drafts[0]?.id ?? null;
      }
    },
    clearDrafts(state) {
      state.drafts = [];
      state.activeDraftId = null;
    },
    resetToNewDraft(state) {
      const draft = createDraft('Draft 1');
      state.drafts = [draft];
      state.activeDraftId = draft.id;
    },
  },
});

export const {
  createDraft: createDraftAction,
  setActiveDraft,
  updateDraftValues,
  markDraftSaved,
  deleteDraft,
  clearDrafts,
  resetToNewDraft,
} = draftsSlice.actions;

export default draftsSlice.reducer;
