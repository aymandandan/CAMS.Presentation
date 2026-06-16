import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  useWorkOrder,
  useUpdateWorkOrderDetails,
} from "@/application/hooks/workOrders/useWorkOrders";
import { Priority, WorkOrderType } from "@/domain/workOrders/WorkOrderTypes";
import PageContainer from "@/presentation/components/PageContainer";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import type { TaskDefinition } from "@/domain/taskDefinitions/TaskDefinitionTypes";
import TaskDefinitionPickerDialog from "@/presentation/components/pickers/TaskDefinitionPickerDialog";
import MaterialRequirementsDialog, {
  MaterialRequirementEntry,
} from "@/presentation/components/pickers/MaterialRequirementsDialog";

interface TaskEntry {
  id?: string;
  taskId: string;
  description: string;
  order: number;
  estimatedDuration?: string;
}

export default function WorkOrderEdit() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const { data: workOrder, isLoading } = useWorkOrder(workOrderId!);
  const mutation = useUpdateWorkOrderDetails();

  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.Normal);
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [materialRequirements, setMaterialRequirements] = useState<
    MaterialRequirementEntry[]
  >([]);
  const [materialReqDialogOpen, setMaterialReqDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (workOrder) {
      setDescription(workOrder.description);
      setNotes(workOrder.notes || "");
      setPriority(workOrder.priority);
      setTasks(
        workOrder.tasks.map((t) => ({
          id: t.id,
          taskId: t.taskId,
          description: t.description || `Task ${t.taskId}`,
          order: t.order,
          estimatedDuration: t.estimatedDuration,
        })),
      );
      setMaterialRequirements(
        workOrder.materialRequirements?.map((mr, index) => ({
          id: `req-${index}`,
          itemId: mr.itemId,
          itemName: mr.itemName,
          quantity: mr.quantity,
          unitOfMeasure: mr.unitOfMeasure,
        })) ?? [],
      );
    }
  }, [workOrder]);

  const handleAddTask = useCallback((taskDef: TaskDefinition) => {
    setTasks((prev) => {
      const maxOrder = prev.reduce((max, t) => Math.max(max, t.order), 0);
      const newTask: TaskEntry = {
        taskId: taskDef.id,
        description: taskDef.description,
        order: maxOrder + 1,
        estimatedDuration: taskDef.estimatedDuration,
      };
      return [...prev, newTask];
    });
  }, []);

  const handleRemoveTask = useCallback((index: number) => {
    setTasks((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((t, idx) => ({ ...t, order: idx + 1 }));
    });
  }, []);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, index: number) => {
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

  const tasksChanged = useCallback(() => {
    if (!workOrder) return false;
    if (tasks.length !== workOrder.tasks.length) return true;
    return tasks.some((t, idx) => {
      const orig = workOrder.tasks[idx];
      return t.taskId !== orig.taskId || t.order !== orig.order;
    });
  }, [tasks, workOrder]);

  const materialRequirementsChanged = useCallback(() => {
    if (!workOrder) return false;
    const original = workOrder.materialRequirements ?? [];
    if (original.length !== materialRequirements.length) return true;
    return materialRequirements.some((mr, idx) => {
      const orig = original[idx];
      return (
        mr.itemId !== orig.itemId ||
        mr.quantity !== orig.quantity ||
        mr.unitOfMeasure !== orig.unitOfMeasure
      );
    });
  }, [materialRequirements, workOrder]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(`/work-orders/${workOrderId}`);
    }
  };

  const handleSubmit = useCallback(() => {
    const command: any = {
      workOrderId: workOrderId!,
      description,
      notes,
      priority,
    };

    if (tasksChanged()) {
      command.tasks = tasks.map(({ taskId, order }) => ({ taskId, order }));
    }

    if (materialRequirementsChanged()) {
      command.materialRequirements = materialRequirements.map(
        ({ itemId, quantity, unitOfMeasure }) => ({
          itemId,
          quantity,
          unitOfMeasure,
        }),
      );
    }

    mutation.mutate(
      { id: workOrderId!, data: command },
      {
        onSuccess: () => {
          notifications.show("Work order updated successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          navigate(`/work-orders/${workOrderId}`);
        },
        onError: (error) => {
          notifications.show(
            `Failed to update work order: ${(error as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        },
      },
    );
  }, [
    workOrderId,
    description,
    notes,
    priority,
    tasks,
    materialRequirements,
    mutation,
    navigate,
    notifications,
    tasksChanged,
    materialRequirementsChanged,
  ]);

  if (isLoading) return <CircularProgress sx={{ mt: 4 }} />;
  if (!workOrder) return <Typography>Work order not found.</Typography>;

  return (
    <PageContainer
      title={`Edit WO ${workOrder.code}`}
      breadcrumbs={[
        { title: "Work Orders", path: "/work-orders" },
        { title: workOrder.code, path: `/work-orders/${workOrder.id}` },
        { title: "Edit" },
      ]}
    >
      <Box component="form" noValidate sx={{ maxWidth: 600, mx: "auto" }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
            />
          </Grid>

          <Grid size={6}>
            <TextField
              select
              label="Priority"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <MenuItem value={Priority.Normal}>Normal</MenuItem>
              <MenuItem value={Priority.Urgent}>Urgent</MenuItem>
              <MenuItem value={Priority.Critical}>Critical</MenuItem>
            </TextField>
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>
              Tasks
            </Typography>
            {tasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tasks assigned.
              </Typography>
            ) : (
              <Paper variant="outlined">
                <List dense>
                  {tasks.map((task, idx) => (
                    <ListItem
                      key={task.id ?? `new-${idx}`}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveTask(idx)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={handleDrop}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "grab",
                      }}
                    >
                      <DragIndicatorIcon
                        sx={{ color: "text.secondary", fontSize: "small" }}
                      />
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "baseline",
                            }}
                          >
                            <Typography variant="body2" component="span">
                              {task.description}
                            </Typography>
                            {task.estimatedDuration && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                · {task.estimatedDuration}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={`Order: ${task.order}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            <Can requiredPermissions={[Permissions.WorkOrders.ManageTasks]}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => setPickerOpen(true)}
                sx={{ mt: 1 }}
              >
                Add Task
              </Button>
            </Can>
          </Grid>

          {/* Material requirements section */}
          <Grid size={12}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1, alignItems: "center" }}
            >
              <Typography variant="subtitle1">Material Requirements</Typography>
              <Can requiredPermissions={[Permissions.WorkOrders.Update]}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setMaterialReqDialogOpen(true)}
                >
                  {materialRequirements.length > 0 ? "Edit" : "Add"}
                </Button>
              </Can>
            </Stack>
            {materialRequirements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No material requirements set.
              </Typography>
            ) : (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  {materialRequirements.map((mr) => (
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
          <Can requiredPermissions={[Permissions.WorkOrders.Update]}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              Save
            </Button>
          </Can>
        </Stack>
      </Box>

      <TaskDefinitionPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddTask}
        filterType={workOrder.type as WorkOrderType}
      />
      <MaterialRequirementsDialog
        open={materialReqDialogOpen}
        onClose={() => setMaterialReqDialogOpen(false)}
        requirements={materialRequirements}
        onConfirm={(reqs) => {
          setMaterialRequirements(reqs);
          setMaterialReqDialogOpen(false);
        }}
        title="Material Requirements"
      />
    </PageContainer>
  );
}
