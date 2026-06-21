import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DescriptionIcon from "@mui/icons-material/Description";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrder } from "@/application/hooks/workOrders/useWorkOrders";
import WorkOrderStatusChip from "@/presentation/components/workOrders/WorkOrderStatusChip";
import WorkOrderPriorityChip from "@/presentation/components/workOrders/WorkOrderPriorityChip";
import StatusTransitionButtons from "@/presentation/components/workOrders/WorkOrderStatusTransitionButtons";
import TaskUpdateDialog from "@/presentation/components/workOrders/WorkOrderTaskUpdateDialog";
import MaterialIssueDialog from "@/presentation/components/workOrders/MaterialIssueDialog";
import ReturnMaterialDialog from "@/presentation/components/workOrders/ReturnMaterialDialog";
import ActiveUserPickerDialog from "@/presentation/components/pickers/ActiveUserPickerDialog";
import AssignUserConfirmDialog from "@/presentation/components/workOrders/AssignUserConfirmDialog";
import PageContainer from "@/presentation/components/PageContainer";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useAssignWorkOrder } from "@/application/hooks/workOrders/useWorkOrders";
import type { UserListItemDto } from "@/domain/users/UserTypes";
import {
  MaterialIssuanceType,
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from "@/domain/workOrders/WorkOrderTypes";
import dayjs from "dayjs";

/** Returns a small icon matching the task status. */
function taskStatusIcon(status: WorkOrderTaskStatus) {
  switch (status) {
    case WorkOrderTaskStatus.Performed:
      return <CheckCircleIcon fontSize="small" color="success" />;
    case WorkOrderTaskStatus.Skipped:
      return <SkipNextIcon fontSize="small" color="warning" />;
    default:
      return <RemoveCircleIcon fontSize="small" color="disabled" />;
  }
}

/** Simple labelled field with an icon. */
function ReportField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
      <Box sx={{ color: "action.active" }}>{icon}</Box>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ lineHeight: 1 }}
        >
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  );
}

