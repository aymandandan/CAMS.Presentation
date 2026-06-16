import React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  CircularProgress,
  List,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import { useLocationTreeStore } from "@/application/stores/useLocationTreeStore";
import { useLocationChildren } from "@/application/hooks/locations/useLocations";
import { type LocationDto } from "@/domain/locations/LocationTypes";
import type { EquipmentListItemDto } from "@/domain/equipment/EquipmentTypes";
import { useLocationEquipment } from "@/application/hooks/equipment/useLocationEquipment";
import BuildIcon from "@mui/icons-material/Build";
import { EQUIPMENT_LOCATION_TYPES } from "@/lib/config/EquipmentLocationTypes";

interface LocationTreeNodeProps {
  node: LocationDto;
  onSelect?: (location: LocationDto) => void;
  onSelectEquipment?: (equipment: EquipmentListItemDto) => void;
  level?: number;
}

const LocationEquipmentList: React.FC<{
  locationId: string;
  onSelectEquipment?: (equipment: EquipmentListItemDto) => void;
  level: number;
}> = ({ locationId, onSelectEquipment, level }) => {
  const {
    data: equipments,
    isLoading,
    isError,
  } = useLocationEquipment(locationId, true);

  if (isLoading)
    return <CircularProgress size={16} sx={{ ml: level * 2 + 4 }} />;
  if (isError || !equipments || equipments.length === 0) return null;

  return (
    <List disablePadding>
      {equipments.map((eq) => (
        <ListItemButton
          key={eq.id}
          sx={{ pl: level * 2 + 4, py: 0 }}
          onClick={() => onSelectEquipment?.(eq)}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <BuildIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={`${eq.code} - ${eq.name}`}
            secondary={eq.status}
            slotProps={{
              primary: { variant: "body2" },
              secondary: { variant: "caption" },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

const LocationTreeNode: React.FC<LocationTreeNodeProps> = ({
  node,
  onSelect,
  onSelectEquipment,
  level = 0,
}) => {
  const expandedIds = useLocationTreeStore((s) => s.expandedIds);
  const toggleExpanded = useLocationTreeStore((s) => s.toggleExpanded);

  const isExpanded = expandedIds.includes(node.id);
  const { data: children, isLoading } = useLocationChildren(
    isExpanded ? node.id : undefined,
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(node.id);
  };

  const handleSelect = () => {
    onSelect?.(node);
  };

  return (
    <>
      <ListItemButton sx={{ pl: level * 2 + 2, py: 0 }} onClick={handleSelect}>
        <IconButton size="small" onClick={handleToggle} edge="start">
          {isExpanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>
        <ListItemIcon sx={{ minWidth: 32, ml: 1 }}>
          <FolderIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={`${node.code} - ${node.name}`}
          secondary={node.type}
          slotProps={{
            primary: { variant: "body2" },
            secondary: { variant: "caption" },
          }}
        />
      </ListItemButton>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        {isLoading ? (
          <CircularProgress size={16} sx={{ ml: level * 2 + 4 }} />
        ) : (
          children?.map((child) => (
            <LocationTreeNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              onSelectEquipment={onSelectEquipment}
              level={level + 1}
            />
          ))
        )}

        {isExpanded && EQUIPMENT_LOCATION_TYPES.includes(node.type as any) && (
          <LocationEquipmentList
            locationId={node.id}
            onSelectEquipment={onSelectEquipment}
            level={level + 1}
          />
        )}
      </Collapse>
    </>
  );
};

export default React.memo(LocationTreeNode);
