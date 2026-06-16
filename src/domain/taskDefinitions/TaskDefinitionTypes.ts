import { SortablePaginationRequestInfo } from "../shared";

export enum WorkOrderType {
  Corrective = "Corrective",
  PlannedPreventive = "PlannedPreventive",
}

export enum TimeUnit {
  Seconds = "Seconds",
  Minutes = "Minutes",
  Hours = "Hours",
  Days = "Days",
  Weeks = "Weeks",
  Months = "Months",
  Years = "Years",
}

export interface TaskDefinition {
  id: string;
  description: string;
  estimatedDuration: string;
  type: string; // WorkOrderType as string
}

export interface CreateTaskDefinitionRequest {
  description: string;
  durationValue: number;
  durationUnit: TimeUnit;
  type: WorkOrderType;
}

export interface UpdateTaskDefinitionRequest {
  id: string;
  description?: string;
  durationValue?: number;
  durationUnit?: TimeUnit;
}

export interface TaskDefinitionSearchParams extends SortablePaginationRequestInfo {
  type?: WorkOrderType;
}
