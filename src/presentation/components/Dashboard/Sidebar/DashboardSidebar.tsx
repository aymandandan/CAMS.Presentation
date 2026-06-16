// src/components/DashboardSidebar.tsx
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import { matchPath, useLocation } from "react-router";
import DashboardSidebarPageItem from "./DashboardSidebarPageItem";
import DashboardSidebarHeaderItem from "./DashboardSidebarHeaderItem";
import DashboardSidebarDividerItem from "./DashboardSidebarDividerItem";
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "@/mixins";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "@/lib/constants";
import DashboardSidebarContext from "@/infrastructure/context/DashboardSidebarContext";
import { sidebarItems, type SidebarItem } from "./SidebarItems";
import { Can } from "../../Can";

export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
}

export default function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const { pathname } = useLocation();

  const [expandedItemIds, setExpandedItemIds] = React.useState<string[]>([]);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up("sm"));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up("md"));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(
        () => setIsFullyExpanded(true),
        theme.transitions.duration.enteringScreen,
      );
      return () => clearTimeout(timeout);
    }
    setIsFullyExpanded(false);
    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const timeout = setTimeout(
        () => setIsFullyCollapsed(true),
        theme.transitions.duration.leavingScreen,
      );
      return () => clearTimeout(timeout);
    }
    setIsFullyCollapsed(false);
    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => setExpanded(newExpanded),
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(
    (itemId: string, hasNestedNavigation: boolean) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((prev) =>
          prev.includes(itemId)
            ? prev.filter((id) => id !== itemId)
            : [...prev, itemId],
        );
      } else if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [mini, setExpanded, isOverSmViewport],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  // Helper to render nested children lists
  const renderNestedList = (children: SidebarItem[]) => (
    <List dense sx={{ padding: 0, my: 1, pl: mini ? 0 : 1, minWidth: 240 }}>
      {children.map((child) => {
        if (child.type !== "page") return null; // nested only contains pages
        return (
          <DashboardSidebarPageItem
            key={child.id}
            id={child.id}
            title={child.title}
            icon={child.icon}
            href={child.href}
            selected={!!matchPath(child.href, pathname)}
          />
        );
      })}
    </List>
  );

  const getDrawerContent = React.useCallback(
    (viewport: "phone" | "tablet" | "desktop") => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "auto",
            scrollbarGutter: mini ? "stable" : "auto",
            overflowX: "hidden",
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, "padding")
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : "auto",
            }}
          >
            {sidebarItems.map((item, index) => {
              let itemElement: React.ReactNode = null;

              switch (item.type) {
                case "header":
                  itemElement = (
                    <DashboardSidebarHeaderItem key={`header-${item.title}`}>
                      {item.title}
                    </DashboardSidebarHeaderItem>
                  );
                  break;
                case "divider":
                  itemElement = (
                    <DashboardSidebarDividerItem key={`divider-${index}`} />
                  );
                  break;
                case "page": {
                  const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;
                  const isExpanded = expandedItemIds.includes(item.id);
                  itemElement = (
                    <DashboardSidebarPageItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      icon={item.icon}
                      href={item.href}
                      selected={
                        !!matchPath(item.href, pathname) ||
                        (hasChildren &&
                          item.children!.some(
                            (child) => !!matchPath(child.href, pathname),
                          ))
                      }
                      defaultExpanded={
                        hasChildren && !!matchPath(item.href, pathname)
                      }
                      expanded={hasChildren ? isExpanded : undefined}
                      nestedNavigation={
                        hasChildren
                          ? renderNestedList(item.children as SidebarItem[])
                          : undefined
                      }
                    />
                  );
                  break;
                }
                default:
                  return null;
              }

              // Wrap with Can if permissions are defined
              if (item.permissions) {
                return (
                  <Can
                    key={item.type === "page" ? item.id : `${item.type}-${index}`}
                    requiredPermissions={item.permissions}
                  >
                    {itemElement}
                  </Can>
                );
              }

              return itemElement;
            })}
          </List>
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, expandedItemIds, pathname],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;
      return {
        displayPrint: "none",
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: "absolute" } : {}),
        [`& .MuiDrawer-paper`]: {
          position: "absolute",
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundImage: "none",
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(
    () => ({
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    }),
    [
      handlePageItemClick,
      mini,
      isFullyExpanded,
      isFullyCollapsed,
      hasDrawerTransitions,
    ],
  );

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      {/* Temporary drawer for mobile */}
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: {
            xs: "block",
            sm: disableCollapsibleSidebar ? "block" : "none",
            md: "none",
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent("phone")}
      </Drawer>

      {/* Permanent drawer for tablet (collapsible) */}
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            sm: disableCollapsibleSidebar ? "none" : "block",
            md: "none",
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent("tablet")}
      </Drawer>

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent("desktop")}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}
