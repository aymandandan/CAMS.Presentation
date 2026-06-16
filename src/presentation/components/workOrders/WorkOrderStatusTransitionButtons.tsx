import { useCallback, useState, useMemo } from "react";
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  WorkOrderDetailsDto,
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from "@/domain/workOrders/WorkOrderTypes";
import {
  useScheduleWorkOrder,
  useStartWorkOrder,
  useTerminateWorkOrder,
  useCancelWorkOrder,
} from "@/application/hooks/workOrders/useWorkOrders";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Props {
  workOrder: WorkOrderDetailsDto;
  onSuccess?: () => void;
}

type ConfirmAction =
  | "terminate"
  | "cancel"
  | "start"
  | "terminate-incomplete"
  | null;

export default function StatusTransitionButtons({
  workOrder,
  onSuccess,
}: Props) {
  const notifications = useNotifications();

  const scheduleMutation = useScheduleWorkOrder();
  const startMutation = useStartWorkOrder();
  const terminateMutation = useTerminateWorkOrder();
  const cancelMutation = useCancelWorkOrder();

  // Schedule dialog state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  // Note dialog state for start/terminate/cancel
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [note, setNote] = useState("");

  // Missing employee dialog
  const [noEmployeeOpen, setNoEmployeeOpen] = useState(false);

  // Task evaluation for termination
  const { notPerformedCount, skippedCount, hasIncompleteTasks } =
    useMemo(() => {
      const tasks = workOrder.tasks || [];
      const notPerformed = tasks.filter(
        (t) => t.status === WorkOrderTaskStatus.NotPerformed,
      ).length;
      const skipped = tasks.filter(
        (t) => t.status === WorkOrderTaskStatus.Skipped,
      ).length;
      return {
        notPerformedCount: notPerformed,
        skippedCount: skipped,
        hasIncompleteTasks: notPerformed + skipped > 0,
      };
    }, [workOrder.tasks]);

  // Open schedule dialog with default date (today + 1 hour)
  const openScheduleDialog = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setScheduledDate(now.toISOString().slice(0, 16));
    setScheduleOpen(true);
  };

  const handleScheduleConfirm = useCallback(() => {
    scheduleMutation.mutate(
      {
        id: workOrder.id,
        data: {
          workOrderId: workOrder.id,
          scheduledDate: new Date(scheduledDate).toISOString(),
        },
      },
      {
        onSuccess: () => {
          notifications.show("Work order scheduled.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          setScheduleOpen(false);
          onSuccess?.();
        },
        onError: (error) => {
          notifications.show(`Failed: ${(error as Error).message}`, {
            severity: "error",
            autoHideDuration: 3000,
          });
        },
      },
    );
  }, [workOrder.id, scheduledDate, scheduleMutation, notifications, onSuccess]);

  // Open start dialog only if an employee is assigned
  const handleStartClick = () => {
    if (!workOrder.assignedEmployeeId) {
      setNoEmployeeOpen(true);
      return;
    }
    openNoteDialog("start");
  };

  // Terminate click: if incomplete tasks, open the special confirmation
  const handleTerminateClick = () => {
    if (hasIncompleteTasks) {
      setConfirmAction("terminate-incomplete");
      setNote(""); // note not needed but keep clean
    } else {
      openNoteDialog("terminate");
    }
  };

  // Note dialog handlers (start/cancel)
  const openNoteDialog = (action: ConfirmAction) => {
    setConfirmAction(action);
    setNote("");
  };
  const closeNoteDialog = () => {
    setConfirmAction(null);
    setNote("");
  };

  // Confirm with note for start, terminate (complete), cancel
  const handleConfirmWithNote = useCallback(() => {
    if (!confirmAction) return;

    switch (confirmAction) {
      case "start":
        startMutation.mutate(
          {
            id: workOrder.id,
            data: {
              workOrderId: workOrder.id,
              notes: note.trim() || undefined,
            },
          },
          {
            onSuccess: () => {
              notifications.show("Work order started.", {
                severity: "success",
                autoHideDuration: 3000,
              });
              onSuccess?.();
              closeNoteDialog();
            },
            onError: (error) => {
              notifications.show(`Failed: ${(error as Error).message}`, {
                severity: "error",
                autoHideDuration: 3000,
              });
            },
          },
        );
        break;

      case "terminate":
        terminateMutation.mutate(
          {
            id: workOrder.id,
            data: {
              workOrderId: workOrder.id,
              notes: note.trim() || undefined,
            },
          },
          {
            onSuccess: () => {
              notifications.show("Work order terminated.", {
                severity: "success",
                autoHideDuration: 3000,
              });
              onSuccess?.();
              closeNoteDialog();
            },
            onError: (error) => {
              notifications.show(`Failed: ${(error as Error).message}`, {
                severity: "error",
                autoHideDuration: 3000,
              });
            },
          },
        );
        break;

      case "cancel":
        cancelMutation.mutate(
          {
            id: workOrder.id,
            data: {
              workOrderId: workOrder.id,
              reason: note.trim() || undefined,
            },
          },
          {
            onSuccess: () => {
              notifications.show("Work order cancelled.", {
                severity: "success",
                autoHideDuration: 3000,
              });
              onSuccess?.();
              closeNoteDialog();
            },
            onError: (error) => {
              notifications.show(`Failed: ${(error as Error).message}`, {
                severity: "error",
                autoHideDuration: 3000,
              });
            },
          },
        );
        break;
    }
  }, [
    confirmAction,
    note,
    workOrder.id,
    startMutation,
    terminateMutation,
    cancelMutation,
    notifications,
    onSuccess,
  ]);

  // Confirm terminate-incomplete (becomes NotPerformed)
  const handleConfirmTerminateIncomplete = useCallback(() => {
    // Use cancel to set NotPerformed status
    terminateMutation.mutate(
      {
        id: workOrder.id,
        data: {
          workOrderId: workOrder.id,
          notes:
            "Work order terminated with incomplete tasks (Not Performed or skipped).",
        },
      },
      {
        onSuccess: () => {
          notifications.show("Work order terminated with incomplete tasks.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          onSuccess?.();
          closeNoteDialog();
        },
        onError: (error) => {
          notifications.show(`Failed: ${(error as Error).message}`, {
            severity: "error",
            autoHideDuration: 3000,
          });
        },
      },
    );
  }, [cancelMutation, workOrder.id, notifications, onSuccess]);

  const status = workOrder.status;
  const isFinal =
    status === WorkOrderStatus.Terminated ||
    status === WorkOrderStatus.NotPerformed ||
    status === WorkOrderStatus.Closed;

  const actionLabel =
    confirmAction === "terminate"
      ? "Terminate"
      : confirmAction === "cancel"
        ? "Cancel"
        : confirmAction === "start"
          ? "Start"
          : "";

  const noteLabel = confirmAction === "cancel" ? "Reason" : "Notes (optional)";

  return (
    <>
      <Stack direction="row" spacing={1}>
        {status === WorkOrderStatus.Draft && (
          <Can requiredPermissions={[Permissions.WorkOrders.Schedule]}>
            <Button
              variant="contained"
              color="primary"
              onClick={openScheduleDialog}
            >
              Schedule
            </Button>
          </Can>
        )}
        {status === WorkOrderStatus.Scheduled && (
          <Can requiredPermissions={[Permissions.WorkOrders.Start]}>
            <Button
              variant="contained"
              color="success"
              onClick={handleStartClick}
            >
              Start
            </Button>
          </Can>
        )}
        {status === WorkOrderStatus.InProgress && (
          <Can requiredPermissions={[Permissions.WorkOrders.Terminate]}>
            <Button
              variant="contained"
              color="warning"
              onClick={handleTerminateClick}
            >
              Terminate
            </Button>
          </Can>
        )}
        {!isFinal && (
          <Can requiredPermissions={[Permissions.WorkOrders.Cancel]}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => openNoteDialog("cancel")}
            >
              Cancel / Mark Not Performed
            </Button>
          </Can>
        )}
      </Stack>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Schedule Work Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Scheduled Date & Time"
            type="datetime-local"
            fullWidth
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button
            onClick={handleScheduleConfirm}
            variant="contained"
            color="primary"
            disabled={scheduleMutation.isPending || !scheduledDate}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Missing Employee Dialog */}
      <Dialog
        open={noEmployeeOpen}
        onClose={() => setNoEmployeeOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cannot Start Work Order</DialogTitle>
        <DialogContent>
          <Typography>
            An employee must be assigned to the work order before it can be
            started. Please assign an employee first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoEmployeeOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog for Start/Terminate/Cancel */}
      <Dialog
        open={
          confirmAction === "start" ||
          confirmAction === "terminate" ||
          confirmAction === "cancel"
        }
        onClose={closeNoteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm {actionLabel}</DialogTitle>
        <DialogContent>
          <TextField
            label={noteLabel}
            multiline
            rows={2}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmWithNote}
            variant="contained"
            color={
              confirmAction === "terminate"
                ? "warning"
                : confirmAction === "cancel"
                  ? "error"
                  : "success"
            }
            disabled={
              (confirmAction === "start" && startMutation.isPending) ||
              (confirmAction === "terminate" && terminateMutation.isPending) ||
              (confirmAction === "cancel" && cancelMutation.isPending)
            }
          >
            {actionLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminate – Incomplete Tasks Warning Dialog */}
      <Dialog
        open={confirmAction === "terminate-incomplete"}
        onClose={closeNoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Incomplete Tasks Detected
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The following task issues were found:
          </Typography>
          <List dense>
            {notPerformedCount > 0 && (
              <ListItem>
                <ListItemText
                  primary={`${notPerformedCount} task(s) not performed`}
                />
              </ListItem>
            )}
            {skippedCount > 0 && (
              <ListItem>
                <ListItemText primary={`${skippedCount} task(s) skipped`} />
              </ListItem>
            )}
          </List>
          {notPerformedCount > 0 && (
            <Box
              sx={{ bgcolor: "warning.light", p: 2, borderRadius: 1, mt: 1 }}
            >
              <Typography variant="body2" color="warning.contrastText">
                Terminating now will change the work order status to{" "}
                <strong>Not Performed</strong> (same as cancelled). This cannot
                be undone.
              </Typography>
            </Box>
          )}
          <TextField
            label="Additional Notes (Optional)"
            multiline
            rows={2}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteDialog}>Go Back</Button>
          <Button
            onClick={handleConfirmTerminateIncomplete}
            variant="contained"
            color="warning"
            disabled={cancelMutation.isPending}
          >
            {notPerformedCount > 0 ? "Set as Not Performed" : "Terminate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