export default function WorkOrderShow() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const {
    data: workOrder,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkOrder(workOrderId!);

  const assignMutation = useAssignWorkOrder();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItemDto | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Navigation helpers ──
  const goBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/work-orders");
  }, [navigate]);

  const handleTransitionsSuccess = useCallback(() => refetch(), [refetch]);

  const handlePrint = useCallback(() => window.print(), []);

  // ── Assignment flow ──
  const handleOpenAssignPicker = useCallback(() => setPickerOpen(true), []);
  const handleClosePicker = useCallback(() => {
    setPickerOpen(false);
    setConfirmOpen(false);
    setSelectedUser(null);
  }, []);

  const handleUserPicked = useCallback((user: UserListItemDto) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  }, []);

  const handleConfirmAssign = useCallback(() => {
    if (!selectedUser || !workOrder) return;
    assignMutation.mutate(
      {
        id: workOrder.id,
        data: { workOrderId: workOrder.id, employeeId: selectedUser.id },
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedUser(null);
          setPickerOpen(false);
          refetch();
          notifications.show("Work order assigned", { severity: "success" });
        },
        onError: (err) =>
          notifications.show(`Failed to assign: ${(err as Error).message}`, {
            severity: "error",
          }),
      },
    );
  }, [selectedUser, assignMutation, workOrder, refetch, notifications]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmOpen(false);
    setSelectedUser(null);
  }, []);

  // ── Permission-based flags ──
  const canEdit = useMemo(() => {
    if (!workOrder) return false;
    return (
      (workOrder.status === WorkOrderStatus.Draft ||
        workOrder.status === WorkOrderStatus.Scheduled) &&
      Permissions.WorkOrders.Update
    );
  }, [workOrder]);

  const canAssign = useMemo(() => {
    if (!workOrder) return false;
    return (
      workOrder.status === WorkOrderStatus.Draft ||
      workOrder.status === WorkOrderStatus.Scheduled
    );
  }, [workOrder]);

  // ── Guard states ──
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !workOrder) {
    return (
      <Typography color="error">
        {(error as Error)?.message || "Work order not found"}
      </Typography>
    );
  }

  const canNavigateToEquipment =
    Permissions.Equipment.View && workOrder.equipmentId;
  const canNavigateToPlan =
    Permissions.MaintenancePlans.View && workOrder.planId;
  const canNavigateToAssignedUser =
    Permissions.Users.View && workOrder.assignedEmployeeId;

  return (
    <PageContainer
      title={
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h5" component="span">
            WO {workOrder.code}
          </Typography>
          <WorkOrderStatusChip status={workOrder.status} />
        </Stack>
      }
      breadcrumbs={[
        { title: "Work Orders", path: "/work-orders" },
        { title: workOrder.code },
      ]}
    >
      {/* ── Top action bar ── */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
        >
          Back
        </Button>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Can requiredPermissions={[Permissions.WorkOrders.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              disabled={!canEdit}
              onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
            >
              Edit
            </Button>
          </Can>
          {canNavigateToEquipment && (
            <Can requiredPermissions={[Permissions.Equipment.View]}>
              <Button
                variant="outlined"
                startIcon={<PrecisionManufacturingIcon />}
                onClick={() => navigate(`/equipment/${workOrder.equipmentId}`)}
              >
                Equipment
              </Button>
            </Can>
          )}
          {canNavigateToPlan && (
            <Can requiredPermissions={[Permissions.MaintenancePlans.View]}>
              <Button
                variant="outlined"
                startIcon={<BuildCircleIcon />}
                onClick={() =>
                  navigate(`/maintenance-plans/${workOrder.planId}`)
                }
              >
                Plan
              </Button>
            </Can>
          )}
          {canNavigateToAssignedUser && (
            <Can requiredPermissions={[Permissions.Users.View]}>
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() =>
                  navigate(`/users/${workOrder.assignedEmployeeId}`)
                }
              >
                Assignee
              </Button>
            </Can>
          )}
          <Tooltip title="Print work order">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── Main details card ── */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Work Order Details"
          action={
            <Stack direction="row" spacing={1}>
              <WorkOrderPriorityChip priority={workOrder.priority} />
              <WorkOrderStatusChip status={workOrder.status} />
            </Stack>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReportField
                icon={<PrecisionManufacturingIcon fontSize="small" />}
                label="Equipment"
                value={workOrder.equipment || workOrder.equipmentId}
              />
              <ReportField
                icon={<LocationOnIcon fontSize="small" />}
                label="Location"
                value={workOrder.locationPath || "—"}
              />
              <ReportField
                icon={<CategoryIcon fontSize="small" />}
                label="Category"
                value={workOrder.categoryName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReportField
                icon={<CalendarMonthIcon fontSize="small" />}
                label="Scheduled Date"
                value={
                  workOrder.scheduledDate
                    ? dayjs(workOrder.scheduledDate).format(
                        "MMM D, YYYY h:mm A",
                      )
                    : "Not scheduled"
                }
              />
              {workOrder.planCycle && (
                <ReportField
                  icon={<BuildCircleIcon fontSize="small" />}
                  label="Plan Cycle"
                  value={workOrder.planCycle}
                />
              )}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "flex-start", mb: 1.5 }}
              >
                <AssignmentIndIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body2">
                    {workOrder.assignedEmployeeName ||
                      workOrder.assignedEmployeeId ||
                      "Not assigned"}
                  </Typography>
                  {canAssign && (
                    <Can requiredPermissions={[Permissions.WorkOrders.Assign]}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleOpenAssignPicker}
                        sx={{ mt: 0.5 }}
                      >
                        {workOrder.assignedEmployeeId ? "Reassign" : "Assign"}
                      </Button>
                    </Can>
                  )}
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "flex-start" }}
              >
                <DescriptionIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {workOrder.description || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "flex-start" }}
              >
                <StickyNote2Icon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {workOrder.notes
                      ? workOrder.notes.split("|").map((note, index) => (
                          <span key={index}>
                            {note}
                            <br />
                          </span>
                        ))
                      : "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Tasks card ── */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Tasks"
          action={
            workOrder.status === WorkOrderStatus.InProgress && (
              <Can requiredPermissions={[Permissions.WorkOrders.ManageTasks]}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTaskDialogOpen(true)}
                >
                  Update Tasks
                </Button>
              </Can>
            )
          }
        />
        <CardContent>
          {workOrder.tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks assigned.</Typography>
          ) : (
            <List disablePadding>
              {workOrder.tasks.map((task) => (
                <ListItem key={task.id} divider>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {taskStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {task.description || `Task ${task.taskId}`}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        Status: {task.status}
                        {task.estimatedDuration &&
                          ` · Est: ${task.estimatedDuration}`}
                        {task.actualDuration &&
                          ` · Actual: ${task.actualDuration}`}
                        {task.notes && ` · ${task.notes}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* ── Material Requirements card ── */}
      {workOrder.materialRequirements &&
        workOrder.materialRequirements.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Material Requirements" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workOrder.materialRequirements.map((mr) => (
                      <TableRow key={mr.itemId}>
                        <TableCell>{mr.itemSku}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{mr.itemName}</Typography>
                          {mr.itemDescription && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {mr.itemDescription}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{mr.quantity}</TableCell>
                        <TableCell>{mr.unitOfMeasure}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

      {/* ── Materials Issued card ── */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Materials Issued"
          action={
            workOrder.status === WorkOrderStatus.InProgress && (
              <Stack direction="row" spacing={1}>
                {workOrder.materialsIssued.length > 0 && (
                  <Can
                    requiredPermissions={[
                      Permissions.WorkOrders.ReturnMaterials,
                    ]}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      onClick={() => setReturnDialogOpen(true)}
                    >
                      Return Materials
                    </Button>
                  </Can>
                )}
                <Can
                  requiredPermissions={[Permissions.WorkOrders.IssueMaterials]}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIssueDialogOpen(true)}
                  >
                    Issue Materials
                  </Button>
                </Can>
              </Stack>
            )
          }
        />
        <CardContent>
          {workOrder.materialsIssued.length === 0 ? (
            <Typography color="text.secondary">No materials issued.</Typography>
          ) : (
            <List disablePadding>
              {workOrder.materialsIssued.map((mat) => {
                const typeLabels: Record<string, string> = {
                  [MaterialIssuanceType.FromInventory]: "From Inventory",
                  [MaterialIssuanceType.ForApplicationUse]: "Application Used",
                };
                const typeLabel =
                  typeLabels[mat.issuanceType] ?? mat.issuanceType;
                const qtyStr = `${mat.quantity} ${mat.quantityUnit || "units"}`;

                return (
                  <ListItem key={mat.id} divider>
                    <ListItemIcon>
                      <InventoryIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {mat.itemName || `Item ${mat.itemId}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption">
                          {qtyStr} · {typeLabel}
                          {mat.storeCode && ` · Store: ${mat.storeCode}`}
                          {mat.isReturned &&
                            ` · Returned: ${mat.returnedQuantity} ${mat.quantityUnit || "units"}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* ── Status transitions ── */}
      <StatusTransitionButtons
        workOrder={workOrder}
        onSuccess={handleTransitionsSuccess}
      />

      {/* ── Dialogs ── */}
      <TaskUpdateDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        workOrderId={workOrder.id}
        tasks={workOrder.tasks}
      />
      <MaterialIssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        workOrderId={workOrder.id}
        materialRequirements={workOrder.materialRequirements}
      />
      <ReturnMaterialDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        workOrderId={workOrder.id}
        materials={workOrder.materialsIssued.filter(
          (m) => m.issuanceType !== MaterialIssuanceType.ForApplicationUse,
        )}
      />
      <ActiveUserPickerDialog
        open={pickerOpen}
        onClose={handleClosePicker}
        onSelect={handleUserPicked}
        closeOnSelect={false}
      />
      <AssignUserConfirmDialog
        open={confirmOpen}
        user={selectedUser}
        onConfirm={handleConfirmAssign}
        onCancel={handleCancelConfirm}
        loading={assignMutation.isPending}
      />
    </PageContainer>
  );
}
