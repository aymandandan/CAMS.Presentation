import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useTradeQuery,
  useUpdateTradeMutation,
} from "@/application/hooks/trades/useTrades";
import { validateTrade } from "@/domain/trades/validateTrade";
import TradeForm, {
  type TradeFormState,
} from "@/presentation/components/trades/TradeForm";
import PageContainer from "@/presentation/components/PageContainer";

export default function TradeEdit() {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { data: trade, isLoading, isError, error } = useTradeQuery(tradeId!);
  const updateMutation = useUpdateTradeMutation();

  const [formState, setFormState] = React.useState<TradeFormState>({
    values: { code: "", name: "", description: "" },
    errors: {},
  });

  React.useEffect(() => {
    if (trade) {
      setFormState({
        values: {
          code: trade.code,
          name: trade.name,
          description: trade.description ?? "",
        },
        errors: {},
      });
    }
  }, [trade]);

  const handleFieldChange = React.useCallback(
    (name: keyof TradeFormState["values"], value: string | number | null) => {
      setFormState((prev) => {
        const safeValue = value === null ? undefined : value;
        const newValues = { ...prev.values, [name]: safeValue };
        const { issues } = validateTrade(newValues as any);
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
      await updateMutation.mutateAsync({
        id: tradeId!,
        name: sanitised.name!.trim(),
        description: sanitised.description?.trim() || undefined,
      });
      notifications.show("Trade updated successfully.", {
        severity: "success",
      });
      navigate(`/trades/${tradeId}`);
    } catch (err) {
      notifications.show(`Failed to update trade: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/trades/${tradeId}`);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Edit Trade">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer title="Edit Trade">
        <Alert severity="error">{(error as Error)?.message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit ${trade?.code ?? ""}`}
      breadcrumbs={[
        { title: "Trades", path: "/trades" },
        { title: trade?.code ?? "", path: `/trades/${tradeId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <TradeForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Save"
          onCancel={handleCancel}
          isEdit
        />
      </Box>
    </PageContainer>
  );
}
