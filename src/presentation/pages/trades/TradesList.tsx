import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import {
  useTradesQuery,
  useDeleteTradeMutation,
} from "@/application/hooks/trades/useTrades";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import PageContainer from "@/presentation/components/PageContainer";

export default function TradesList() {
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: trades = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTradesQuery();
  const deleteMutation = useDeleteTradeMutation();

  const handleRefresh = () => {
    refetch();
  };

  const handleRowClick: GridEventListener<"rowClick"> = ({ row }) => {
    navigate(`/trades/${row.id}`);
  };

  const handleCreateClick = () => {
    navigate("/trades/new");
  };

  const handleEdit = (tradeId: string) => () => {
    navigate(`/trades/${tradeId}/edit`);
  };

  const handleDelete = (tradeId: string, tradeName: string) => async () => {
    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${tradeName}?`,
      {
        title: "Delete trade?",
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      },
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(tradeId);
        notifications.show("Trade deleted successfully.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete trade. Reason: ${(deleteError as Error).message}`,
          { severity: "error", autoHideDuration: 3000 },
        );
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "code", headerName: "Code", flex: 1, minWidth: 120 },
    { field: "name", headerName: "Name", flex: 2, minWidth: 150 },
    { field: "description", headerName: "Description", flex: 3, minWidth: 230 },
    {
      field: "actions",
      type: "actions",
      width: 100,
      sortable: false,
      getActions: ({ row }) => [
        <Can key="edit" requiredPermissions={[Permissions.Trades.Update]}>
          <GridActionsCellItem
            icon={<EditIcon fontSize="small" />}
            label="Edit"
            onClick={handleEdit(row.id)}
          />
        </Can>,
        <Can key="delete" requiredPermissions={[Permissions.Trades.Delete]}>
          <GridActionsCellItem
            icon={<DeleteIcon fontSize="small" />}
            label="Delete"
            onClick={handleDelete(row.id, row.name)}
          />
        </Can>,
      ],
    },
  ];

  return (
    <PageContainer
      component="div"
      title="Trades"
      breadcrumbs={[{ title: "Trades" }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Refresh" enterDelay={1000}>
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Can requiredPermissions={[Permissions.Trades.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleCreateClick}
            >
              Create
            </Button>
          </Can>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {isError ? (
          <Alert severity="error">{(error as Error)?.message}</Alert>
        ) : (
          <DataGrid
            rows={trades}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                { outline: "none" },
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
            slotProps={{
              baseIconButton: { size: "small" },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
