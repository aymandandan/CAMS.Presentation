import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdateWorkOrderTasks } from "@/application/hooks/workOrders/useWorkOrders";
import {
  WorkOrderTaskDto,
  WorkOrderTaskAction,
  WorkOrderTaskStatus,
} from "@/domain/workOrders/WorkOrderTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";

interface Props {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  tasks: WorkOrderTaskDto[];
}

interface TaskUpdateItem {
  taskId: string;
  action: WorkOrderTaskAction;
  actualDurationValue?: number;
  actualDurationUnit?: string;
  notes?: string;
}

// ---------- helpers ----------
const DURATION_UNITS = [
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
];

function mapStatusToAction(status: WorkOrderTaskStatus): WorkOrderTaskAction {
  switch (status) {
    case WorkOrderTaskStatus.Performed:
      return WorkOrderTaskAction.Perform;
    case WorkOrderTaskStatus.Skipped:
      return WorkOrderTaskAction.Skip;
    case WorkOrderTaskStatus.NotPerformed:
    default:
      return WorkOrderTaskAction.UnPerform;
  }
}

function parseDuration(
  duration: string,
): { value: number; unit: string } | null {
  const match = duration.match(/^([\d.]+)\s*(.+)$/);
  if (match) {
    const value = parseFloat(match[1]);
    const rawUnit = match[2].trim().toLowerCase();
    const singular = rawUnit.replace(/s$/, "");
    const validUnits = [
      "second",
      "minute",
      "hour",
      "day",
      "week",
      "month",
      "year",
    ];
    if (!isNaN(value) && validUnits.includes(singular)) {
      const pluralUnit = rawUnit.endsWith("s") ? rawUnit : rawUnit + "s";
      return { value, unit: pluralUnit };
    }
  }
  return null;
}

