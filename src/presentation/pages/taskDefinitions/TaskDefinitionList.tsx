import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useSearchTaskDefinitions,
  useDeleteTaskDefinition,
} from "@/application/hooks/taskDefinitions/useTaskDefinitions";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  WorkOrderType,
  TaskDefinition,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";

const SERVER_SIDE_SORT = true; // toggle for client-side sorting
const INITIAL_PAGE_SIZE = 10;

const tabsConfig = [
  { label: "Corrective", value: WorkOrderType.Corrective },
  { label: "Planned Preventive", value: WorkOrderType.PlannedPreventive },
];

export default function TaskDefinitionList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  // URL‑driven state
  const typeParam = searchParams.get("type") as WorkOrderType;
  const selectedType =
    typeParam && Object.values(WorkOrderType).includes(typeParam)
      ? typeParam
      : WorkOrderType.Corrective;
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedSearch = searchParams.get("search") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Sort model for client-side sync
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Build query params
  const queryParams = useMemo(
    () => ({
      type: selectedType,
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [
      selectedType,
      page,
      pageSize,
      appliedSearch,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useSearchTaskDefinitions(queryParams);
  const deleteMutation = useDeleteTaskDefinition();

  // Tab change
  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: WorkOrderType,
  ) => {
    setSearchParams((prev) => {
      prev.set("type", newValue);
      prev.set("page", "0");
      return prev;
    });
  };

  // Pagination
  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setSearchParams((prev) => {
        prev.set("page", String(model.page));
        prev.set("pageSize", String(model.pageSize));
        return prev;
      });
    },
    [setSearchParams],
  );

  // Sort
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (SERVER_SIDE_SORT) {
        const first = model[0];
        setSearchParams((prev) => {
          if (first?.field) {
            prev.set("sortBy", first.field);
            prev.set("sortDirection", first.sort || "");
          } else {
            prev.delete("sortBy");
            prev.delete("sortDirection");
          }
          return prev;
        });
      }
    },
    [SERVER_SIDE_SORT, setSearchParams],
  );

  // Search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => {
        if (e.target.value) {
          prev.set("search", e.target.value);
        } else {
          prev.delete("search");
        }
        prev.set("page", "0");
        return prev;
      });
    },
    [setSearchParams],
  );

  // Delete
  const handleDelete = useCallback(
    (taskDefinition: TaskDefinition) => async () => {
      const confirmed = await dialogs.confirm(
        `Delete task definition "${taskDefinition.description}"?`,
        {
          title: "Delete task definition?",
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        },
      );
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(taskDefinition.id);
          notifications.show("Task definition deleted.", {
            severity: "success",
          });
        } catch (err) {
          notifications.show(`Failed to delete: ${(err as Error).message}`, {
            severity: "error",
          });
        }
      }
    },
    [dialogs, deleteMutation, notifications],
  );

  // Columns
  const columns: GridColDef<TaskDefinition>[] = useMemo(
    () => [
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        sortable: true,
      },
      {
        field: "estimatedDuration",
        headerName: "Duration",
        flex: 1,
        sortable: true,
      },
      {
        field: "actions",
        type: "actions",
        flex: 0.7,
        sortable: false,
        getActions: ({ row }) => [
          <Can
            key="edit"
            requiredPermissions={[Permissions.TaskDefinitions.Edit]}
          >
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={() => navigate(`/task-definitions/${row.id}/edit`)}
            />
          </Can>,
          <Can
            key="delete"
            requiredPermissions={[Permissions.TaskDefinitions.Delete]}
          >
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={handleDelete(row)}
            />
          </Can>,
        ],
      },
    ],
    [navigate, handleDelete],
  );

  return (
    <PageContainer
      title="Task Definitions"
      breadcrumbs={[{ title: "Task Definitions" }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Can requiredPermissions={[Permissions.TaskDefinitions.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/task-definitions/new")}
            >
              Create
            </Button>
          </Can>
        </Stack>
      }
    >
      <Box sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={selectedType}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          {tabsConfig.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        fullWidth
        placeholder="Search by description…"
        value={appliedSearch}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ flex: 1, width: "100%" }}>
        {isError ? (
          <Alert severity="error">{(error as Error)?.message}</Alert>
        ) : (
          <DataGrid
            rows={data?.items ?? []}
            columns={columns}
            rowCount={data?.totalCount ?? 0}
            paginationMode="server"
            sortingMode={SERVER_SIDE_SORT ? "server" : "client"}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            loading={isLoading}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            onRowClick={({ row }) => navigate(`/task-definitions/${row.id}`)}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
