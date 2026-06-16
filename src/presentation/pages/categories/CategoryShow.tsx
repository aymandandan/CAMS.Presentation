import { useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import ChecklistIcon from "@mui/icons-material/Checklist";
import CategoryIcon from "@mui/icons-material/Category";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useCategory,
  useDeleteCategory,
} from "@/application/hooks/categories/useCategories";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";

export default function CategoryShow() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: category,
    isLoading,
    isError,
    error,
  } = useCategory(categoryId!);
  const deleteMutation = useDeleteCategory();

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/categories\/create$/.test(path) ||
        /\/categories\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/categories");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/categories/${categoryId}/edit`);
  }, [navigate, categoryId]);

  const handleDelete = useCallback(async () => {
    if (!category) return;
    const confirmed = await dialogs.confirm(
      `Delete category "${category.name}"?`,
      {
        title: "Delete category?",
        severity: "error",
        okText: "Delete",
      },
    );
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(category.id);
        notifications.show("Category deleted successfully.", {
          severity: "success",
        });
        navigate("/categories");
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    }
  }, [category, dialogs, deleteMutation, notifications, navigate]);

  const handleViewEquipment = useCallback(() => {
    navigate(`/equipment?categoryId=${category!.id}`);
  }, [navigate, category]);

  const handleViewPlans = useCallback(() => {
    navigate(`/maintenance-plans?categoryId=${category!.id}`);
  }, [navigate, category]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !category) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Category not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Category ${category.code}`}
      breadcrumbs={[
        { title: "Categories", path: "/categories" },
        { title: category.code },
      ]}
    >
      {/* Top action bar */}
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
        <Stack direction="row" spacing={2}>
          <Can requiredPermissions={[Permissions.Categories.Edit]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
          <Button
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={handleViewEquipment}
          >
            Equipment
          </Button>
          <Button
            variant="outlined"
            startIcon={<ChecklistIcon />}
            onClick={handleViewPlans}
          >
            Plans
          </Button>
        </Stack>
      </Stack>

      {/* Main category card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<CategoryIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {category.code} – {category.name}
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="overline" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {category.description || "—"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.Categories.Delete]}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Can>
      </Stack>
    </PageContainer>
  );
}
