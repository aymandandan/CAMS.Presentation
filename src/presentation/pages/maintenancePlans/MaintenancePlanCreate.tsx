import * as React from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/presentation/components/PageContainer";
import MaintenancePlanForm, {
  type MaintenancePlanFormState,
} from "@/presentation/components/maintenancePlans/MaintenancePlanForm";
import type { CreateMaintenancePlanRequest } from "@/domain/maintenancePlans/MaintenancePlanTypes";
import { useCreateMaintenancePlan } from "@/application/hooks/maintenancePlans/useMaintenancePlans";
import { validateMaintenancePlan } from "@/domain/maintenancePlans/MaintenancePlanValidation";

const INITIAL_VALUES: Partial<CreateMaintenancePlanRequest> = {
  code: "",
  description: "",
  cycleDays: 30,
  categoryId: "",
  tasks: [],
  materialRequirements: [],
};

export default function MaintenancePlanCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateMaintenancePlan();

  const [formState, setFormState] = React.useState<MaintenancePlanFormState>({
    values: { ...INITIAL_VALUES },
    errors: {},
    categoryName: "",
  });

  const handleFieldChange = React.useCallback(
    (name: keyof CreateMaintenancePlanRequest, value: any) => {
      const newValues = { ...formState.values, [name]: value };
      const { issues } = validateMaintenancePlan(
        newValues as CreateMaintenancePlanRequest,
      );
      const newErrors: Record<string, string> = {};
      issues.forEach((issue) => {
        if (issue.path[0]) newErrors[issue.path[0]] = issue.message;
      });
      setFormState({ ...formState, values: newValues, errors: newErrors });
    },
    [formState],
  );

  const handleSubmit = React.useCallback(async () => {
    const { issues } = validateMaintenancePlan(
      formState.values as CreateMaintenancePlanRequest,
    );
    if (issues.length > 0) {
      const newErrors: Record<string, string> = {};
      issues.forEach((issue) => {
        if (issue.path[0]) newErrors[issue.path[0]] = issue.message;
      });
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }
    await createMutation.mutateAsync(
      formState.values as CreateMaintenancePlanRequest,
    );
    navigate("/maintenance-plans");
  }, [formState.values, createMutation, navigate]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/maintenance-plans");
    }
  };

  return (
    <PageContainer
      title="New Maintenance Plan"
      breadcrumbs={[
        { title: "Maintenance Plans", path: "/maintenance-plans" },
        { title: "New" },
      ]}
    >
      <MaintenancePlanForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        submitButtonLabel="Create"
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
