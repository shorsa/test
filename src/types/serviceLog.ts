export type ServiceType = 'planned' | 'unplanned' | 'emergency';

export interface ServiceLogFormValues {
  providerId: string;
  serviceOrder: string;
  carId: string;
  odometer: number | null;
  engineHours: number | null;
  startDate: string;
  endDate: string;
  type: ServiceType;
  serviceDescription: string;
}

export interface ServiceLog extends ServiceLogFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type DraftStatus = 'idle' | 'saving' | 'saved';

export interface ServiceLogDraft {
  id: string;
  name: string;
  values: ServiceLogFormValues;
  status: DraftStatus;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}
