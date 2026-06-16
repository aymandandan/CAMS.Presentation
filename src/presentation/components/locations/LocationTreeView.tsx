import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useLocations } from "@/application/hooks/locations/useLocations";
import { LocationType } from "@/domain/locations/LocationTypes";
import LocationTreeNode from "./LocationTreeNode";
import type { LocationDto } from "@/domain/locations/LocationTypes";
import type { EquipmentListItemDto } from "@/domain/equipment/EquipmentTypes";

interface LocationTreeViewProps {
  onSelectLocation?: (location: LocationDto) => void;
  onSelectEquipment?: (equipment: EquipmentListItemDto) => void;
}

const LocationTreeView: React.FC<LocationTreeViewProps> = ({
  onSelectLocation,
  onSelectEquipment,
}) => {
  const { data, isLoading, error } = useLocations({
    type: LocationType.Project,
    page: 1,
    pageSize: 100,
    isPagingEnabled: false,
  });

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Failed to load projects.</Typography>;
  if (!data) return <Typography>No data received.</Typography>;

  const projects = data.items ?? [];
  if (projects.length === 0)
    return <Typography>No top-level projects found.</Typography>;

  return (
    <Box>
      {projects.map((project) => (
        <LocationTreeNode
          key={project.id}
          node={project}
          onSelect={onSelectLocation}
          onSelectEquipment={onSelectEquipment}
        />
      ))}
    </Box>
  );
};

export default React.memo(LocationTreeView);
