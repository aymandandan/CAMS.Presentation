import * as React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import MaintenancePlanForm from "@/presentation/components/maintenancePlans/MaintenancePlanForm";
import type {
  CreateMaintenancePlanRequest,
  MaterialRequirementInput,
  PlannedTaskInput,
} from "@/domain/maintenancePlans/MaintenancePlanTypes";
import {
  useMaintenancePlan,
  useUpdateMaintenancePlan,
} from "@/application/hooks/maintenancePlans/useMaintenancePlans";
import { validateMaintenancePlan } from "@/domain/maintenancePlans/MaintenancePlanValidation";

// ── Helpers ────────────────────────────────────────
function areTasksEqual(
  a: PlannedTaskInput[] | undefined,
  b: PlannedTaskInput[] | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) =>
    (x.taskId || "").localeCompare(y.taskId || ""),
  );
  const sortedB = [...b].sort((x, y) =>
    (x.taskId || "").localeCompare(y.taskId || ""),
  );
  return sortedA.every(
    (item, idx) =>
      item.taskId === sortedB[idx]?.taskId &&
      item.order === sortedB[idx]?.order,
  );
}

function areMaterialsEqual(
  a: MaterialRequirementInput[] | undefined,
  b: MaterialRequirementInput[] | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) =>
    (x.itemId || "").localeCompare(y.itemId || ""),
  );
  const sortedB = [...b].sort((x, y) =>
    (x.itemId || "").localeCompare(y.itemId || ""),
  );
  return sortedA.every(
    (item, idx) =>
      item.itemId === sortedB[idx]?.itemId &&
      item.quantity === sortedB[idx]?.quantity &&
      item.unitOfMeasure === sortedB[idx]?.unitOfMeasure,
  );
}

// ── Component ──────────────────────────────────────────────────
export default function MaintenancePlanEdit() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const { data: plan, isLoading, isError, error } = useMaintenancePlan(planId!);
  const updateMutation = useUpdateMaintenancePlan();

  const [formState, setFormState] = React.useState<{
    values: Partial<CreateMaintenancePlanRequest> & { id?: string };
    errors: Record<string, string>;
    categoryName: string;
  }>({
    values: {},
    errors: {},
    categoryName: "",
  });

  // Populate form values from the fetched plan
  React.useEffect(() => {
    if (plan) {
      setFormState({
        values: {
          id: plan.id,
          code: plan.code,
          description: plan.description,
          cycleDays: plan.cycleDays,
          categoryId: plan.categoryId,
          tasks: plan.tasks.map((t) => ({
            taskId: t.taskId,
            order: t.order,
            description: t.taskDescription,
            estimatedDuration: t.estimatedDurationValue
              ? `${t.estimatedDurationValue} ${t.estimatedDurationUnit}`
              : undefined,
          })) as any,
          materialRequirements: plan.materialRequirements.map((m) => ({
            itemId: m.itemId,
            itemName: m.itemName,
            quantity: m.quantity,
            unitOfMeasure: m.unitOfMeasure,
          })) as any,
        },
        errors: {},
        categoryName: plan.categoryName,
      });
    }
  }, [plan]);

  // ── Derived UI lists to pass as initial values to the form ───
  const uiTasks = React.useMemo(() => {
    if (!plan) return [];
    return plan.tasks.map((t, idx) => ({
      id: `task-${idx}`,
      taskId: t.taskId,
      order: t.order,
      description: t.taskDescription,
      estimatedDuration: t.estimatedDurationValue
        ? `${t.estimatedDurationValue} ${t.estimatedDurationUnit}`
        : undefined,
    }));
  }, [plan]);

  const uiMaterials = React.useMemo(() => {
    if (!plan) return [];
    return plan.materialRequirements.map((m, idx) => ({
      id: `mat-${idx}-${m.itemId}`,
      itemId: m.itemId,
      itemName: m.itemName,
      quantity: m.quantity,
      unitOfMeasure: m.unitOfMeasure,
    }));
  }, [plan]);

  const handleFieldChange = React.useCallback(
    (name: keyof CreateMaintenancePlanRequest, value: any) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateMaintenancePlan(
          newValues as CreateMaintenancePlanRequest,
        );
        const newErrors: Record<string, string> = {};
        issues.forEach((i) => {
          if (i.path[0]) newErrors[i.path[0]] = i.message;
        });
        return { ...prev, values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(async () => {
    const currentTasks: PlannedTaskInput[] =
      formState.values.tasks?.map((t: any) => ({
        taskId: t.taskId,
        order: t.order,
      })) ?? [];

    const currentMaterials: MaterialRequirementInput[] =
      formState.values.materialRequirements?.map((m: any) => ({
        itemId: m.itemId,
        quantity: m.quantity,
        unitOfMeasure: m.unitOfMeasure,
      })) ?? [];

    // Reference original values directly from the fetched plan
    const originalTasks: PlannedTaskInput[] = plan
      ? plan.tasks.map((t) => ({ taskId: t.taskId, order: t.order }))
      : [];
    const originalMaterials: MaterialRequirementInput[] = plan
      ? plan.materialRequirements.map((m) => ({
          itemId: m.itemId,
          quantity: m.quantity,
          unitOfMeasure: m.unitOfMeasure,
        }))
      : [];

    const tasksToSend = areTasksEqual(currentTasks, originalTasks)
      ? undefined
      : currentTasks;
    const materialsToSend = areMaterialsEqual(
      currentMaterials,
      originalMaterials,
    )
      ? undefined
      : currentMaterials;

    const { issues } = validateMaintenancePlan(
      formState.values as CreateMaintenancePlanRequest,
    );
    if (issues.length > 0) {
      const newErrors: Record<string, string> = {};
      issues.forEach((i) => {
        if (i.path[0]) newErrors[i.path[0]] = i.message;
      });
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    await updateMutation.mutateAsync({
      id: planId!,
      data: {
        planId: planId!,
        description: formState.values.description,
        cycleDays: formState.values.cycleDays,
        tasks: tasksToSend,
        materialRequirements: materialsToSend,
      },
    });
    navigate(`/maintenance-plans/${planId}`);
  }, [formState.values, plan, updateMutation, planId, navigate]);

  const handleCancel = () => {
    if (locationRouter.state?.from) {
      navigate(locationRouter.state.from);
    } else {
      navigate(`/maintenance-plans/${planId}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !plan) {
    return (
      <Box color="error.main">
        {(error as Error)?.message || "Plan not found"}
      </Box>
    );
  }

  return (
    <PageContainer
      title={`Edit ${plan.code}`}
      breadcrumbs={[
        { title: "Maintenance Plans", path: "/maintenance-plans" },
        { title: plan.code, path: `/maintenance-plans/${plan.id}` },
        { title: "Edit" },
      ]}
    >
      <MaintenancePlanForm
        key={plan.id}
        formState={formState as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        submitButtonLabel="Save"
        onCancel={handleCancel}
        initialTasks={uiTasks}
        initialMaterials={uiMaterials}
      />
    </PageContainer>
  );
}
