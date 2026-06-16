import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  useCreateCorrectiveWorkOrder,
  useCreatePreventiveWorkOrder,
} from "@/application/hooks/workOrders/useWorkOrders";
import { Priority, WorkOrderType } from "@/domain/workOrders/WorkOrderTypes";
import type { MaintenancePlanListItemDto } from "@/domain/maintenancePlans/MaintenancePlanTypes";
import PageContainer from "@/presentation/components/PageContainer";
import EquipmentPickerDialog from "@/presentation/components/pickers/EquipmentPickerDialog";
import TaskDefinitionPickerDialog from "@/presentation/components/pickers/TaskDefinitionPickerDialog";
import MaintenancePlanPickerDialog from "@/presentation/components/pickers/MaintenancePlanPickerDialog";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import MaterialRequirementsDialog, {
  MaterialRequirementEntry,
} from "@/presentation/components/pickers/MaterialRequirementsDialog";
import { useMaintenancePlan } from "@/application/hooks/maintenancePlans/useMaintenancePlans";

const TYPE_TABS = [
  { label: "Corrective", value: WorkOrderType.Corrective },
  { label: "Preventive", value: WorkOrderType.PlannedPreventive },
] as const;

interface SelectedTask {
  taskId: string;
  order: number;
  description: string;
  estimatedDuration?: string;
}

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [type, setType] = useState<WorkOrderType>(WorkOrderType.Corrective);
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.Urgent);
  const [tasks, setTasks] = useState<SelectedTask[]>([]);
  const [planId, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [planCycle, setPlanCycle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // Material requirements state (corrective)
  const [materialRequirements, setMaterialRequirements] = useState<
    MaterialRequirementEntry[]
  >([]);
  const [materialReqDialogOpen, setMaterialReqDialogOpen] = useState(false);

  // Preventive read‑only data
  const [planTasks, setPlanTasks] = useState<SelectedTask[]>([]);
  const [planMaterialRequirements, setPlanMaterialRequirements] = useState<
    MaterialRequirementEntry[]
  >([]);

  // Plan fetching
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const {
    data: planDetails,
    isLoading: isPlanLoading,
    isError: isPlanError,
  } = useMaintenancePlan(selectedPlanId ?? "", {
    enabled: !!selectedPlanId && type === WorkOrderType.PlannedPreventive,
  });

  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const createCorrective = useCreateCorrectiveWorkOrder();
  const createPreventive = useCreatePreventiveWorkOrder();

  // Reset all fields when switching type
  useEffect(() => {
    if (type === WorkOrderType.Corrective) {
      setPlanId("");
      setPlanName("");
      setPlanCycle("");
      setScheduledDate("");
      setFieldsLocked(false);
      setCategoryId(undefined);
      setEquipmentId("");
      setEquipmentName("");
      setDescription("");
      setNotes("");
      setTasks([]);
      setPriority(Priority.Urgent);
      setMaterialRequirements([]);
      setPlanTasks([]);
      setPlanMaterialRequirements([]);
      setSelectedPlanId(null);
    } else {
      setFieldsLocked(true);
      setEquipmentId("");
      setEquipmentName("");
      setDescription("");
      setNotes("");
      setTasks([]);
      setScheduledDate("");
      setPriority(Priority.Normal);
      setMaterialRequirements([]);
      setPlanTasks([]);
      setPlanMaterialRequirements([]);
      setPlanCycle("");
      setSelectedPlanId(null);
    }
  }, [type]);

  // Watch for plan details arrival and populate form
  useEffect(() => {
    if (planDetails && type === WorkOrderType.PlannedPreventive) {
      // Basic info (only fields that exist in MaintenancePlanDetailsDto)
      setPlanId(planDetails.id);
      setPlanName(planDetails.code || planDetails.id);
      setPlanCycle(`${planDetails.cycleDays} days`);
      setDescription(planDetails.description || "");
      setCategoryId(planDetails.categoryId);

      // Tasks
      if (planDetails.tasks && Array.isArray(planDetails.tasks)) {
        const mapped = planDetails.tasks.map((t) => ({
          taskId: t.taskId,
          order: t.order,
          description: t.taskDescription,
          estimatedDuration: `${t.estimatedDurationValue} ${t.estimatedDurationUnit}`,
        }));
        setPlanTasks(mapped);
      } else {
        setPlanTasks([]);
      }

      // Material requirements
      if (
        planDetails.materialRequirements &&
        Array.isArray(planDetails.materialRequirements)
      ) {
        const mapped = planDetails.materialRequirements.map(
          (mr, idx: number) => ({
            id: `plan-${mr.itemId}-${idx}`,
            itemId: mr.itemId,
            itemName: mr.itemName,
            quantity: mr.quantity,
            unitOfMeasure: mr.unitOfMeasure,
          }),
        );
        setPlanMaterialRequirements(mapped);
      } else {
        setPlanMaterialRequirements([]);
      }

      // Unlock fields (equipment remains empty and editable)
      setFieldsLocked(false);
    }
  }, [planDetails, type]);

  // If plan fetch fails, show error notification and clean up
  useEffect(() => {
    if (isPlanError && selectedPlanId) {
      notifications.show("Failed to load plan details.", {
        severity: "error",
        autoHideDuration: 3000,
      });
      setSelectedPlanId(null);
      setPlanId("");
      setPlanName("");
      setFieldsLocked(true);
    }
  }, [isPlanError, selectedPlanId, notifications]);

  const handlePlanSelected = (plan: MaintenancePlanListItemDto) => {
    setSelectedPlanId(plan.id);
    setPlanName(plan.code); // plan.code is the unique code (e.g., "MP-001")
    setPlanPickerOpen(false);
    setFieldsLocked(true);
  };

  const handleEquipmentSelected = (eq: any) => {
    setEquipmentId(eq.id);
    setEquipmentName(eq.name || eq.code);
    setEquipmentPickerOpen(false);
  };

  const handleTaskSelected = (taskDef: any) => {
    if (type !== WorkOrderType.Corrective) return;
    const alreadyExists = tasks.some((t) => t.taskId === taskDef.id);
    if (alreadyExists) {
      notifications.show(`Task "${taskDef.description}" is already added.`, {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }
    setTasks((prev) => [
      ...prev,
      {
        taskId: taskDef.id,
        order: prev.length + 1,
        description: taskDef.description,
        estimatedDuration: taskDef.estimatedDuration,
      },
    ]);
    setTaskPickerOpen(false);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) =>
      prev
        .filter((t) => t.taskId !== taskId)
        .map((t, idx) => ({ ...t, order: idx + 1 })),
    );
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    dragOverItem.current = index;
  };
  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copiedTasks = [...tasks];
    const draggedItem = copiedTasks[dragItem.current];
    copiedTasks.splice(dragItem.current, 1);
    copiedTasks.splice(dragOverItem.current, 0, draggedItem);
    const reordered = copiedTasks.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTasks(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/work-orders");
    }
  };

  const handleSubmit = useCallback(() => {
    const basePayload = {
      equipmentId,
      description,
      notes: notes.trim() || undefined,
      priority,
      tasks: tasks.map(({ taskId, order }) => ({ taskId, order })),
      materialRequirements:
        materialRequirements.length > 0
          ? materialRequirements.map(({ itemId, quantity, unitOfMeasure }) => ({
              itemId,
              quantity,
              unitOfMeasure,
            }))
          : undefined,
    };

    if (type === WorkOrderType.Corrective) {
      createCorrective.mutate(basePayload, {
        onSuccess: () => {
          notifications.show("Corrective work order created successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          navigate("/work-orders");
        },
        onError: (error) => {
          notifications.show(
            `Failed to create work order: ${(error as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        },
      });
    } else {
      createPreventive.mutate(
        {
          equipmentId,
          planId,
          description,
          notes: notes.trim() || undefined,
          priority,
          scheduledDate: scheduledDate !== "" ? scheduledDate : undefined,
        },
        {
          onSuccess: () => {
            notifications.show("Preventive work order created successfully.", {
              severity: "success",
              autoHideDuration: 3000,
            });
            navigate("/work-orders");
          },
          onError: (error) => {
            notifications.show(
              `Failed to create work order: ${(error as Error).message}`,
              { severity: "error", autoHideDuration: 3000 },
            );
          },
        },
      );
    }
  }, [
    type,
    equipmentId,
    description,
    notes,
    priority,
    tasks,
    planId,
    scheduledDate,
    materialRequirements,
    createCorrective,
    createPreventive,
    navigate,
    notifications,
  ]);

  const isFormValid = equipmentId && description;
  const isLocked = type === WorkOrderType.PlannedPreventive && fieldsLocked;

  const displayTasks = type === WorkOrderType.Corrective ? tasks : planTasks;
  const isTasksReadOnly = type === WorkOrderType.PlannedPreventive;
  const displayMaterialRequirements =
    type === WorkOrderType.Corrective
      ? materialRequirements
      : planMaterialRequirements;
  const isMaterialRequirementsReadOnly =
    type === WorkOrderType.PlannedPreventive;

  return (
    <PageContainer
      title="Create Work Order"
      breadcrumbs={[
        { title: "Work Orders", path: "/work-orders" },
        { title: "New" },
      ]}
    >
      <Box component="form" noValidate sx={{ maxWidth: 800, mx: "auto" }}>
        <Tabs
          value={type}
          onChange={(_, newValue) => setType(newValue as WorkOrderType)}
          sx={{ mb: 3 }}
        >
          {TYPE_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        <Grid container spacing={2}>
          {type === WorkOrderType.PlannedPreventive && (
            <Grid size={12}>
              <Button
                variant="outlined"
                onClick={() => setPlanPickerOpen(true)}
                fullWidth
                sx={{ justifyContent: "flex-start" }}
                disabled={isPlanLoading}
              >
                {isPlanLoading ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2">
                      Loading plan details...
                    </Typography>
                  </Stack>
                ) : planId ? (
                  `Plan: ${planName}`
                ) : (
                  "Select Maintenance Plan"
                )}
              </Button>
              {planId && planCycle && !isPlanLoading && (
                <Chip
                  label={`Cycle: ${planCycle}`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
          )}

          <Grid size={12}>
            <Button
              variant="outlined"
              onClick={() => setEquipmentPickerOpen(true)}
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              disabled={isLocked || isPlanLoading}
            >
              {equipmentId
                ? `Equipment: ${equipmentName || equipmentId}`
                : "Select Equipment"}
            </Button>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Description"
              multiline
              fullWidth
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLocked || isPlanLoading}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLocked || isPlanLoading}
              placeholder="Add any internal notes..."
            />
          </Grid>

          <Grid size={6}>
            <TextField
              select
              label="Priority"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={isLocked || isPlanLoading}
            >
              <MenuItem value={Priority.Normal}>Normal</MenuItem>
              <MenuItem value={Priority.Urgent}>Urgent</MenuItem>
              <MenuItem value={Priority.Critical}>Critical</MenuItem>
            </TextField>
          </Grid>

          <Grid size={6}>
            <TextField
              label="Scheduled Date"
              type="datetime-local"
              fullWidth
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={isLocked || isPlanLoading}
            />
          </Grid>

          {/* Tasks Section */}
          <Grid size={12}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1">Tasks</Typography>
              {!isTasksReadOnly && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DragIndicatorIcon />}
                  onClick={() => setTaskPickerOpen(true)}
                  sx={{ ml: 2 }}
                  disabled={isLocked || isPlanLoading}
                >
                  Add Tasks
                </Button>
              )}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {displayTasks.length} task(s)
              </Typography>
            </Stack>

            {isPlanLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : displayTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isLocked
                  ? "Select a plan to see planned tasks."
                  : "No tasks added yet."}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {displayTasks.map((task, index) => (
                  <Paper
                    key={task.taskId}
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      ...(isTasksReadOnly ? {} : { cursor: "grab" }),
                    }}
                    draggable={!isTasksReadOnly}
                    onDragStart={
                      !isTasksReadOnly
                        ? () => handleDragStart(index)
                        : undefined
                    }
                    onDragOver={
                      !isTasksReadOnly
                        ? (e) => handleDragOver(e, index)
                        : undefined
                    }
                    onDrop={!isTasksReadOnly ? handleDrop : undefined}
                  >
                    {!isTasksReadOnly && (
                      <DragIndicatorIcon
                        sx={{ color: "text.secondary" }}
                        fontSize="small"
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 24, fontWeight: "bold" }}
                    >
                      {task.order}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ maxWidth: "60%", display: "inline" }}
                      >
                        {task.description}
                      </Typography>
                      {task.estimatedDuration && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1, whiteSpace: "nowrap" }}
                        >
                          · {task.estimatedDuration}
                        </Typography>
                      )}
                    </Box>
                    {!isTasksReadOnly && (
                      <IconButton
                        size="small"
                        onClick={() => removeTask(task.taskId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Material Requirements Section */}
          <Grid size={12}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1">Material Requirements</Typography>
              {!isMaterialRequirementsReadOnly && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setMaterialReqDialogOpen(true)}
                  sx={{ ml: 2 }}
                  disabled={isLocked || isPlanLoading}
                >
                  {materialRequirements.length > 0 ? "Edit" : "Add"}
                </Button>
              )}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {displayMaterialRequirements.length} item(s)
              </Typography>
            </Stack>

            {isPlanLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : displayMaterialRequirements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isLocked
                  ? "Select a plan to see required materials."
                  : "No materials required."}
              </Typography>
            ) : (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  {displayMaterialRequirements.map((mr) => (
                    <Box
                      key={mr.id}
                      sx={{ display: "flex", gap: 1, alignItems: "center" }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {mr.itemName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mr.quantity} {mr.unitOfMeasure}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Can requiredPermissions={[Permissions.WorkOrders.Create]}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !isFormValid ||
                isPlanLoading ||
                createCorrective.isPending ||
                createPreventive.isPending
              }
            >
              Create
            </Button>
          </Can>
        </Stack>
      </Box>

      <EquipmentPickerDialog
        open={equipmentPickerOpen}
        onClose={() => setEquipmentPickerOpen(false)}
        onSelect={handleEquipmentSelected}
        filterCategoryId={categoryId}
      />
      {type === WorkOrderType.Corrective && (
        <TaskDefinitionPickerDialog
          open={taskPickerOpen}
          onClose={() => setTaskPickerOpen(false)}
          onSelect={handleTaskSelected}
          filterType={type}
        />
      )}
      <MaintenancePlanPickerDialog
        open={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
        onSelect={handlePlanSelected}
      />
      {type === WorkOrderType.Corrective && (
        <MaterialRequirementsDialog
          open={materialReqDialogOpen}
          onClose={() => setMaterialReqDialogOpen(false)}
          requirements={materialRequirements}
          onConfirm={(reqs) => {
            setMaterialRequirements(reqs);
            setMaterialReqDialogOpen(false);
          }}
          title="Required Materials"
        />
      )}
    </PageContainer>
  );
}
