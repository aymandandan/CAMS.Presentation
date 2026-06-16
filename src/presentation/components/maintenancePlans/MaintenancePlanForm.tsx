import * as React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { CreateMaintenancePlanRequest } from "@/domain/maintenancePlans/MaintenancePlanTypes";
import CategoryPickerDialog from "../pickers/CategoryPickerDialog";
import MaterialRequirementsDialog, {
  MaterialRequirementEntry,
} from "../pickers/MaterialRequirementsDialog";
import TaskDefinitionPickerDialog from "../pickers/TaskDefinitionPickerDialog";
import type { TaskDefinition } from "@/domain/taskDefinitions/TaskDefinitionTypes";
import { WorkOrderType } from "@/domain/workOrders/WorkOrderTypes";

// ── Local types ──
interface TaskFormEntry {
  id: string;
  taskId: string;
  order: number;
  description: string;
  estimatedDuration?: string;
}

export interface MaintenancePlanFormState {
  values: Partial<CreateMaintenancePlanRequest> & { id?: string };
  errors: Record<string, string>;
  categoryName?: string;
}

export interface MaintenancePlanFormProps {
  formState: MaintenancePlanFormState;
  onFieldChange: (name: keyof CreateMaintenancePlanRequest, value: any) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  initialTasks?: TaskFormEntry[];
  initialMaterials?: MaterialRequirementEntry[];
}

const PREDEFINED_CYCLE_OPTIONS = [30, 60, 90, 365];

