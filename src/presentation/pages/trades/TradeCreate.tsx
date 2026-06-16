import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateTradeMutation } from "@/application/hooks/trades/useTrades";
import { validateTrade } from "@/domain/trades/validateTrade";
import TradeForm, {
  type TradeFormState,
} from "@/presentation/components/trades/TradeForm";
import PageContainer from "@/presentation/components/PageContainer";

const INITIAL_VALUES: TradeFormState["values"] = {
  code: "",
  name: "",
  description: "",
};

export default function TradeCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateTradeMutation();

  const [formState, setFormState] = React.useState<TradeFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const handleFieldChange = React.useCallback(
    (name: keyof TradeFormState["values"], value: string | number | null) => {
      setFormState((prev) => {
        // Replace null with undefined to keep types clean
        const safeValue = value === null ? undefined : value;
        const newValues = { ...prev.values, [name]: safeValue };
        const { issues } = validateTrade(newValues as any); // safe cast after null->undefined
        const newErrors = { ...prev.errors };
        const issue = issues.find((i) => i.path[0] === name);
        if (issue) newErrors[name] = issue.message;
        else delete newErrors[name];
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = async () => {
    const values = formState.values;
    // Sanitise description: null → undefined
    const sanitised = {
      ...values,
      description: values.description ?? undefined,
    };
    const { issues } = validateTrade(sanitised);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: sanitised.code!.trim(),
        name: sanitised.name!.trim(),
        description: sanitised.description?.trim() || undefined,
      });
      notifications.show("Trade created successfully.", {
        severity: "success",
      });
      navigate("/trades");
    } catch (err) {
      notifications.show(`Failed to create trade: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/trades");
    }
  };

  return (
    <PageContainer
      title="New Trade"
      breadcrumbs={[{ title: "Trades", path: "/trades" }, { title: "New" }]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <TradeForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Create"
          onCancel={handleCancel}
          isEdit={false}
        />
      </Box>
    </PageContainer>
  );
}
