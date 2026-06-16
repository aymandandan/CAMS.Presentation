/**
 * Frontend permission catalog – mirrors the backend PermissionCatalog.GetAll().
 * Each entry has a name (the permission string) and a human-readable description.
 */
export interface PermissionDefinition {
  name: string;
  description: string;
}

export const allPermissions: PermissionDefinition[] = [
  // Users
  { name: "permission:users.create", description: "Create new users" },
  { name: "permission:users.update", description: "Update user profiles" },
  { name: "permission:users.delete", description: "Delete users" },
  {
    name: "permission:users.view",
    description: "View users and their profiles",
  },
  {
    name: "permission:users.activate",
    description: "Activate deactivated users",
  },
  {
    name: "permission:users.deactivate",
    description: "Deactivate active users",
  },
  {
    name: "permission:users.manageroles",
    description: "Create, edit, and delete roles",
  },
  {
    name: "permission:users.grantpermission",
    description: "Grant permissions to users",
  },
  {
    name: "permission:users.revokepermission",
    description: "Revoke permissions from users",
  },
  {
    name: "permission:users.viewaccess",
    description: "View roles and permissions",
  },

  // Roles
  { name: "permission:roles.create", description: "Create new roles" },
  { name: "permission:roles.read", description: "View roles" },
  { name: "permission:roles.update", description: "Edit existing roles" },
  { name: "permission:roles.delete", description: "Delete roles" },
  {
    name: "permission:roles.grantpermission",
    description: "Grant permissions to roles",
  },
  {
    name: "permission:roles.revokepermission",
    description: "Revoke permissions from roles",
  },
  { name: "permission:roles.viewaccess", description: "View role permissions" },
  { name: "permission:roles.assign", description: "Assign roles to users" },

  // Locations
  { name: "permission:locations.create", description: "Create new locations" },
  {
    name: "permission:locations.read",
    description: "View locations and their details",
  },
  {
    name: "permission:locations.update",
    description: "Update location name and description",
  },
  {
    name: "permission:locations.delete",
    description: "Delete locations (must have no children)",
  },
  {
    name: "permission:locations.move",
    description: "Change the parent of a location",
  },

  // Trades
  { name: "permission:trades.create", description: "Create trades" },
  { name: "permission:trades.read", description: "View trades" },
  { name: "permission:trades.update", description: "Update trades" },
  { name: "permission:trades.delete", description: "Delete trades" },

  // Vendors
  { name: "permission:vendors.view", description: "View vendors" },
  { name: "permission:vendors.create", description: "Create new vendors" },
  { name: "permission:vendors.edit", description: "Edit existing vendors" },
  { name: "permission:vendors.delete", description: "Delete vendors" },

  // Categories
  { name: "permission:categories.view", description: "View categories" },
  {
    name: "permission:categories.create",
    description: "Create new categories",
  },
  {
    name: "permission:categories.edit",
    description: "Edit existing categories",
  },
  { name: "permission:categories.delete", description: "Delete categories" },

  // Material Stores
  {
    name: "permission:materialstores.view",
    description: "View material stores",
  },
  {
    name: "permission:materialstores.create",
    description: "Create material stores",
  },
  {
    name: "permission:materialstores.edit",
    description: "Edit material stores",
  },
  {
    name: "permission:materialstores.delete",
    description: "Delete material stores",
  },

  // Task Definitions
  {
    name: "permission:taskdefinitions.view",
    description: "View task definitions",
  },
  {
    name: "permission:taskdefinitions.create",
    description: "Create new task definitions",
  },
  {
    name: "permission:taskdefinitions.edit",
    description: "Edit existing task definitions",
  },
  {
    name: "permission:taskdefinitions.delete",
    description: "Delete task definitions",
  },

  // Maintenance Plans
  {
    name: "permission:maintenanceplans.view",
    description: "View maintenance plans",
  },
  {
    name: "permission:maintenanceplans.create",
    description: "Create maintenance plans",
  },
  {
    name: "permission:maintenanceplans.update",
    description: "Update maintenance plans",
  },
  {
    name: "permission:maintenanceplans.activate",
    description: "Activate maintenance plans",
  },
  {
    name: "permission:maintenanceplans.deactivate",
    description: "Deactivate maintenance plans",
  },
  {
    name: "permission:maintenanceplans.delete",
    description: "Delete maintenance plans",
  },

  // Material Items
  {
    name: "permission:materialitems.view",
    description: "View material items and stock levels",
  },
  {
    name: "permission:materialitems.create",
    description: "Create new material items",
  },
  {
    name: "permission:materialitems.update",
    description: "Update material item details",
  },
  {
    name: "permission:materialitems.delete",
    description: "Delete material items",
  },
  {
    name: "permission:materialitems.managestock",
    description:
      "Perform stock operations (add, remove, reserve, release, adjust, transfer)",
  },
  {
    name: "permission:materialitems.transferstock",
    description: "Transfer stock between stores",
  },

  // Purchase Orders
  {
    name: "permission:purchaseorders.create",
    description: "Create purchase orders",
  },
  {
    name: "permission:purchaseorders.read",
    description: "View purchase orders",
  },
  {
    name: "permission:purchaseorders.receive",
    description: "Receive purchase orders (update inventory)",
  },
  {
    name: "permission:purchaseorders.cancel",
    description: "Cancel purchase orders",
  },

  // Equipment
  {
    name: "permission:equipment.view",
    description: "View equipment and search",
  },
  { name: "permission:equipment.create", description: "Create new equipment" },
  { name: "permission:equipment.edit", description: "Edit equipment details" },
  { name: "permission:equipment.delete", description: "Delete equipment" },
  {
    name: "permission:equipment.changestatus",
    description: "Change equipment status (maintenance, decommission)",
  },

  // Work Orders
  { name: "permission:workorders.view", description: "View work orders" },
  { name: "permission:workorders.create", description: "Create work orders" },
  {
    name: "permission:workorders.update",
    description: "Update work order details",
  },
  {
    name: "permission:workorders.assign",
    description: "Assign work order to an employee",
  },
  {
    name: "permission:workorders.schedule",
    description: "Schedule work orders",
  },
  { name: "permission:workorders.start", description: "Start work orders" },
  {
    name: "permission:workorders.terminate",
    description: "Terminate work orders",
  },
  { name: "permission:workorders.cancel", description: "Cancel work orders" },
  {
    name: "permission:workorders.managetasks",
    description: "Perform, unperform, or skip tasks within work orders",
  },
  {
    name: "permission:workorders.issuematerials",
    description: "Issue materials to work orders",
  },
  {
    name: "permission:workorders.returnmaterials",
    description: "Return materials from work orders to inventory",
  },

  // Stock Transactions
  {
    name: "permission:stocktransactions.read",
    description: "View stock transaction history",
  },
];

/**
 * Quick lookup map: permission name → description.
 */
export const permissionDescriptionMap: Record<string, string> =
  Object.fromEntries(allPermissions.map((p) => [p.name, p.description]));