export default function MaintenancePlanForm(props: MaintenancePlanFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onCancel,
    submitButtonLabel,
    initialTasks,
    initialMaterials,
  } = props;

  const [tasks, setTasks] = useState<TaskFormEntry[]>(initialTasks ?? []);
  const [materialRequirements, setMaterialRequirements] = useState<
    MaterialRequirementEntry[]
  >(initialMaterials ?? []);

  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    formState.categoryName ?? "",
  );

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  const isEditing = Boolean(formState.values.id);

  // Drag & drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Sync external category name
  useEffect(() => {
    if (formState.categoryName !== undefined) {
      setSelectedCategoryName(formState.categoryName);
    }
  }, [formState.categoryName]);

  // Sync tasks to parent (API shape)
  useEffect(() => {
    onFieldChange(
      "tasks",
      tasks.map(({ taskId, order }) => ({ taskId, order })),
    );
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync material requirements to parent (API shape)
  useEffect(() => {
    onFieldChange(
      "materialRequirements",
      materialRequirements.map(({ itemId, quantity, unitOfMeasure }) => ({
        itemId,
        quantity,
        unitOfMeasure,
      })),
    );
  }, [materialRequirements]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cycle Days derived values ─────────────────
  const cycleDays = formState.values.cycleDays;
  const isCustomCycle =
    cycleDays != null && !PREDEFINED_CYCLE_OPTIONS.includes(cycleDays);
  const cycleSelectValue = isCustomCycle
    ? "Custom"
    : cycleDays != null
      ? String(cycleDays)
      : "";

  const customCycleValue = isCustomCycle ? cycleDays : undefined;

  // ── Handlers ─────────────────────────────────
  const handleCategorySelect = useCallback(
    (category: any) => {
      onFieldChange("categoryId", category.id);
      setSelectedCategoryName(category.name);
      setCategoryPickerOpen(false);
    },
    [onFieldChange],
  );

  const handleTaskSelected = useCallback(
    (taskDef: TaskDefinition) => {
      if (tasks.some((t) => t.taskId === taskDef.id)) return;
      setTasks((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}-${taskDef.id}`,
          taskId: taskDef.id,
          order: prev.length + 1,
          description: taskDef.description,
          estimatedDuration: taskDef.estimatedDuration,
        },
      ]);
      setTaskPickerOpen(false);
    },
    [tasks],
  );

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev
        .filter((t) => t.taskId !== taskId)
        .map((t, idx) => ({ ...t, order: idx + 1 })),
    );
  }, []);

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
    const copied = [...tasks];
    const draggedItem = copied[dragItem.current];
    copied.splice(dragItem.current, 1);
    copied.splice(dragOverItem.current, 0, draggedItem);
    const reordered = copied.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTasks(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const { values, errors } = formState;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ width: "100%" }}
    >
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* ── Basic Information ── */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Code"
                  value={values.code ?? ""}
                  onChange={(e) => onFieldChange("code", e.target.value)}
                  error={!!errors.code}
                  helperText={errors.code ?? " "}
                  fullWidth
                  disabled={isEditing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* Category field with same style as Code */}
                <TextField
                  label="Category"
                  value={selectedCategoryName}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setCategoryPickerOpen(true)}
                            disabled={isEditing}
                            size="small"
                            sx={{ minWidth: "auto", px: 1 }}
                          >
                            Select
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                  error={!!errors.categoryId}
                  helperText={errors.categoryId ?? " "}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* Cycle Days: controlled Select + optional custom TextField */}
                <FormControl fullWidth error={!!errors.cycleDays}>
                  <InputLabel id="cycle-days-label">Cycle Days</InputLabel>
                  <Select
                    labelId="cycle-days-label"
                    value={cycleSelectValue}
                    label="Cycle Days"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        // Keep current custom value or reset to undefined
                        onFieldChange(
                          "cycleDays",
                          customCycleValue ?? undefined,
                        );
                      } else if (val === "") {
                        onFieldChange("cycleDays", undefined);
                      } else {
                        onFieldChange("cycleDays", Number(val));
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {PREDEFINED_CYCLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={String(opt)}>
                        {opt}
                      </MenuItem>
                    ))}
                    <MenuItem value="Custom">Custom</MenuItem>
                  </Select>
                  <FormHelperText>{errors.cycleDays ?? " "}</FormHelperText>
                </FormControl>
              </Grid>
              {/* Custom cycle input – shown when Select is "Custom" */}
              {cycleSelectValue === "Custom" && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Custom Days"
                    type="number"
                    value={customCycleValue ?? ""}
                    onChange={(e) =>
                      onFieldChange(
                        "cycleDays",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    error={!!errors.cycleDays}
                    helperText={errors.cycleDays ?? " "}
                    fullWidth
                    slotProps={{ htmlInput: { min: 1, inputMode: "numeric" } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={values.description ?? ""}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description ?? " "}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ── Tasks ── */}
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Tasks
              </Typography>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {tasks.length} task(s)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setTaskPickerOpen(true)}
                >
                  Add Tasks
                </Button>
              </Stack>
            </Stack>

            {tasks.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                No tasks added yet.
              </Typography>
            )}

            <Stack spacing={1}>
              {tasks.map((task, index) => (
                <Paper
                  key={task.id}
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                >
                  <DragIndicatorIcon
                    sx={{ color: "text.secondary", cursor: "grab" }}
                    fontSize="small"
                  />
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 24, fontWeight: "bold" }}
                  >
                    {task.order}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {task.description}
                    </Typography>
                    {task.estimatedDuration && (
                      <Typography variant="caption" color="text.secondary">
                        · {task.estimatedDuration}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => removeTask(task.taskId)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* ── Material Requirements ── */}
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Material Requirements
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setMaterialDialogOpen(true)}
              >
                {materialRequirements.length > 0
                  ? `Edit Materials (${materialRequirements.length})`
                  : "Add Materials"}
              </Button>
            </Stack>

            {materialRequirements.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                No material requirements defined.
              </Typography>
            )}

            {materialRequirements.map((mat) => (
              <Typography
                key={mat.id}
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                • {mat.itemName || "Unknown item"} – {mat.quantity}{" "}
                {mat.unitOfMeasure}
              </Typography>
            ))}
          </Box>
        </Stack>

        {/* ── Action Buttons ── */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            {submitButtonLabel}
          </Button>
        </Stack>
      </Paper>

      {/* ── Dialogs ── */}
      <CategoryPickerDialog
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={handleCategorySelect}
      />
      <MaterialRequirementsDialog
        open={materialDialogOpen}
        onClose={() => setMaterialDialogOpen(false)}
        requirements={materialRequirements}
        onConfirm={(newRequirements) => {
          setMaterialRequirements(newRequirements);
          setMaterialDialogOpen(false);
        }}
        title="Material Requirements"
      />
      <TaskDefinitionPickerDialog
        open={taskPickerOpen}
        onClose={() => setTaskPickerOpen(false)}
        onSelect={handleTaskSelected}
        filterType={WorkOrderType.PlannedPreventive}
      />
    </Box>
  );
}
