import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChecklistIcon from "@mui/icons-material/Checklist";
import MaintenancePlanIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InventoryIcon from "@mui/icons-material/Inventory";
import StorefrontIcon from "@mui/icons-material/Storefront";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
// import DescriptionIcon from "@mui/icons-material/Description";
// import LayersIcon from "@mui/icons-material/Layers";
import type { ReactNode } from "react";
import { Permissions } from "@/domain/shared/Permissions";

export type SidebarPageItem = {
  type: "page";
  id: string;
  title: string;
  icon: ReactNode;
  href: string;
  permissions?: string[];
  children?: Omit<SidebarPageItem, "children">[];
};

export type SidebarHeaderItem = {
  type: "header";
  title: string;
  permissions?: string[];
};

export type SidebarDividerItem = {
  type: "divider";
  permissions?: string[];
};

export type SidebarItem =
  | SidebarHeaderItem
  | SidebarDividerItem
  | SidebarPageItem;

export const sidebarItems: SidebarItem[] = [
  {
    type: "header",
    title: "Main items",
  },
  {
    type: "page",
    id: "dashboard",
    title: "Dashboard",
    icon: <PieChartIcon />,
    href: "/",
  },
  {
    type: "page",
    id: "locations",
    title: "Locations",
    icon: <LocationOnIcon />,
    href: "/locations",
    permissions: [Permissions.Locations.Read],
  },
  {
    type: "page",
    id: "work-orders",
    title: "Work Orders",
    icon: <AssignmentIcon />,
    href: "/work-orders",
    permissions: [Permissions.WorkOrders.View],
  },
  {
    type: "page",
    id: "equipment",
    title: "Equipment",
    icon: <BuildIcon />,
    href: "/equipment",
    permissions: [Permissions.Equipment.View],
  },
  {
    type: "page",
    id: "maintenance-setup",
    title: "Maintenance Setup",
    icon: <SettingsIcon />,
    href: "#",
    children: [
      {
        type: "page",
        id: "maintenance-plans",
        title: "Maintenance Plans",
        icon: <MaintenancePlanIcon />,
        href: "/maintenance-plans",
        permissions: [Permissions.MaintenancePlans.View],
      },
      {
        type: "page",
        id: "task-definitions",
        title: "Task Definitions",
        icon: <ChecklistIcon />,
        href: "/task-definitions",
        permissions: [Permissions.TaskDefinitions.View],
      },
      {
        type: "page",
        id: "categories",
        title: "Categories",
        icon: <CategoryIcon />,
        href: "/categories",
        permissions: [Permissions.Categories.View],
      },
      {
        type: "page",
        id: "trades",
        title: "Trades",
        icon: <BarChartIcon />,
        href: "/trades",
        permissions: [Permissions.Trades.Read],
      },
    ],
  },
  {
    type: "divider",
  },
  {
    type: "header",
    title: "Inventory",
  },
  {
    type: "page",
    id: "material-items",
    title: "Material Items",
    icon: <InventoryIcon />,
    href: "/material-items",
    permissions: [Permissions.MaterialItems.View],
  },
  {
    type: "page",
    id: "purchase-orders",
    title: "Purchase Orders",
    icon: <ShoppingCartIcon />,
    href: "/purchase-orders",
    permissions: [Permissions.PurchaseOrders.Read],
  },
  {
    type: "page",
    id: "material-stores",
    title: "Material Stores",
    icon: <StoreIcon />,
    href: "/material-stores",
    permissions: [Permissions.MaterialStores.View],
  },
  {
    type: "page",
    id: "vendors",
    title: "Vendors",
    icon: <StorefrontIcon />,
    href: "/vendors",
    permissions: [Permissions.Vendors.View],
  },
  {
    type: "page",
    id: "stock-transactions",
    title: "Stock Transactions",
    icon: <ReceiptIcon />,
    href: "/stock-transactions",
    permissions: [Permissions.StockTransactions.Read],
  },
  {
    type: "divider",
  },
  {
    type: "header",
    title: "User Management",
  },
  {
    type: "page",
    id: "users",
    title: "Users",
    icon: <PeopleIcon />,
    href: "/users",
    permissions: [Permissions.Users.View],
  },
  {
    type: "page",
    id: "roles",
    title: "Roles",
    icon: <AdminPanelSettingsIcon />,
    href: "/roles",
    permissions: [Permissions.Roles.Read],
  },
  {
    type: "divider",
  },
  // {
  //   type: "header",
  //   title: "Example items",
  // },
  // {
  //   type: "page",
  //   id: "reports",
  //   title: "Reports",
  //   icon: <BarChartIcon />,
  //   href: "/reports",
  //   children: [
  //     {
  //       type: "page",
  //       id: "sales",
  //       title: "Sales",
  //       icon: <DescriptionIcon />,
  //       href: "/reports/sales",
  //     },
  //     {
  //       type: "page",
  //       id: "traffic",
  //       title: "Traffic",
  //       icon: <DescriptionIcon />,
  //       href: "/reports/traffic",
  //     },
  //   ],
  // },
  // {
  //   type: "page",
  //   id: "integrations",
  //   title: "Integrations",
  //   icon: <LayersIcon />,
  //   href: "/integrations",
  // },
];
