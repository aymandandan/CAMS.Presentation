import { SortablePaginationRequestInfo } from "../shared";

// --------------- Enums ---------------
export enum WorkOrderType {
  Corrective = "Corrective",
  PlannedPreventive = "PlannedPreventive",
}

export enum WorkOrderStatus {
  Draft = "Draft",
  Scheduled = "Scheduled",
  InProgress = "InProgress",
  Terminated = "Terminated",
  NotPerformed = "NotPerformed",
  Closed = "Closed",
}

export enum Priority {
  Normal = "Normal",
  Urgent = "Urgent",
  Critical = "Critical",
}

export enum MaterialIssuanceType {
  FromInventory = "FromInventory",
  ForApplicationUse = "ForApplicationUse", // maps to IsApplicationUsed logic
}

export enum WorkOrderTaskStatus {
  NotPerformed = "NotPerformed",
  Performed = "Performed",
  Skipped = "Skipped",
}

// --------------- DTOs ---------------
export interface WorkOrderListItemDto {
  id: string;
  code: string;
  description: string;
  type: WorkOrderType; // string representation of WorkOrderType
  status: WorkOrderStatus; // string representation of WorkOrderStatus
  priority: Priority; // string representation of Priority
  scheduledDate?: string;
  equipmentId: string;
  equipment: string;
}

export interface WorkOrderTaskDto {
  id: string;
  taskId: string;
  description: string;
  order: number;
  status: WorkOrderTaskStatus; // "NotPerformed", "Performed", "Skipped"
  actualDuration?: string;
  estimatedDuration: string;
  notes?: string;
}

export interface MaterialIssuanceDto {
  id: string;
  itemId: string;
  itemName: string;
  issuanceType: MaterialIssuanceType; // MaterialIssuanceType as string
  storeId?: string;
  storeCode?: string;
  quantity: number;
  returnedQuantity: number;
  quantityUnit: string;
  isReturned: boolean;
}

export interface WorkOrderDetailsDto {
  id: string;
  code: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: Priority;
  equipmentId: string;
  equipment: string;
  locationPath: string;
  planId?: string;
  plan?: string; // plan code/name
  planCycle?: string; // e.g. "30 days"
  categoryName: string;
  scheduledDate?: string;
  notes?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  tasks: WorkOrderTaskDto[];
  materialsIssued: MaterialIssuanceDto[]; // renamed from 'materials'
  materialRequirements: MaterialRequirementDetailsDto[];
}

// --------------- Input Types (for commands) ---------------
export interface WorkOrderTaskInput {
  taskId: string;
  order: number;
}

export interface MaterialIssuanceInput {
  issuanceType: MaterialIssuanceType;
  itemId: string;
  storeId?: string; // required when type is FromInventory
  quantity: number;
}

export interface MaterialRequirementInput {
  itemId: string;
  quantity: number;
  unitOfMeasure: string;
}

export interface MaterialRequirementDetailsDto {
  itemId: string;
  itemSku: string;
  itemName: string;
  itemDescription?: string;
  quantity: number;
  unitOfMeasure: string;
}

// --------------- Commands ---------------
export interface CreateCorrectiveWorkOrderCommand {
  equipmentId: string;
  description: string;
  priority: Priority;
  tasks: WorkOrderTaskInput[];
  materialRequirements?: MaterialRequirementInput[]; // new
  notes?: string;
}

export interface CreatePreventiveWorkOrderCommand {
  equipmentId: string;
  planId: string;
  description: string;
  scheduledDate?: string;
  priority: Priority;
  notes?: string;
}

export interface UpdateWorkOrderDetailsCommand {
  workOrderId: string;
  description?: string;
  priority?: Priority;
  tasks?: WorkOrderTaskInput[]; // null => no update, not null => final tasks list
  materialRequirements?: MaterialRequirementInput[];
  notes?: string;
}

export interface TaskStatusUpdate {
  taskId: string;
  action: WorkOrderTaskAction;
  actualDurationValue?: number;
  actualDurationUnit?: string;
  notes?: string;
}

export enum WorkOrderTaskAction {
  Perform = "Perform",
  UnPerform = "UnPerform",
  Skip = "Skip",
}

export interface UpdateWorkOrderTasksCommand {
  workOrderId: string;
  updates: TaskStatusUpdate[];
}

export interface AssignWorkOrderCommand {
  workOrderId: string;
  employeeId: string;
}

export interface ScheduleWorkOrderCommand {
  workOrderId: string;
  scheduledDate: string;
}

export interface StartWorkOrderCommand {
  workOrderId: string;
  notes?: string;
}

export interface TerminateWorkOrderCommand {
  workOrderId: string;
  notes?: string;
}

export interface CancelWorkOrderCommand {
  workOrderId: string;
  reason?: string;
}

export interface IssueMaterialsCommand {
  workOrderId: string;
  materials: MaterialIssuanceInput[];
}

export interface MaterialReturnItemInput {
  materialIssuanceId: string;
  returnedQuantity: number;
}

export interface ReturnMaterialsCommand {
  workOrderId: string;
  items: MaterialReturnItemInput[];
}

// --------------- Query / Filters ---------------
export interface GetFilteredWorkOrdersQuery extends SortablePaginationRequestInfo {
  status?: WorkOrderStatus;
  type?: WorkOrderType;
  fromDate?: string;
  toDate?: string;
  priority?: Priority;
  equipmentId?: string;
  planId?: string;
  isPaginated?: boolean;
}
