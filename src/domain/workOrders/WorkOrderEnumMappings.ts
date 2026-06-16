import {
  WorkOrderType,
  WorkOrderStatus,
  Priority,
  WorkOrderTaskAction,
  MaterialIssuanceType,
  WorkOrderTaskStatus,
} from "./WorkOrderTypes";

// --------------- Number <-> String Maps ---------------
export const workOrderTypeToNumber: Record<WorkOrderType, number> = {
  [WorkOrderType.Corrective]: 0,
  [WorkOrderType.PlannedPreventive]: 1,
};

export const numberToWorkOrderType: Record<number, WorkOrderType> = {
  0: WorkOrderType.Corrective,
  1: WorkOrderType.PlannedPreventive,
};

export const workOrderStatusToNumber: Record<WorkOrderStatus, number> = {
  [WorkOrderStatus.Draft]: 0,
  [WorkOrderStatus.Scheduled]: 1,
  [WorkOrderStatus.InProgress]: 2,
  [WorkOrderStatus.Terminated]: 3,
  [WorkOrderStatus.NotPerformed]: 4,
  [WorkOrderStatus.Closed]: 5,
};

export const numberToWorkOrderStatus: Record<number, WorkOrderStatus> = {
  0: WorkOrderStatus.Draft,
  1: WorkOrderStatus.Scheduled,
  2: WorkOrderStatus.InProgress,
  3: WorkOrderStatus.Terminated,
  4: WorkOrderStatus.NotPerformed,
  5: WorkOrderStatus.Closed,
};

export const priorityToNumber: Record<Priority, number> = {
  [Priority.Normal]: 0,
  [Priority.Urgent]: 1,
  [Priority.Critical]: 2,
};

export const numberToPriority: Record<number, Priority> = {
  0: Priority.Normal,
  1: Priority.Urgent,
  2: Priority.Critical,
};

export const taskActionToNumber: Record<WorkOrderTaskAction, number> = {
  [WorkOrderTaskAction.Perform]: 0,
  [WorkOrderTaskAction.UnPerform]: 1,
  [WorkOrderTaskAction.Skip]: 2,
};

export const numberToTaskAction: Record<number, WorkOrderTaskAction> = {
  0: WorkOrderTaskAction.Perform,
  1: WorkOrderTaskAction.UnPerform,
  2: WorkOrderTaskAction.Skip,
};

export const materialIssuanceTypeToNumber: Record<MaterialIssuanceType, number> = {
  [MaterialIssuanceType.FromInventory]: 0,
  [MaterialIssuanceType.ForApplicationUse]: 1,
};

export const numberToMaterialIssuanceType: Record<number, MaterialIssuanceType> = {
  0: MaterialIssuanceType.FromInventory,
  1: MaterialIssuanceType.ForApplicationUse,
};

export const numberToTaskStatus: Record<number, WorkOrderTaskStatus> = {
  0: WorkOrderTaskStatus.NotPerformed,
  1: WorkOrderTaskStatus.Performed,
  2: WorkOrderTaskStatus.Skipped,
}

// --------------- Conversion Helpers ---------------
export function mapWorkOrderToApi<T extends Record<string, any>>(payload: T): T {
  const mapped: any = { ...payload };

  if (mapped.type && typeof mapped.type === "string") {
    mapped.type = workOrderTypeToNumber[mapped.type as WorkOrderType] ?? mapped.type;
  }
  if (mapped.status && typeof mapped.status === "string") {
    mapped.status = workOrderStatusToNumber[mapped.status as WorkOrderStatus] ?? mapped.status;
  }
  if (mapped.priority && typeof mapped.priority === "string") {
    mapped.priority = priorityToNumber[mapped.priority as Priority] ?? mapped.priority;
  }

  if (Array.isArray(mapped.updates)) {
    mapped.updates = mapped.updates.map((upd: any) => ({
      ...upd,
      action:
        typeof upd.action === "string"
          ? (taskActionToNumber[upd.action as WorkOrderTaskAction] ?? upd.action)
          : upd.action,
    }));
  }

  if (Array.isArray(mapped.materials)) {
    mapped.materials = mapped.materials.map((m: any) => ({
      ...m,
      issuanceType:
        typeof m.issuanceType === "string"
          ? (materialIssuanceTypeToNumber[m.issuanceType as MaterialIssuanceType] ?? m.issuanceType)
          : m.issuanceType,
    }));
  }

  return mapped as T;
}

export function mapWorkOrderFromApi<T extends Record<string, any>>(payload: T): T {
  const mapped: any = { ...payload };

  if (typeof mapped.type === "number") {
    mapped.type = numberToWorkOrderType[mapped.type] ?? mapped.type;
  }
  if (typeof mapped.status === "number") {
    mapped.status = numberToWorkOrderStatus[mapped.status] ?? mapped.status;
  }
  if (typeof mapped.priority === "number") {
    mapped.priority = numberToPriority[mapped.priority] ?? mapped.priority;
  }

  if (Array.isArray(mapped.tasks)) {
    mapped.tasks = mapped.tasks.map((task: any) => ({
      ...task,
      status:
        typeof task.status === "number"
          ? (numberToTaskStatus?.[task.status] ?? task.status) // keep string if not number
          : task.status,
    }));
  }

  if (Array.isArray(mapped.materials)) {
    mapped.materials = mapped.materials.map((m: any) => ({
      ...m,
      issuanceType:
        typeof m.issuanceType === "number"
          ? (numberToMaterialIssuanceType[m.issuanceType] ?? m.issuanceType)
          : m.issuanceType,
    }));
  }

  return mapped as T;
}