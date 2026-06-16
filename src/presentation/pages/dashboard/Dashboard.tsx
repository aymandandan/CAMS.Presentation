import Grid from "@mui/material/Grid";
import PageContainer from "@/presentation/components/PageContainer";
import WorkOrderStatCard from "@/presentation/components/Dashboard/widgets/WorkOrderStatCard";
import EquipmentStatCard from "@/presentation/components/Dashboard/widgets/EquipmentStatCard"; // similar to above
import WorkOrderStatusWidget from "@/presentation/components/Dashboard/widgets/WorkOrderStatusWidget";
import EquipmentStatusWidget from "@/presentation/components/Dashboard/widgets/EquipmentStatusWidget";
import MaintenancePlanStatusWidget from "@/presentation/components/Dashboard/widgets/MaintenancePlanStatusWidget";
import LowStockAlertWidget from "@/presentation/components/Dashboard/widgets/LowStockAlertWidget";
import PurchaseOrderPendingWidget from "@/presentation/components/Dashboard/widgets/PurchaseOrderPendingWidget";
import RecentStockTransactionsWidget from "@/presentation/components/Dashboard/widgets/RecentStockTransactionsWidget";
import UpcomingWorkOrdersWidget from "@/presentation/components/Dashboard/widgets/UpcomingWorkOrdersWidget";
import WorkOrderMonthlyChart from "@/presentation/components/Dashboard/widgets/WorkOrderMonthlyChart";
import UsersRolesStatsWidget from "@/presentation/components/Dashboard/widgets/UsersRolesStatsWidget";
import DashboardPageHeader from "@/presentation/components/Dashboard/DashboardPageHeader";

export default function DashboardPage() {
  return (
    <PageContainer
      title={<DashboardPageHeader />}
      breadcrumbs={[{ title: "Dashboard" }, { title: "Home" }]}
    >
      {/* Row 1: Stat cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <WorkOrderStatCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <EquipmentStatCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <LowStockAlertWidget />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PurchaseOrderPendingWidget />
        </Grid>
      </Grid>

      {/* Row 2: Charts & status breakdowns */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <WorkOrderStatusWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EquipmentStatusWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MaintenancePlanStatusWidget />
        </Grid>
      </Grid>

      {/* Row 3: Trend chart & activity lists */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <WorkOrderMonthlyChart />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <UpcomingWorkOrdersWidget />
        </Grid>
      </Grid>

      {/* Row 4: Recent activity & admin stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentStockTransactionsWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <UsersRolesStatsWidget />
        </Grid>
      </Grid>
    </PageContainer>
  );
}
