import { useNavigate } from "react-router";
import { Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import LocationTreeView from "@/presentation/components/locations/LocationTreeView";
import PageContainer from "@/presentation/components/PageContainer";
import type { EquipmentListItemDto } from "@/domain/equipment/EquipmentTypes";

export default function LocationsPage() {
  const navigate = useNavigate();

  const handleSelectLocation = (location: any) => {
    navigate(`/locations/${location.id}`);
  };

  const handleSelectEquipment = (equipment: EquipmentListItemDto) => {
    navigate(`/equipment/${equipment.id}`);
  };

  return (
    <PageContainer
      title="Locations"
      breadcrumbs={[{ title: "Locations" }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Can requiredPermissions={[Permissions.Locations.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/locations/new")}
            >
              Create Location
            </Button>
          </Can>
        </Stack>
      }
    >
      <LocationTreeView
        onSelectLocation={handleSelectLocation}
        onSelectEquipment={handleSelectEquipment}
      />
    </PageContainer>
  );
}