function TriStateCheckbox({
  status,
  onChange,
}: {
  status: WorkOrderTaskAction | undefined;
  onChange: (action: WorkOrderTaskAction) => void;
}) {
  const getIcon = () => {
    switch (status) {
      case WorkOrderTaskAction.Perform:
        return <CheckBoxIcon color="success" />;
      case WorkOrderTaskAction.Skip:
        return <CloseIcon color="error" />;
      default:
        return <CheckBoxOutlineBlankIcon color="action" />;
    }
  };

  const cycleState = () => {
    if (!status || status === WorkOrderTaskAction.UnPerform) {
      onChange(WorkOrderTaskAction.Perform);
    } else if (status === WorkOrderTaskAction.Perform) {
      onChange(WorkOrderTaskAction.Skip);
    } else {
      onChange(WorkOrderTaskAction.UnPerform);
    }
  };

  return (
    <Tooltip title={status ?? "Not Performed"}>
      <IconButton onClick={cycleState} size="small">
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
}

// ---------- component ----------
export default function WorkOrderTaskUpdateDialog({
  open,
  onClose,
  workOrderId,
  tasks,
}: Props) {
  const [updatesMap, setUpdatesMap] = useState<
    Record<string, TaskUpdateItem | undefined>
  >({});

  const mutation = useUpdateWorkOrderTasks();
  const notifications = useNotifications();

  // Initialize the map whenever the dialog opens
  useEffect(() => {
    if (!open) return;

    const initial: Record<string, TaskUpdateItem> = {};
    tasks.forEach((task) => {
      const parsed = task.actualDuration
        ? parseDuration(task.actualDuration)
        : null;
      initial[task.id] = {
        taskId: task.id,
        action: mapStatusToAction(task.status),
        actualDurationValue: parsed?.value,
        actualDurationUnit: parsed?.unit,
        notes: task.notes ?? "",
      };
    });
    setUpdatesMap(initial);
  }, [open, tasks]);

  const handleActionChange = useCallback(
    (taskId: string, action: WorkOrderTaskAction) => {
      setUpdatesMap((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId]!,
          action,
        },
      }));
    },
    [],
  );

  const handleDurationValueChange = useCallback(
    (taskId: string, value: number) => {
      setUpdatesMap((prev) => {
        const current = prev[taskId]!;
        const task = tasks.find((t) => t.id === taskId);
        const parsedEstimate = task?.estimatedDuration
          ? parseDuration(task.estimatedDuration)
          : null;
        const defaultUnit = parsedEstimate?.unit ?? "hours";

        if (isNaN(value) || value === null || value === undefined) {
          // Clear value and unit if no valid number
          return {
            ...prev,
            [taskId]: {
              ...current,
              actualDurationValue: undefined,
              actualDurationUnit: undefined,
            },
          };
        }

        return {
          ...prev,
          [taskId]: {
            ...current,
            actualDurationValue: value,
            actualDurationUnit: current.actualDurationUnit ?? defaultUnit,
          },
        };
      });
    },
    [tasks],
  );

  const handleDurationUnitChange = useCallback(
    (taskId: string, unit: string) => {
      setUpdatesMap((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId]!,
          actualDurationUnit: unit,
        },
      }));
    },
    [],
  );

  const handleNotesChange = useCallback((taskId: string, notes: string) => {
    setUpdatesMap((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId]!,
        notes,
      },
    }));
  }, []);

  const handleSubmit = () => {
    const updates = Object.values(updatesMap).filter(
      (u): u is TaskUpdateItem => !!u,
    );
    if (updates.length === 0) {
      onClose();
      return;
    }

    // Validate: if actualDurationValue provided, unit must be set
    const invalid = updates.some(
      (u) => u.actualDurationValue != null && !u.actualDurationUnit,
    );
    if (invalid) {
      notifications.show("Please provide a unit for the actual duration.", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    mutation.mutate(
      {
        id: workOrderId,
        data: { workOrderId, updates },
      },
      {
        onSuccess: () => {
          notifications.show("Tasks updated successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          onClose();
        },
        onError: (err) => {
          notifications.show(
            `Failed to update tasks: ${(err as Error).message}`,
            { severity: "error", autoHideDuration: 4000 },
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Tasks</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Click the icon to cycle task status. Provide actual duration if
          applicable.
        </Typography>
        <Stack spacing={2}>
          {tasks.map((task) => {
            const update = updatesMap[task.id];
            if (!update) return null;
            const currentAction = update.action;
            const estimated = task.estimatedDuration;
            const parsedEstimate = estimated ? parseDuration(estimated) : null;

            return (
              <Box key={task.id}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mb: 1, alignItems: "center" }}
                >
                  <TriStateCheckbox
                    status={currentAction}
                    onChange={(action) => handleActionChange(task.id, action)}
                  />

                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                    {task.description || `Task ${task.taskId}`}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Current: {task.status}
                      {estimated && ` · Est: ${estimated}`}
                    </Typography>
                  </Typography>

                  <TextField
                    type="number"
                    size="small"
                    label="Actual Value"
                    placeholder={
                      parsedEstimate ? String(parsedEstimate.value) : undefined
                    }
                    value={update.actualDurationValue ?? ""}
                    onChange={(e) =>
                      handleDurationValueChange(
                        task.id,
                        parseFloat(e.target.value),
                      )
                    }
                    sx={{ width: 100 }}
                    slotProps={{
                      htmlInput: { step: 0.1, min: 0 },
                      inputLabel: { shrink: true },
                    }}
                  />

                  <TextField
                    select
                    size="small"
                    label="Unit"
                    value={
                      update.actualDurationUnit ??
                      parsedEstimate?.unit ??
                      "hours"
                    }
                    onChange={(e) =>
                      handleDurationUnitChange(task.id, e.target.value)
                    }
                    sx={{ width: 110 }}
                  >
                    {DURATION_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <TextField
                  size="small"
                  label="Notes"
                  value={update.notes ?? ""}
                  onChange={(e) => handleNotesChange(task.id, e.target.value)}
                  sx={{ ml: 6, width: "94%" }}
                />
                <Divider sx={{ mt: 1 }} />
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mutation.isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
