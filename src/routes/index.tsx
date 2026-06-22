import DashboardLayout from "@/presentation/components/layouts/DashboardLayout";
import { RequireAuth } from "@/presentation/guards/RequireAuth";
import SignIn from "@/presentation/pages/Auth/SignIn";
import CategoryCreate from "@/presentation/pages/categories/CategoryCreate";
import CategoryEdit from "@/presentation/pages/categories/CategoryEdit";
import CategoryList from "@/presentation/pages/categories/CategoryList";
import CategoryShow from "@/presentation/pages/categories/CategoryShow";
import DashboardPage from "@/presentation/pages/dashboard/Dashboard";
import EquipmentCreate from "@/presentation/pages/equipment/EquipmentCreate";
import EquipmentEdit from "@/presentation/pages/equipment/EquipmentEdit";
import EquipmentList from "@/presentation/pages/equipment/EquipmentList";
import EquipmentShow from "@/presentation/pages/equipment/EquipmentShow";
import LocationCreate from "@/presentation/pages/locations/LocationCreate";
import LocationEdit from "@/presentation/pages/locations/LocationEdit";
import LocationShow from "@/presentation/pages/locations/LocationShow";
import LocationsPage from "@/presentation/pages/locations/LocationsPage";
import MaintenancePlanCreate from "@/presentation/pages/maintenancePlans/MaintenancePlanCreate";
import MaintenancePlanEdit from "@/presentation/pages/maintenancePlans/MaintenancePlanEdit";
import MaintenancePlanList from "@/presentation/pages/maintenancePlans/MaintenancePlanList";
import MaintenancePlanShow from "@/presentation/pages/maintenancePlans/MaintenancePlanShow";
import MaterialItemCreate from "@/presentation/pages/materialItems/MaterialItemCreate";
import MaterialItemEdit from "@/presentation/pages/materialItems/MaterialItemEdit";
import MaterialItemShow from "@/presentation/pages/materialItems/MaterialItemShow";
import MaterialItemsList from "@/presentation/pages/materialItems/MaterialItemsList";
import MaterialStoreCreate from "@/presentation/pages/materialStores/MaterialStoreCreate";
import MaterialStoreEdit from "@/presentation/pages/materialStores/MaterialStoreEdit";
import MaterialStoreList from "@/presentation/pages/materialStores/MaterialStoreList";
import MaterialStoreShow from "@/presentation/pages/materialStores/MaterialStoreShow";
import PurchaseOrderCreate from "@/presentation/pages/purchaseOrders/PurchaseOrderCreate";
import PurchaseOrderEdit from "@/presentation/pages/purchaseOrders/PurchaseOrderEdit";
import PurchaseOrderList from "@/presentation/pages/purchaseOrders/PurchaseOrderList";
import PurchaseOrderShow from "@/presentation/pages/purchaseOrders/PurchaseOrderShow";
import RoleCreate from "@/presentation/pages/roles/RoleCreate";
import RoleEdit from "@/presentation/pages/roles/RoleEdit";
import RoleShow from "@/presentation/pages/roles/RoleShow";
import RolesList from "@/presentation/pages/roles/RolesList";
import StockTransactionList from "@/presentation/pages/stockTransactions/StockTransactionList";
import StockTransactionShow from "@/presentation/pages/stockTransactions/StockTransactionShow";
import TaskDefinitionCreate from "@/presentation/pages/taskDefinitions/TaskDefinitionCreate";
import TaskDefinitionEdit from "@/presentation/pages/taskDefinitions/TaskDefinitionEdit";
import TaskDefinitionList from "@/presentation/pages/taskDefinitions/TaskDefinitionList";
import TaskDefinitionShow from "@/presentation/pages/taskDefinitions/TaskDefinitionShow";
import TradeCreate from "@/presentation/pages/trades/TradeCreate";
import TradeEdit from "@/presentation/pages/trades/TradeEdit";
import TradeShow from "@/presentation/pages/trades/TradeShow";
import TradesList from "@/presentation/pages/trades/TradesList";
import UnauthorizedPage from "@/presentation/pages/UnauthorizedPage";
import UserCreate from "@/presentation/pages/users/UserCreate";
import UserEdit from "@/presentation/pages/users/UserEdit";
import UserList from "@/presentation/pages/users/UserList";
import UserShow from "@/presentation/pages/users/UserShow";
import VendorCreate from "@/presentation/pages/vendors/VendorCreate";
import VendorEdit from "@/presentation/pages/vendors/VendorEdit";
import VendorList from "@/presentation/pages/vendors/VendorList";
import VendorShow from "@/presentation/pages/vendors/VendorShow";
import WorkOrderCreate from "@/presentation/pages/workOrders/WorkOrderCreate";
import WorkOrderEdit from "@/presentation/pages/workOrders/WorkOrderEdit";
import WorkOrderShow from "@/presentation/pages/workOrders/WorkOrderShow";
import WorkOrderList from "@/presentation/pages/workOrders/WorkOrdersList";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    // element: <AuthLayout />,
    children: [{ path: "/login", Component: SignIn }],
  },
  {
    Component: RequireAuth, // all routes inside are protected
    children: [
      {
        Component: DashboardLayout,
        children: [
          { path: "/", Component: DashboardPage },
          // Equipment routes
          {
            path: "/equipment",
            Component: EquipmentList,
          },
          {
            path: "/equipment/new",
            Component: EquipmentCreate,
          },
          {
            path: "/equipment/:equipmentId",
            Component: EquipmentShow,
          },
          {
            path: "/equipment/:equipmentId/edit",
            Component: EquipmentEdit,
          },
          // Trades routes
          {
            path: "/trades",
            Component: TradesList,
          },
          {
            path: "/trades/new",
            Component: TradeCreate,
          },
          {
            path: "/trades/:tradeId",
            Component: TradeShow,
          },
          {
            path: "/trades/:tradeId/edit",
            Component: TradeEdit,
          },
          // Category routes
          {
            path: "/categories",
            Component: CategoryList,
          },
          {
            path: "/categories/new",
            Component: CategoryCreate,
          },
          {
            path: "/categories/:categoryId",
            Component: CategoryShow,
          },
          {
            path: "/categories/:categoryId/edit",
            Component: CategoryEdit,
          },
          // Location routes
          {
            path: "/locations",
            Component: LocationsPage,
          },
          {
            path: "/locations/new",
            Component: LocationCreate,
          },
          {
            path: "/locations/:locationId",
            Component: LocationShow,
          },
          {
            path: "/locations/:locationId/edit",
            Component: LocationEdit,
          },
          // Material Store routes
          {
            path: "/material-stores",
            Component: MaterialStoreList,
          },
          {
            path: "/material-stores/new",
            Component: MaterialStoreCreate,
          },
          {
            path: "/material-stores/:storeId",
            Component: MaterialStoreShow,
          },
          {
            path: "/material-stores/:storeId/edit",
            Component: MaterialStoreEdit,
          },
          // Vendor routes
          {
            path: "/vendors",
            Component: VendorList,
          },
          {
            path: "/vendors/new",
            Component: VendorCreate,
          },
          {
            path: "/vendors/:vendorId",
            Component: VendorShow,
          },
          {
            path: "/vendors/:vendorId/edit",
            Component: VendorEdit,
          },
          // User routes
          {
            path: "/users",
            Component: UserList,
          },
          {
            path: "/users/new",
            Component: UserCreate,
          },
          {
            path: "/users/:userId",
            Component: UserShow,
          },
          {
            path: "/users/:userId/edit",
            Component: UserEdit,
          },
          // Role routes
          {
            path: "/roles",
            Component: RolesList,
          },
          {
            path: "/roles/new",
            Component: RoleCreate,
          },
          {
            path: "/roles/:roleId",
            Component: RoleShow,
          },
          {
            path: "/roles/:roleId/edit",
            Component: RoleEdit,
          },
          // Task Definitions routes
          {
            path: "/task-definitions",
            Component: TaskDefinitionList,
          },
          {
            path: "/task-definitions/new",
            Component: TaskDefinitionCreate,
          },
          {
            path: "/task-definitions/:taskDefinitionId",
            Component: TaskDefinitionShow,
          },
          {
            path: "/task-definitions/:taskDefinitionId/edit",
            Component: TaskDefinitionEdit,
          },
          // Material Items routes
          {
            path: "/material-items",
            Component: MaterialItemsList,
          },
          {
            path: "/material-items/new",
            Component: MaterialItemCreate,
          },
          {
            path: "/material-items/:materialItemId",
            Component: MaterialItemShow,
          },
          {
            path: "/material-items/:materialItemId/edit",
            Component: MaterialItemEdit,
          },
          // Maintenance Plans route
          {
            path: "/maintenance-plans",
            Component: MaintenancePlanList,
          },
          {
            path: "/maintenance-plans/new",
            Component: MaintenancePlanCreate,
          },
          {
            path: "/maintenance-plans/:planId",
            Component: MaintenancePlanShow,
          },
          {
            path: "/maintenance-plans/:planId/edit",
            Component: MaintenancePlanEdit,
          },
          // Work Order routes
          {
            path: "/work-orders",
            Component: WorkOrderList,
          },
          {
            path: "/work-orders/new",
            Component: WorkOrderCreate,
          },
          {
            path: "/work-orders/:workOrderId",
            Component: WorkOrderShow,
          },
          {
            path: "/work-orders/:workOrderId/edit",
            Component: WorkOrderEdit,
          },
          // Purchase Order routes
          {
            path: "/purchase-orders",
            Component: PurchaseOrderList,
          },
          {
            path: "/purchase-orders/new",
            Component: PurchaseOrderCreate,
          },
          {
            path: "/purchase-orders/:purchaseOrderId",
            Component: PurchaseOrderShow,
          },
          {
            path: "/purchase-orders/:purchaseOrderId/edit",
            Component: PurchaseOrderEdit,
          },
          // Stock Transaction routes
          {
            path: "/stock-transactions",
            Component: StockTransactionList,
          },
          {
            path: "/stock-transactions/:transactionId",
            Component: StockTransactionShow,
          },
        ],
      },
    ],
  },
  { path: "/unauthorized", Component: UnauthorizedPage },
  { path: "*", Component: () => <Navigate to="/" /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
